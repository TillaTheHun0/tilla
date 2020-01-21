
import { FieldMapperDelegate } from '../fieldMapperDelegate'
import { PermissionRanking } from '../permission'
import { asList } from './asList'

describe('Rule', () => {
  describe('asList', () => {
    it('should set asList to true', () => {
      const fieldMapperDelegate = new FieldMapperDelegate('foo', PermissionRanking, asList())
      expect(fieldMapperDelegate.isList).toBe(true)
    })
  })
})
