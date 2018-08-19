'use strict'

import { expect } from 'chai'

import { registry, Transformer } from '../../src'

function registerTransformer () {
  let transformer = new Transformer({})

  registry.register('key', transformer)

  expect(registry.registry['key']).to.be.equal(transformer)
}

function getTransformer () {
  let transformer = new Transformer({})

  registry.register('key', transformer)

  expect(registry.getTransformer('key')).to.be.equal(transformer)
  expect(registry.transformer('key')).to.be.equal(transformer)
}

function clearRegistry () {
  let transformer = new Transformer({})

  registry.register('key', transformer)

  expect(registry.registry['key']).to.be.equal(transformer)

  registry.clear()

  expect(registry.registry).to.be.eql({})
}

export {
  registerTransformer,
  getTransformer,
  clearRegistry
}
