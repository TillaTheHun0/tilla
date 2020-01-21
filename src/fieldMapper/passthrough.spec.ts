
import { FieldMapperDelegate } from '../fieldMapperDelegate'
import { Permissions } from '../permission'

import { passthrough } from './passthrough'

describe('FieldMapper', () => {
  let fieldMapperDelegate: FieldMapperDelegate

  beforeEach(() => {
    fieldMapperDelegate = new FieldMapperDelegate('foobar')
  })

  describe('passthrough', () => {
    it('should return a Promise', () => {
      const foo = { bar: '123' }

      const val = passthrough()(fieldMapperDelegate)(foo, 'bar', false, Permissions.PUBLIC)

      expect(val).toBeInstanceOf(Promise)
    })

    it('should return the value provided', async () => {
      const foo = { bar: '123' }

      const val = await passthrough()(fieldMapperDelegate)(foo, 'bar', false, Permissions.PUBLIC)

      expect(val).toBe(foo.bar)
    })
  })
})
