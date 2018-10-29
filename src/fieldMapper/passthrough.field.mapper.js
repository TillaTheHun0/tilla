'use strict'

import { FieldMapper } from './field.mapper'

/**
 * Mapper that just returns the value at the specified key
 * on the provided source object
 */
class PassthroughFieldMapper extends FieldMapper {
  /**
   * Simply resolve the value at this key on the source object.
   *
   * @param {Object} instance - the source object.
   * @param {String} key - the key on the source whose value is being transformed.
   *
   * @return {Promise} a Promise that resolves to the value at that key on the source object.
   */
  builder (instance, key) {
    return Promise.resolve(instance[key])
  }
}

export { PassthroughFieldMapper }
