
import { passthrough } from '../fieldMapper'
import { FieldMapperDelegate } from '../fieldMapperDelegate'
import { PermissionRanking, Permissions } from '../permission'
import { atOrAbove } from './atOrAbove'

describe('Rule', () => {
  describe('atOrAbove', () => {
    it('should set permission lvls at or above provided lvl and all below lvls to null', () => {
      const fieldMapperDelegate = new FieldMapperDelegate(
        'foo', PermissionRanking, atOrAbove(Permissions.PRIVATE, passthrough())
      )

      expect.assertions(Object.keys(fieldMapperDelegate.delegateMap).length)

      Object.keys(fieldMapperDelegate.delegateMap).forEach(permission => {
        if (PermissionRanking.indexOf(permission) >= PermissionRanking.indexOf(Permissions.PRIVATE)) {
          expect(fieldMapperDelegate.delegateMap[permission]).toBeDefined()
        } else {
          expect(fieldMapperDelegate.delegateMap[permission]).toBeNull()
        }
      })
    })
  })
})
