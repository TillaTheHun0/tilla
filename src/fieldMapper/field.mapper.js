'use strict'

import Promise from 'bluebird'

class FieldMapper {
  /**
   * Call the builder passing in the instance, key on the instance to transform and
   * the isList flag. Calls to the builder are wrapped in a Promise to ensure a Promise
   * is always returned.
   *
   * @param {Object} instance
   * @param {String} key
   * @param {Boolean} isList
   */
  map (instance, key, isList) {
    if (typeof instance.get === 'function') {
      return Promise.resolve(this.builder(instance.get(), key, isList))
    }
    return Promise.resolve(this.builder(instance, key, isList))
  }

  builder (instance, key, isList) {
    return Promise.reject(new Error('This Must Be Implemented'))
  }
}

export { FieldMapper }
