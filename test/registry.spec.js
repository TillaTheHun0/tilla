'use strict'

describe('Registry', () => {
  const tests = require('./registry')

  it('should register the transformer', tests.registerTransformer)
  it('should retrieve the transformer', tests.getTransformer)
  it('should clear the registry', tests.clearRegistry)
})
