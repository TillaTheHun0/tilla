
import { registry } from './registry'
import { promiseMap } from './utils'

const PASSTHROUGH = 'PASSTHROUGH'
const BUILD_WITH = 'BUILD_WITH'

/**
 * This is the main class of Tilla. To use it, just import it
 *
 * ```js
 * import { Transformer } = from 'tilla'
 * ```
 *
 * @class Transformer
 */

/**
 * #### Example usage
 *
 * ```javascript
 *
 * import { fieldDelegate, Transformer } from 'tilla'
 *
 * let fd = fieldDelegate()
 *
 * // with just mapping object
 * let transformer = new Transformer({
 *   name: fd().always().buildWith((src) => {
 *    return `${src.firstName} ${src.lastName}`
 *  }),
 *  city: fd('homeCity').always().passthrough()
 *  state: fd('address').always().buildWith((src, key) => {
 *    let address = src[key]
 *    return address ? address.state : address
 *  })
 * })
 *
 * // with registry key and mapping object
 * let transformer = new Transformer('registryKey', {
 *   name: fd().always().buildWith((src) => {
 *    return `${src.firstName} ${src.lastName}`
 *  }),
 *  city: fd('homeCity').always().passthrough()
 *  state: fd('address').always().buildWith((src, key) => {
 *    let address = src[key]
 *    return address ? address.state : address
 *  })
 * })
 * ```
 *
 * @name Transformer
 * @constructor
 *
 * @param {String | Object} if a string the key to use to register this transformer in the internal Transformer registry. If it's an object, it will be used as a mapping object
 * @param {Object} the mapping object, if a registry key is provided as the first argument
 **/

class Transformer {
  /**
   * @param {String | Object} if a string the key to use to register this transformer in the internal Transformer registry. If it's an object, it will be used as a mapping object
   * @param {Object} the mapping object, if a registry key is provided as the first argument
   */
  constructor (registryName, mapping) {
    if (typeof registryName === 'string') {
      // add to registry
      registry.register(registryName, this)
      this.mapping = mapping || {}
    } else {
      // only creating transformer, but not adding to mapping
      mapping = registryName
      this.mapping = mapping || {}
    }
    this.defaultBuilder = undefined
    this.defaultMask = undefined
  }

  /**
   * Perform the transformation at the provided permission level for each field
   * provided in the mapping. If any defaultAttributes and making is provided,
   * it will transform all defaultAttributes use the defaultMasking method.
   *
   * @param {String} permission - The permission level to perform the transformation
   * @param {Object} instance - the source object
   *
   * @return {Promise} a Promise that resolves to the transformed object
   */
  transform (permission, instance) {
    const dto = {}

    const doTransform = async (permission, instance) => {
      const transformations = promiseMap(Object.keys(this.mapping), dtoKey => {
        return this.mapping[dtoKey].transform(permission, instance).then((value) => {
          if (value !== undefined) {
            dto[dtoKey] = value
          }
        })
      })

      const defaultsSet = new Promise((resolve, reject) => {
        if (!this.hasDefault) {
          resolve()
        }
        // No attributes specified
        if (!this.defaultAttributes || !this.defaultAttributes.length) {
          return resolve()
        }

        // Attach any defaulted attributes to Dto
        if (this.defaultMask === PASSTHROUGH) {
          this.defaultAttributes.forEach((key) => {
            if (!this.mapping[key]) {
              dto[key] = instance[key]
            }
          })
          resolve()
        }

        // Run each default attribute through provided builder
        if (this.defaultMask === BUILD_WITH) {
          return promiseMap(this.defaultAttributes, (key) => {
            if (!this.mapping[key]) {
              return (
                async () => this.defaultBuilder(instance, key))().then(value => {
                dto[key] = value
              })
            }
          }).then(resolve).catch(reject)
        }
        reject(new Error('No Default Masking Set'))
      })

      // await transformations to finish before dto is returned
      return Promise.all([transformations, defaultsSet])
        .then(() => dto)
    }

    // curry
    if (!instance) {
      return instance => doTransform(permission, instance)
    }

    return doTransform(permission, instance)
  }

  /**
   * Specify attributes to transform by default. This allows whitelisting any attributes.
   *
   * @param {Array<String>} attributes - array of attribute names
   * to transform by default
   */
  byDefault (attributes) {
    this.defaultAttributes = attributes
    this.hasDefault = true
    return this
  }

  /**
   * Set the defaultMask for each field in defaultAttributes to a PassthroughFieldMapper
   *
   * @return {Transformer} this instance, so that calls can be chained
   */
  PASSTHROUGH () {
    if (!this.hasDefault) {
      throw new Error('Default flag not set')
    }
    this.defaultMask = PASSTHROUGH
    return this
  }

  /**
   * Set the defaultMask for each field in defaultAttributes to a CustomFieldMapper using the provided
   * builder
   *
   * @param {function (Object, string, boolean):Transformer} builder - the builder function
   * to use in the CustomFieldMapper
   *
   * @return {Transformer} this instance, so that calls can be chained
   */
  BUILD_WITH (builder) {
    if (!this.hasDefault) {
      throw new Error('Default flag not set')
    }
    this.defaultMask = BUILD_WITH
    this.defaultBuilder = builder
    return this
  }

  /**
   * Creates a new Transformer, derived from this Transformer.
   * the passed in mapper will be merged into this transformer's
   * mapping.
   *
   * @param {Object} mapping - the mapping object to merge
   * with this transformers mapper
   *
   * @return {Transformer} a new Tranformer with the merged mapping
   */
  extend (mapping) {
    const mergedMapping = { ...this.mapping, ...mapping }
    const transformer = new Transformer(mergedMapping)
    transformer.defaultBuilder = this.defaultBuilder
    transformer.defaultMask = this.defaultMask
    transformer.defaultAttributes = this.defaultAttributes
    return transformer
  }
}

export { Transformer }
