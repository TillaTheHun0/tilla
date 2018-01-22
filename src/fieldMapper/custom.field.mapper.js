'use strict'

import { FieldMapper } from './field.mapper'

/**
 * Uses a custom builder to produce the value
 *
 * @param {Function} builder - the custom builder function. Must
 * take at least one argument (instance) and at most two arguments
 * (instance, key) instance being the instance undergoing transformation and key
 * being the src key on the instance, if needed. Builders must return a Promise.
 *
 * Sometimes the src key is not needed, in the case that the transformed
 * value is derived from multiple keys on the instance
 */
class CustomFieldMapper extends FieldMapper {
  constructor (builder) {
    super()
    // Wrap with Promise.method to ensure promise is returned
    this._builder = builder
  }
  builder (instance, key, isList) {
    return this._builder(instance, key, isList)
  }
}

export { CustomFieldMapper }
