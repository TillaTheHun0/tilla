'use strict'

class TransformerRegistry {
  constructor (debuggerName) {
    this.registry = {}
    this.debug = require('debug')(debuggerName || 'transformer.registry')
  }

  register (key, transformer) {
    this.debug(`Registering transform at key: ${key}`)
    this.registry[key] = transformer
  }

  getTransformer (key) {
    return this.registry[key]
  }

  transformer (key) {
    return this.getTransformer(key)
  }
}

export { TransformerRegistry }
