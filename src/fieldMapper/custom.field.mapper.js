'use strict'

import { FieldMapper } from './field.mapper'

class CustomFieldMapper extends FieldMapper {
  /**
   * Uses a custom builder to produce the transformed value.
   * Sometimes the src key is not needed, ie. in the case that the transformed
   * value is derived from multiple keys on the instance
   *
   * @param {function (instance: Object, ?key: string, ?isList: boolean)} builder - the custom builder function.
   * Must take at least one argument (instance)
   */
  constructor (builder) {
    super()

    this._builder = builder
  }

  /**
   * @param {Object} instance - the source object.
   * @param {?string} key - a key on the source object that can be used to retrieve the field value.
   * @param {?boolean} isList - whether the value being transformed should be iterated into the builder.
   *
   * @return {Promise} a Promise that resolves to the transformed value.
   */
  builder (instance, key, isList) {
    return this._builder(instance, key, isList)
  }
}

export { CustomFieldMapper }
