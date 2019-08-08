'use strict'

const { expect } = require('chai')

const { utils } = require('../../src/utils')

const delegate = utils.fieldDelegate()

function fieldDelegate () {
  const key = 'someKey'
  const fieldDelegate = delegate(key)

  expect(fieldDelegate.sourceKey).to.be.eql(key)
  expect(fieldDelegate.delegate).to.be.eql({})
}

function getColumnsFromModel () {
  const obj = {
    rawAttributes: {
      a: 'some',
      b: 'value'
    }
  }

  const rawAttributesKeys = utils.getColumnsFromModel(obj)

  expect(rawAttributesKeys).to.be.an('array').and.have.members(['a', 'b'])
  expect(rawAttributesKeys.length).to.be.eql(2)
}

function getKeys () {
  const obj = {
    a: 'some',
    b: 'value'
  }

  const keys = utils.getKeys(obj)

  expect(keys.length).to.be.eql(2)
  expect(keys).to.be.an('array').and.to.have.members(['a', 'b'])
}

module.exports = {
  fieldDelegate,
  getColumnsFromModel,
  getKeys
}
