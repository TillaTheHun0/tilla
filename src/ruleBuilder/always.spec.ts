
import { passthrough } from '../fieldMapper'
import { FieldMapperDelegate } from '../fieldMapperDelegate'
import { PermissionRanking } from '../permission'
import { always } from './always'

describe('Rule', () => {
  describe('always', () => {
    it('should set every permission lvl on the delegate', () => {
      const fieldMapperDelegate = new FieldMapperDelegate(
        'foo', PermissionRanking, always(passthrough())
      )

      expect.assertions(Object.keys(fieldMapperDelegate.delegateMap).length)

      Object.keys(fieldMapperDelegate.delegateMap).forEach(permission => {
        expect(fieldMapperDelegate.delegateMap[permission]).toBeDefined()
      })
    })
  })
})
