'use strict'

describe('Transformer', () => {
  let tests = require('./transformer')

  it('should set flag and default attributes', tests.byDefault)
  it('should set to passthrough by default', tests.passthrough)
  it('should throw err on passthrough when default flag is not set', tests.passthroughErr)
  it('should set to build_with by default and set builder', tests.buildWith)
  it('should throw err on build_with when default flag is not set', tests.buildWithErr)
  it('should transform the object and ignore values not specified', tests.transformNoDefault)
  it('should transform the object and specified default fields as specified', tests.transformWithDefault)
  it('should transform the object and ignore values not specified in default attributes', tests.transformWithDefaultNoAttributes)
  it('should transform the object and specified default fields with the default builder', tests.transformWithDefaultBuildWith)
  it('should transform the object and default custom builder and ignore values not specified in default attributes',
    tests.transformWithDefaultBuildWithNoAttributes)
  it('should throw an error if no default masking is set', tests.transformWithDefaultNoMaskErr)
  it('should extend the transformer and merge the maps', tests.extend)
  it('should register the transformer in the registry automatically', tests.register)
  it('should curry the arguments provided when calling transform()', tests.curryArgs)
})
