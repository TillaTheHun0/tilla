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
    const self = this

    let dto = {}
    let transformations = Promise.map(Object.keys(this.mapping), function (dtoKey) {
      return self.mapping[dtoKey].transform(permission, instance).then(function (value) {
        if (value !== undefined) {
          dto[dtoKey] = value
        }
      })
    })

    let defaultsSet = new Promise(function (resolve, reject) {
      if (!self.hasDefault) {
        resolve()
      }
      // Attach any defaulted attributes to Dto
      if (self.defaultMask === PASSTHROUGH) {
        Object.keys(self.defaultAttributes).forEach(function (key) {
          if (!self.mapping[key]) {
            dto[key] = instance[key]
          }
        })
        resolve()
      }

      // Run each default attribute through provided builder
      if (self.defaultMask === BUILD_WITH) {
        return Promise.map(self.defaultAttributes, function (key) {
          if (!self.mapping[key]) {
            return this.defaultBuilder(instance, key).then(function (value) {
              dto[key] = value
            })
          }
        }).then(resolve).catch(reject)
      }
      reject(new Error('No Default Masking Set'))
    })

    // await transformations to finish before dto is returned
    return Promise.join(transformations, defaultsSet, function () {
      return dto
    })
  }
  /**
   * @deprecated
   * @param {FieldPermissionLvl} permission
   * @param {Array<Instance>} instances
   */
  transformAsList (permission, instances) {
    return Promise.map(instances, function (instance) {
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
