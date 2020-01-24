
import { utils } from './utils'
import { always, when } from './ruleBuilder'
import { passthrough } from './fieldMapper'
import { Permissions } from './permission'

const delegate = utils.fieldDelegate()

describe('Utils', () => {
  it('should return a FieldDelegate instance with source and empty map', () => {
    const key: string = 'someKey'
    const fieldDelegate = delegate(key, always(passthrough()))

    expect(fieldDelegate.sourceKey).toBe(key)
    expect(fieldDelegate.delegateMap).toBeDefined()
  })

  it('should allow not providing a sourceKey and instead only Rules', () => {
    const fieldDelegate = delegate(
      when(Permissions.PUBLIC, passthrough()),
      when(Permissions.PRIVATE, passthrough())
    )

    expect(fieldDelegate.sourceKey).toBeUndefined()
    expect(fieldDelegate.delegateMap).toBeDefined()
    expect(fieldDelegate.delegateMap[Permissions.PUBLIC]).toBeDefined()
    expect(fieldDelegate.delegateMap[Permissions.PRIVATE]).toBeDefined()
  })

  it('should allow undefined as first arg', () => {
    const fieldDelegate = delegate(
      undefined,
      when(Permissions.PUBLIC, passthrough()),
      when(Permissions.PRIVATE, passthrough())
    )

    expect(fieldDelegate.sourceKey).toBeUndefined()
    expect(fieldDelegate.delegateMap).toBeDefined()
    expect(fieldDelegate.delegateMap[Permissions.PUBLIC]).toBeDefined()
    expect(fieldDelegate.delegateMap[Permissions.PRIVATE]).toBeDefined()
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
