'use strict'

import { expect } from 'chai'

import { Transformer, utils } from '../../src'

function byDefault () {
  let transformer = new Transformer({
    value: utils.fieldDelegate('value').always().passthrough(),
    secret: utils.fieldDelegate('secret').restrictToPrivate().passthrough()
  })

  expect(transformer.defaultAttributes).to.be.equal(undefined)
  expect(transformer.hasDefault).to.be.equal(undefined)

  transformer.byDefault(['field1', 'field2'])

  expect(transformer.defaultAttributes).has.members(['field1', 'field2'])
  expect(transformer.hasDefault).to.be.equal(true)
}

function passthrough () {
  let transformer = new Transformer({
    value: utils.fieldDelegate('value').always().passthrough(),
    secret: utils.fieldDelegate('secret').restrictToPrivate().passthrough()
  })

  transformer.byDefault().PASSTHROUGH()

  expect(transformer.defaultMask).to.be.eql('PASSTHROUGH')
}

function passthroughErr () {
  try {
    let transformer = new Transformer({
      value: utils.fieldDelegate('value').always().passthrough(),
      secret: utils.fieldDelegate('secret').restrictToPrivate().passthrough()
    })
    transformer.PASSTHROUGH()
  } catch (err) {
    expect(err.message).to.be.eql('Default flag not set')
  }
}

function buildWith () {
  let transformer = new Transformer({
    value: utils.fieldDelegate('value').always().passthrough(),
    secret: utils.fieldDelegate('secret').restrictToPrivate().passthrough()
  })

  let builder = () => {
    console.log('my sweet builder')
  }

  transformer.byDefault().BUILD_WITH(builder)

  expect(transformer.defaultMask).to.be.eql('BUILD_WITH')
  expect(transformer.defaultBuilder).to.be.equal(builder)
}

function buildWithErr () {
  try {
    let transformer = new Transformer({
      value: utils.fieldDelegate('value').always().passthrough(),
      secret: utils.fieldDelegate('secret').restrictToPrivate().passthrough()
    })
    transformer.BUILD_WITH(() => {})
  } catch (err) {
    expect(err.message).to.be.eql('Default flag not set')
  }
}

export {
  byDefault,
  passthrough,
  passthroughErr,
  buildWith,
  buildWithErr
}
