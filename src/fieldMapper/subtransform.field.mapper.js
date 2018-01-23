'use strict'

import Promise from 'bluebird'

import { FieldMapper } from './field.mapper'

/**
 * transform the field on the instance, using another transformer. This can be used when transforming
 * eargerly loaded relations on an instance ie. Family -> Person or obviously values
 * we would like to transform using a prebuilt transform. In other words, it doesn't
 * have to be an Instance.
 *
 * If the value being transformed is an Instance, we call its
 * get() method to invoke all getters on fields and strip other sequelize stuff off of
 * the data before transforming it
 *
 * @param {String} transformKey - the key to locate the transform in the transformer registry
 * @param {FieldPermissionLvl} permission - the permission to bind to the
 * transformer function on the dto
 */
class SubTransformFieldMapper extends FieldMapper {
  constructor (transformKey, permission) {
    super()
    this.transformer = null
    this.transformKey = transformKey
    this.permission = permission
  }

  builder (instance, key, isList) {
    // Transformer binds once at runtime (lazy load and cache)
    if (!this.transformer) {
      const { registry } = require('../index') // transformer registry
      this.transformer = registry.getTransformer(this.transformKey)
    }
    if (isList) {
      let list = instance[key]
      if (!list) {
        return Promise.resolve(list)
      }
      return Promise.map(list, (cur) => {
        // check if value at this key is another Instance and must call get
        if (typeof cur.get === 'function') {
          return this.transformer.transform(this.permission, cur.get())
        }
        return this.transformer.transform(this.permission, cur)
      })
    }
    // Key may not be on the instance
    if (!instance[key]) {
      return Promise.resolve(instance[key])
    }

    // check if value at this key is another Instance and must call get
    if (typeof instance[key].get === 'function') {
      return this.transformer.transform(this.permission, instance[key].get())
    }
    return this.transformer.transform(this.permission, instance[key])
  }
}

export { SubTransformFieldMapper }
