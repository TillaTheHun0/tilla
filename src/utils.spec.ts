
import { utils } from './utils'
import { always } from './ruleBuilder'
import { passthrough } from './fieldMapper'

const delegate = utils.fieldDelegate()

describe('Utils', () => {
  it('should return a FieldDelegate instance with source and empty map', () => {
    const key = 'someKey'
    const fieldDelegate = delegate(key, always(passthrough()))

    expect(fieldDelegate.sourceKey).toBe(key)
    expect(fieldDelegate.delegateMap).toBeDefined()
  })

  it('should return keys of rawAttributes', () => {
    const obj = {
      rawAttributes: {
        a: 'some',
        b: 'value'
      }
    }

    const rawAttributesKeys = utils.getColumnsFromModel(obj)

    expect(rawAttributesKeys).toEqual(['a', 'b'])
    expect(rawAttributesKeys.length).toBe(2)
  })

  it('should return keys of obj', () => {
    const obj = {
      a: 'some',
      b: 'value'
    }

    const keys = utils.getKeys(obj)

    expect(keys.length).toBe(2)
    expect(keys).toEqual(['a', 'b'])
  })
})
