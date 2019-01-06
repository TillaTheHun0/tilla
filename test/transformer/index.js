'use strict'

import { expect } from 'chai'

import { Transformer, fieldDelegate, Permissions, registry } from '../../src'

let delegate = fieldDelegate()

function byDefault () {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  })

  expect(transformer.defaultAttributes).to.be.equal(undefined)
  expect(transformer.hasDefault).to.be.equal(undefined)

  transformer.byDefault(['field1', 'field2'])

  expect(transformer.defaultAttributes).has.members(['field1', 'field2'])
  expect(transformer.hasDefault).to.be.equal(true)
}

function passthrough () {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  })

  transformer.byDefault().PASSTHROUGH()

  expect(transformer.defaultMask).to.be.eql('PASSTHROUGH')
}

function passthroughErr () {
  try {
    let transformer = new Transformer({
      value: delegate('value').always().passthrough(),
      secret: delegate('secret').atOrAbovePrivate().passthrough()
    })
    transformer.PASSTHROUGH()
  } catch (err) {
    expect(err.message).to.be.eql('Default flag not set')
  }
}

function buildWith () {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
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
      value: delegate('value').always().passthrough(),
      secret: delegate('secret').atOrAbovePrivate().passthrough()
    })
    transformer.BUILD_WITH(() => {})
  } catch (err) {
    expect(err.message).to.be.eql('Default flag not set')
  }
}

function transformNoDefault (done) {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  })

  let obj = {
    value: 1,
    secret: 100,
    otherValue: 200 // field ignored by transformer
  }

  transformer.transform(Permissions.PRIVATE, obj).then((dto) => {
    expect(dto.value).to.be.equal(1)
    expect(dto.secret).to.be.equal(100)
    expect(dto.otherValue).to.be.equal(undefined)
    done()
  })
}

function transformWithDefault (done) {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  }).byDefault(['otherValue']).PASSTHROUGH()

  let obj = {
    value: 1,
    secret: 100,
    otherValue: 200
  }

  transformer.transform(Permissions.PRIVATE, obj).then((dto) => {
    expect(dto.value).to.be.equal(1)
    expect(dto.secret).to.be.equal(100)
    expect(dto.otherValue).to.be.equal(200)
    done()
  })
}

function transformWithDefaultNoAttributes (done) {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  }).byDefault().PASSTHROUGH()

  let obj = {
    value: 1,
    secret: 100,
    otherValue: 200 // field ignored by transformer
  }

  transformer.transform(Permissions.PRIVATE, obj).then((dto) => {
    expect(dto.value).to.be.equal(1)
    expect(dto.secret).to.be.equal(100)
    expect(dto.otherValue).to.be.equal(undefined)
    done()
  })
}

function transformWithDefaultBuildWith (done) {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  }).byDefault(['otherValue']).BUILD_WITH((instance, key) => {
    return instance[key] + 1
  })

  let obj = {
    value: 1,
    secret: 100,
    otherValue: 200
  }

  transformer.transform(Permissions.PRIVATE, obj).then((dto) => {
    expect(dto.value).to.be.equal(1)
    expect(dto.secret).to.be.equal(100)
    expect(dto.otherValue).to.be.equal(201)
    done()
  })
}

function transformWithDefaultBuildWithNoAttributes (done) {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  }).byDefault().BUILD_WITH((instance, key) => {
    return instance[key] + 1
  })

  let obj = {
    value: 1,
    secret: 100,
    otherValue: 200
  }

  transformer.transform(Permissions.PRIVATE, obj).then((dto) => {
    expect(dto.value).to.be.equal(1)
    expect(dto.secret).to.be.equal(100)
    expect(dto.otherValue).to.be.equal(undefined)
    done()
  })
}

function transformWithDefaultNoMaskErr (done) {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  }).byDefault(['otherValue']) // missing mask here

  let obj = {
    value: 1,
    secret: 100,
    otherValue: 200
  }

  transformer.transform(Permissions.PRIVATE, obj).catch(() => {
    done()
  })
}

function extend (done) {
  let transformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  })

  let extension = transformer.extend({
    value: delegate('value').atOrAboveAdmin().passthrough(),
    otherValue: delegate('otherValue').always().buildWith((instance, key) => {
      return instance[key] + 1
    }),
    computed: delegate().always().buildWith(() => {
      return 500
    })
  })

  let obj = {
    value: 1,
    secret: 100,
    otherValue: 200
  }

  extension.transform(Permissions.PRIVATE, obj).then((dto) => {
    expect(dto.value).to.be.equal(undefined)
    expect(dto.secret).to.be.equal(100)
    expect(dto.computed).to.be.equal(500)
    expect(dto.otherValue).to.be.equal(201)
    done()
  })
}

function register (done) {
  let key = 'awesomeTransformer'
  // adds transformer to internal registry
  let awesomeTransformer = new Transformer(key, { //eslint-disable-line
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').atOrAbovePrivate().passthrough()
  })

  expect(registry.getTransformer(key)).to.be.equal(awesomeTransformer)

  let transformer = new Transformer({
    field: delegate('field').always().passthrough(),
    sub: delegate('sub').always().subTransform(key)
  })

  let obj = {
    field: 'awesome',
    sub: {
      value: 1,
      secret: 'dirty secret'
    }
  }

  transformer.transform(Permissions.PUBLIC, obj).then(dto => {
    expect(dto.field).to.be.equal(obj.field)
    expect(dto.sub.value).to.be.equal(obj.sub.value)
    expect(dto.sub.secret).to.be.equal(undefined)
    done()
  })
}

export {
  byDefault,
  passthrough,
  passthroughErr,
  buildWith,
  buildWithErr,
  transformNoDefault,
  transformWithDefault,
  transformWithDefaultNoAttributes,
  transformWithDefaultBuildWith,
  transformWithDefaultBuildWithNoAttributes,
  transformWithDefaultNoMaskErr,
  extend,
  register
}
