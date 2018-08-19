'use strict'

import { expect } from 'chai'

import { SubTransformFieldMapper } from '../../src/fieldMapper'
import { registry, Transformer, utils, FieldPermissionLvl } from '../../src'

let delegate = utils.fieldDelegate()

const subTransformerKey = 'subTransformer'

function setup () {
  registry.clear()
  let subTransformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').restrictToPrivate().passthrough()
  })

  // Add to registry
  registry.register(subTransformerKey, subTransformer)
}

function setTransformerFromRegistry (done) {
  setup()

  let subFieldTransformer = new SubTransformFieldMapper(subTransformerKey, FieldPermissionLvl.PUBLIC)

  let obj = {
    sub: {
      value: 1,
      secret: 100
    }
  }

  expect(subFieldTransformer.transformer).to.be.equal(null)

  subFieldTransformer.map(obj, 'sub').then(() => {
    expect(subFieldTransformer.transformer).to.be.equal(registry.getTransformer(subTransformerKey))
    done()
  })
}

function setTransformerDirectly (done) {
  let subTransformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').restrictToPrivate().passthrough()
  })

  let subFieldTransformer = new SubTransformFieldMapper(subTransformer, FieldPermissionLvl.PUBLIC)

  let obj = {
    sub: {
      value: 1,
      secret: 100
    }
  }

  subFieldTransformer.map(obj, 'sub').then(() => {
    expect(subFieldTransformer.transformer).to.be.equal(subTransformer)
    done()
  })
}

function setTransformerFromThunk (done) {
  let subTransformer = new Transformer({
    value: delegate('value').always().passthrough(),
    secret: delegate('secret').restrictToPrivate().passthrough()
  })

  let subFieldTransformer = new SubTransformFieldMapper(() => {
    return Promise.resolve(subTransformer)
  }, FieldPermissionLvl.PUBLIC)

  let obj = {
    sub: {
      value: 1,
      secret: 100
    }
  }

  subFieldTransformer.map(obj, 'sub').then(() => {
    expect(subFieldTransformer.transformer).to.be.equal(subTransformer)
    done()
  })
}

function setPublicField (done) {
  setup()

  let subFieldTransformer = new SubTransformFieldMapper(subTransformerKey, FieldPermissionLvl.PUBLIC)

  let obj = {
    sub: {
      value: 1,
      secret: 100
    }
  }

  subFieldTransformer.map(obj, 'sub').then((result) => {
    expect(result.value).to.be.equal(1)
    expect(result.secret).to.be.equal(undefined)
    done()
  })
}

function setPrivateField (done) {
  setup()

  let subFieldTransformer = new SubTransformFieldMapper(subTransformerKey, FieldPermissionLvl.PRIVATE)

  let obj = {
    sub: {
      value: 1,
      secret: 100
    }
  }

  subFieldTransformer.map(obj, 'sub').then((result) => {
    expect(result.value).to.be.equal(1)
    expect(result.secret).to.be.equal(100)
    done()
  })
}

function transformList (done) {
  setup()

  let subFieldTransformer = new SubTransformFieldMapper(subTransformerKey, FieldPermissionLvl.PRIVATE)

  let obj = {
    sub: [
      {
        value: 1,
        secret: 100
      },
      {
        value: 2,
        secret: 200
      }
    ]
  }

  subFieldTransformer.map(obj, 'sub', true).then((result) => {
    let [res1, res2] = result
    expect(res1.value).to.be.equal(1)
    expect(res1.secret).to.be.equal(100)

    expect(res2.value).to.be.equal(2)
    expect(res2.secret).to.be.equal(200)
    done()
  })
}

function callGet (done) {
  setup()

  let subFieldTransformer = new SubTransformFieldMapper(subTransformerKey, FieldPermissionLvl.PRIVATE)

  let obj = {
    sub: {
      get: () => {
        return {
          value: 1,
          secret: 100
        }
      }
    }
  }

  subFieldTransformer.map(obj, 'sub').then((result) => {
    expect(result.value).to.be.equal(1)
    expect(result.secret).to.be.equal(100)
    done()
  })
}

function callGetOnList (done) {
  setup()

  let subFieldTransformer = new SubTransformFieldMapper(subTransformerKey, FieldPermissionLvl.PRIVATE)

  let obj = {
    sub: [
      {
        get: () => {
          return {
            value: 1,
            secret: 100
          }
        }
      },
      {
        get: () => {
          return {
            value: 2,
            secret: 200
          }
        }
      }
    ]
  }

  subFieldTransformer.map(obj, 'sub', true).then((result) => {
    let [res1, res2] = result
    expect(res1.value).to.be.equal(1)
    expect(res1.secret).to.be.equal(100)

    expect(res2.value).to.be.equal(2)
    expect(res2.secret).to.be.equal(200)
    done()
  })
}

function resolveFalsey (done) {
  setup()

  let subFieldTransformer = new SubTransformFieldMapper(subTransformerKey, FieldPermissionLvl.PRIVATE)

  let obj = {
    sub: [
      {
        value: 1,
        secret: 100
      },
      {
        value: 2,
        secret: 200
      }
    ],
    false: false,
    null: null
  }

  subFieldTransformer.map(obj, 'invalidKey', true).then((result) => {
    expect(result).to.be.equal(undefined)
    return subFieldTransformer.map(obj, 'false')
  }).then((result) => {
    expect(result).to.be.equal(false)
    return subFieldTransformer.map(obj, 'null')
  }).then((result) => {
    expect(result).to.be.equal(null)
    done()
  })
}

export {
  setTransformerFromRegistry,
  setTransformerDirectly,
  setTransformerFromThunk,
  setPublicField,
  setPrivateField,
  transformList,
  resolveFalsey,
  callGet,
  callGetOnList
}
