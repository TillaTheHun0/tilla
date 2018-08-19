'use strict'

describe('FieldMapper', () => {
  let fieldMapperTests = require('./fieldMapper/field.mapper.spec')

  it('should throw an error when build is not implemented', fieldMapperTests.throwNotImplementedError)

  describe('PassthroughMapper', () => {
    let tests = require('./fieldMapper/passthrough.mapper.spec')

    it('should return the same value and wrap in a Promise', tests.wrapsInPromise)
  })

  describe('CustomFieldMapper', () => {
    let tests = require('./fieldMapper/custom.field.mapper.spec')

    it('should execute the builder function provided', tests.wrapsBuilder)
    it('should wrap the result of the builder in a Promise', tests.wrapsInPromise)
    it('should call get() on instance', tests.callsGetOnInstance)
  })

  describe('SubtransformerFieldMapper', () => {
    let tests = require('./fieldMapper/subtransform.field.mapper.spec')

    it('should lazily set the transformer from registry', tests.setTransformerFromRegistry)
    it('should lazily set the transformer directly', tests.setTransformerDirectly)
    it('should lazily set the transformer from thunk that returns Promise', tests.setTransformerFromThunk)
    it('should throw error when no transformer can be set', tests.setTransformerErr)
    it('should set the public field, but not the private field', tests.setPublicField)
    it('should set both the public field and the private field', tests.setPrivateField)
    it('should transform each instance in list with subtransform', tests.transformList)
    it('should resolve falsey values to themselves', tests.resolveFalsey)
    it('should call get() on sub instance', tests.callGet)
    it('should call get() on each sub instance in list', tests.callGetOnList)
  })
})
