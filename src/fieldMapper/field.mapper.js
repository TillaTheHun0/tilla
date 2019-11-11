
class FieldMapper {
  /**
   * Call the builder passing in the instance, key on the instance to transform and
   * the isList flag. Calls to the builder are wrapped in a Promise to ensure a Promise
   * is always returned.
   *
   * @param {Object} instance - the source object.
   * @param {String} [key] - the key to provide to the builder.
   * @param {boolean} [isList] - whether the value being transformed should be iterated into the builder.
   *
   * @return {Promise} the transformed value.
   */
  map (instance, key, isList) {
    if (typeof instance.get === 'function') {
      return Promise.resolve(this.builder(instance.get(), key, isList))
    }
    return Promise.resolve(this.builder(instance, key, isList))
  }

  /**
   * This method must be implemented by all mappers. Otherwise, an error is thrown
   *
   * @throws {Error} throw when this method isn't implemented
   */
  builder () {
    return Promise.reject(new Error('This Must Be Implemented'))
  }
}

export { FieldMapper }
