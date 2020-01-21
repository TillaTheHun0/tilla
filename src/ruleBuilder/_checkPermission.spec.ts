
import { passthrough } from '../fieldMapper'
import { FieldMapperDelegate } from '../fieldMapperDelegate'
import { PermissionRanking } from '../permission'
import { atOrAbove } from './atOrAbove'

describe('Rule', () => {
  describe('_checkPermission', () => {
    it('should throw if permission lvl is not valid', () => {
      expect(() =>
        new FieldMapperDelegate(
          'foo', PermissionRanking, atOrAbove('bogusPermission', passthrough())
        )
      ).toThrow('Permission Lvl Not Found')
    })
  })
})
