'use strict'

import { expect } from 'chai'
import { CustomFieldMapper } from '../../src/fieldMapper'

function wrapsBuilder () {
  let customMapper = new CustomFieldMapper((instance, key, isList) => {
    let value = instance[key]
    if (isList) {
      return value + 2
    }
    return value + 1
  })

  let obj = {
    value: 1
  }

  let result = customMapper.builder(obj, 'value', false)

  expect(result).to.be.equal(2)

  result = customMapper.builder(obj, 'value', true)

  expect(result).to.be.equal(3)
}

function wrapsInPromise (done) {
  let customMapper = new CustomFieldMapper((instance, key, isList) => {
    let value = instance[key]
    if (isList) {
      return value + 2
    }
    return value + 1
  })

  let obj = {
    value: 1
  }

  let result = customMapper.map(obj, 'value')

  result.then((value) => {
    expect(value).to.be.equal(2)
    done()
  })
}

function callsGetOnInstance (done) {
  let customMapper = new CustomFieldMapper((instance, key, isList) => {
    let value = instance[key]
    if (isList) {
      return value + 2
    }
    return value + 1
  })

  let obj = {
    get: () => {
      return {
        value: 1
      }
    }
  }

  let result = customMapper.map(obj, 'value')

  result.then((value) => {
    expect(value).to.be.equal(2)
    done()
  })
}

export {
  wrapsBuilder,
  wrapsInPromise,
  callsGetOnInstance
}
