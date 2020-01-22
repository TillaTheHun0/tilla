
import { FieldMapperDelegate } from './fieldMapperDelegate'
import { always, when } from './ruleBuilder'
import { passthrough } from './fieldMapper/passthrough'
import { PermissionRanking, Permissions } from './permission'

describe('FieldMapperDelegate', () => {
  it('should call the fieldMapper in the delegate', async () => {
    const foo = { bar: '123' }

    const fieldMapperDelegate = new FieldMapperDelegate('bar', PermissionRanking, always(passthrough()))

    const res = await fieldMapperDelegate.transform(Permissions.PUBLIC, foo)

    expect(res).toBe(foo.bar)
  })

  it('should return if no fieldMapper is provided at the permission lvl', async () => {
    const foo = { bar: '123' }

    const fieldMapperDelegate = new FieldMapperDelegate('foobar', PermissionRanking, when(Permissions.PRIVATE, passthrough()))

    const res = await fieldMapperDelegate.transform(Permissions.PUBLIC, foo)

    expect(res).toBeUndefined()
  })

  it('should call all rules provided', () => {
    const rule1 = jest.fn()
    const rule2 = jest.fn()

    const fieldMapperDelegate = new FieldMapperDelegate('foobar', PermissionRanking, rule1, rule2)

    expect(fieldMapperDelegate).toBeDefined()
    expect(rule1).toHaveBeenCalled()
    expect(rule2).toHaveBeenCalled()
  })
})
