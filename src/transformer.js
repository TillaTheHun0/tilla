'use strict'

import Promise from 'bluebird'
import { registry } from './registry'

const PASSTHROUGH = 'PASSTHROUGH'
const BUILD_WITH = 'BUILD_WITH'

class Transformer {
  /**
   * @param {Object} mapping - the mapping object where each key is a FieldMapperDelegate instance
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

  addFieldMapping (key, fieldMapperDelegate) {
    this.mapping[key] = fieldMapperDelegate
  }

  /**
   * Perform the transformation at the provided permission level for each field
   * provided in the mapping. If any defaultAttributes and making is provided,
   * it will transform all defaultAttributes use the defaultMasking method.
   *
   * @param {string} permission - The permission level to perform the transformation
   * @param {Object} instance - the source object
   *
   * @return {Promise} a Promise that resolves to the transformed object
   */
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
        return Promise.map(this.defaultAttributes, (key) => {
          if (!this.mapping[key]) {
            return Promise.method(() => this.defaultBuilder(instance, key))().then(value => {
              dto[key] = value
            })
          }
        }).then(resolve).catch(reject)
      }
      reject(new Error('No Default Masking Set'))
    })

    // await transformations to finish before dto is returned
    return Promise.join(transformations, defaultsSet, () => dto)
  }

  /**
   * Specify attributes to transform by default. This allows whitelisting any attributes.
   *
   * @param {Array<string>} attributes - array of attribute names
   * to transform by default
   */
  byDefault (attributes) {
    this.defaultAttributes = attributes
    this.hasDefault = true
    return this
  }

  /**
   * Set the defaultMask for each field in defaultAttributes to a PassthroughFieldMapper
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
   * @param {function (instance: Object, key: string, isList: boolean)} builder - the builder function
   * to use in the CustomFieldMapper
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
    let mergedMapping = { ...this.mapping, ...mapping }
    let transformer = new Transformer(mergedMapping)
    transformer.defaultBuilder = this.defaultBuilder
    transformer.defaultMask = this.defaultMask
    transformer.defaultAttributes = this.defaultAttributes
    return transformer
  }
}

export { Transformer }
