'use strict'

import Promise from 'bluebird'

class FieldMapper {
  map (instance, key, isList) {
    if (typeof instance.get === 'function') {
      return Promise.method(this.builder(instance.get(), key, isList))
    }
    return Promise.method(this.builder(instance, key, isList))
  }
  builder (instance, key, isList) {
    throw new Error('This Must Be Implemented')
  }
}

export { FieldMapper }
