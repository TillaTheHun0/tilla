'use strict'

import Promise from 'bluebird'

const PASSTHROUGH = 'PASSTHROUGH'
const BUILD_WITH = 'BUILD_WITH'

class Transformer {
  constructor (mapping) {
    this.mapping = mapping || {}
    this.defaultBuilder = undefined
    this.defaultMask = undefined
  }

  addFieldMapping (key, fieldMapperDelegate) {
    this.mapping[key] = fieldMapperDelegate
  }

  transform (permission, instance) {
    let dto = {}
    let transformations = Promise.map(Object.keys(this.mapping), (dtoKey) => {
      return this.mapping[dtoKey].transform(permission, instance).then((value) => {
        if (value !== undefined) {
          dto[dtoKey] = value
        }
      })
    })

    let defaultsSet = new Promise((resolve, reject) => {
      if (!this.hasDefault) {
        resolve()
      }
      // Attach any defaulted attributes to Dto
      if (this.defaultMask === PASSTHROUGH) {
        if (!this.defaultAttributes || !this.defaultAttributes.length) {
          return resolve()
        }
        this.defaultAttributes.forEach((key) => {
          if (!this.mapping[key]) {
            dto[key] = instance[key]
          }
        })
        resolve()
      }

      // Run each default attribute through provided builder
      if (this.defaultMask === BUILD_WITH) {
        return Promise.map(this.defaultAttributes, (key) => {
          if (!this.mapping[key]) {
            return this.defaultBuilder(instance, key).then((value) => {
              dto[key] = value
            })
          }
        }).then(resolve).catch(reject)
      }
      reject(new Error('No Default Masking Set'))
    })

    // await transformations to finish before dto is returned
    return Promise.join(transformations, defaultsSet, () => {
      return dto
    })
  }
  /**
   * @deprecated
   * @param {FieldPermissionLvl} permission
   * @param {Array<Instance>} instances
   */
  transformAsList (permission, instances) {
    return Promise.map(instances, (instance) => {
      if (typeof instance.get === 'function') {
        return this.transform(permission, instance.get())
      }
      return this.transform(permission, instance)
    })
  }

  /**
   * Specify attributes to transform by default. This allows us to
   * whitelist any attributes. This is great for excluding association
   * records that have been attached to the instance.
   *
   * @param {Array} attributes - array of attribute names
   * to transform by default
   */
  byDefault (attributes) {
    this.defaultAttributes = attributes
    this.hasDefault = true
    return this
  }

  PASSTHROUGH () {
    if (!this.hasDefault) {
      throw new Error('Default flag not set')
    }
    this.defaultMask = PASSTHROUGH
    return this
  }

  BUILD_WITH (builder) {
    if (!this.hasDefault) {
      throw new Error('Default flag not set')
    }
    this.defaultMask = BUILD_WITH
    this.defaultBuilder = builder
    return this
  }

  /**
   * Creates a new Transformer, derived from this transformer.
   * the passed in mapper will be merged into this transformer
   * mapping.
   *
   * @param {Object} mapping - the mapping object to merge
   * with this transformers mapper
   */
  extend (mapping) {
    let mergedMapping = Object.assign({}, this.mapping, mapping)
    let transformer = new Transformer(mergedMapping)
    transformer.defaultBuilder = this.defaultBuilder
    transformer.defaultMask = this.defaultMask
    transformer.defaultAttributes = this.defaultAttributes
    return transformer
  }
}

export { Transformer }
