
import { FieldMapperDelegate } from '../fieldMapperDelegate'
import { Permissions } from '../permission'

import { buildWith } from './buildWith'
import { FieldMapper } from './types'

describe('FieldMapper', () => {
  let fieldMapperDelegate: FieldMapperDelegate

  const builder: FieldMapper = (instance, key) => instance[key] + 1

  beforeEach(() => {
    fieldMapperDelegate = new FieldMapperDelegate('foobar')
  })

  describe('buildWith', () => {
    it('should return a Promise', () => {
      const foo = { bar: 10 }

      const val = buildWith(builder)(fieldMapperDelegate)(foo, 'bar', false, Permissions.PUBLIC)

      expect(val).toBeInstanceOf(Promise)
    })

    it('should use the custom fieldMapper', async () => {
      const foo = { bar: 10 }

      const val = await buildWith(builder)(fieldMapperDelegate)(foo, 'bar', false, Permissions.PUBLIC)

      expect(val).toBe(foo.bar + 1)
    })
  })
})
