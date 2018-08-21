'use strict'

import Promise from 'bluebird'

import { FieldMapper } from './field.mapper'
import { Transformer } from '../transformer'

/**
 * A FieldMapper that uses a Transformer to map the field
 */
class SubTransformFieldMapper extends FieldMapper {
  /**
  * @param {string | Transformer | function (): Promise<Transformer> } transformKey -
  *  If a string, it should be a key to locate the Transformer in the TransformerRegistry
  *  - The Transformer instance to use to perform the transformation
  *  - A function which returns a Promise<Transformer>
  * @param {FieldPermissionLvl} permission - the permission to bind to the transformer function on the dto.
  */
  constructor (transformKey, permission) {
    super()
    this.transformer = null
    this.transformKey = transformKey
    this.permission = permission
  }

  /**
  * Transform the field on the instance, using another {@link Transformer}. This can be used when transforming
  * eargerly loaded relations on an instance ie. Family -> Person or obviously values
  * we would like to transform using a prebuilt {@link Transformer}.
  *
  * If the value being transformed is an Instance (Sequelize), we call its
  * get() method to invoke all getters on fields and strip other Sequelize stuff off of
  * the data before transforming it. @see http://docs.sequelizejs.com/class/lib/model.js~Model.html#instance-method-get
  *
  * @param {Object} instance - the source object.
  * @param {?string} key - a key on the source object that can be used to retrieve the field value.
  * @param {?boolean} isList - whether the value being transformed should be iterated into the builder.
  *
  * @return {Promise} a Promise that resolves to the transformed value.
  */
  builder (instance, key, isList) {
    // Transformer binds once at runtime
    return new Promise((resolve) => {
      if (!this.transformer) {
        resolve(this._setTransformer())
        return
      }
      resolve()
    }).then(() => {
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
    })
  }

  _setTransformer () {
    // Using registry
    if (typeof this.transformKey === 'string') {
      const { registry } = require('../index') // kind of weird
      this.transformer = registry.getTransformer(this.transformKey)
      return Promise.resolve()
    }

    // Passed Transformer directly
    if (this.transformKey instanceof Transformer) {
      this.transformer = this.transformKey
      return Promise.resolve()
    }

    // Passed thunk which returns Promise<Transformer>
    if (typeof this.transformKey === 'function') {
      return this.transformKey().then((transformer) => {
        this.transformer = transformer
      })
    }

    throw new Error('No transformKey provided')
  }
}

export { SubTransformFieldMapper }
