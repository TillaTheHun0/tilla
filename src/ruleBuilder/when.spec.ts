
import { passthrough } from '../fieldMapper'
import { FieldMapperDelegate } from '../fieldMapperDelegate'
import { PermissionRanking, Permissions } from '../permission'
import { when } from './when'

describe('Rule', () => {
  describe('when', () => {
    it('should set only one permission lvl on the delegate and not touch other lvls', () => {
      const fieldMapperDelegate = new FieldMapperDelegate(
        'foo', PermissionRanking,
        when(Permissions.PRIVATE, passthrough()),
        when(Permissions.PUBLIC, passthrough())
      )

      expect(fieldMapperDelegate.delegateMap[Permissions.PRIVATE]).toBeDefined()
      expect(fieldMapperDelegate.delegateMap[Permissions.PUBLIC]).toBeDefined()
    })
  })
})
