'use strict'

describe('Transformer', () => {
  let tests = require('./transformer')

  it('should set flag and default attributes', tests.byDefault)
  it('should set to passthrough by default', tests.passthrough)
  it('should throw err on passthrough when default flag is not set', tests.passthroughErr)
  it('should set to build_with by default and set builder', tests.buildWith)
  it('should throw err on build_with when default flag is not set', tests.buildWithErr)
})
