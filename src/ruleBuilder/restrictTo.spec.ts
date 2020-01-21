
import { passthrough } from '../fieldMapper'
import { FieldMapperDelegate } from '../fieldMapperDelegate'
import { PermissionRanking, Permissions } from '../permission'
import { restrictTo } from './restrictTo'

describe('Rule', () => {
  describe('restrictTo', () => {
    it('should set provided permission lvl and set others to null on the delegate', () => {
      const fieldMapperDelegate = new FieldMapperDelegate(
        'foo', PermissionRanking, restrictTo(Permissions.PRIVATE, passthrough())
      )

      expect.assertions(Object.keys(fieldMapperDelegate.delegateMap).length)

      Object.keys(fieldMapperDelegate.delegateMap).forEach(permission => {
        if (PermissionRanking.indexOf(permission) === PermissionRanking.indexOf(Permissions.PRIVATE)) {
          expect(fieldMapperDelegate.delegateMap[permission]).toBeDefined()
        } else {
          expect(fieldMapperDelegate.delegateMap[permission]).toBeNull()
        }
      })
    })
  })
})
