
import { expect } from 'chai'
import { CustomFieldMapper } from '../../src/fieldMapper'

function wrapsBuilder () {
  const customMapper = new CustomFieldMapper((instance, key, isList) => {
    const value = instance[key]
    if (isList) {
      return value + 2
    }
    return value + 1
  })

  const obj = {
    value: 1
  }

  let result = customMapper.builder(obj, 'value', false)

  expect(customMapper._builder).to.not.be.equal(null)

  expect(result).to.be.equal(2)

  result = customMapper.builder(obj, 'value', true)

  expect(result).to.be.equal(3)
}

function wrapsInPromise (done) {
  const customMapper = new CustomFieldMapper((instance, key, isList) => {
    const value = instance[key]
    if (isList) {
      return value + 2
    }
    return value + 1
  })

  const obj = {
    value: 1
  }

  const result = customMapper.map(obj, 'value')

  result.then((value) => {
    expect(value).to.be.equal(2)
    done()
  })
}

function callsGetOnInstance (done) {
  const customMapper = new CustomFieldMapper((instance, key, isList) => {
    const value = instance[key]
    if (isList) {
      return value + 2
    }
    return value + 1
  })

  const obj = {
    get: () => {
      return {
        value: 1
      }
    }
  }

  const result = customMapper.map(obj, 'value')

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
