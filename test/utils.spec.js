'use strict'

describe('Utils', () => {
  const tests = require('./utils')

  it('should return a FieldDelegate instance with source and empty map', tests.fieldDelegate)
  it('should return keys of rawAttributes', tests.getColumnsFromModel)
  it('should return keys of obj', tests.getKeys)
})
