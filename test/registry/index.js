
import { expect } from 'chai'

import { registry, Transformer } from '../../src'

function registerTransformer () {
  const transformer = new Transformer({})

  registry.register('key', transformer)

  expect(registry.registry.key).to.be.equal(transformer)
}

function getTransformer () {
  const transformer = new Transformer({})

  registry.register('key', transformer)

  expect(registry.getTransformer('key')).to.be.equal(transformer)
  expect(registry.transformer('key')).to.be.equal(transformer)
}

function clearRegistry () {
  const transformer = new Transformer({})

  registry.register('key', transformer)

  expect(registry.registry.key).to.be.equal(transformer)

  registry.clear()

  expect(registry.registry).to.be.eql({})
}

export {
  registerTransformer,
  getTransformer,
  clearRegistry
}
