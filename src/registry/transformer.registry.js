'use strict'

/**
 * A registry that can be used to register all Transformers. This registry
 * is tied directly into FieldMapperDelegates and can be used to perform
 * subtransformations
 */
class TransformerRegistry {
  /**
   * @param {string} [debuggerName] - the name to use for debug logging
   */
  constructor (debuggerName) {
    this.registry = {}
    this.debug = require('debug')(debuggerName || 'transformer.registry')
  }

  /**
   * Register the Transformer at the provided the key in the registry
   *
   * @param {string} key - the key to use to register the Transformer.
   * @param {Transformer} transformer - the Transformer instance.
   */
  register (key, transformer) {
    this.debug(`Registering transform at key: ${key}`)
    this.registry[key] = transformer
  }

  /**
   * Retrieve the Transformer at the provided the key in the registry
   *
   * @param {string} key - the key that references the Transformer in the registry
   *
   * @return {Transformer | undefined} the transformer
   */
  getTransformer (key) {
    return this.registry[key]
  }

  /**
   * Alias for getTransformer()
   */
  transformer (key) {
    return this.getTransformer(key)
  }

  /**
   * Clear all Transformers from the registry
   */
  clear () {
    delete this.registry
    this.registry = {}
  }
}

export { TransformerRegistry }
