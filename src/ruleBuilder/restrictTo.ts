
import { RuleBuilder } from './types'
import { checkPermission } from './_checkPermission'

export const restrictTo: RuleBuilder = (permission, mapper) =>
  checkPermission(permission, (fieldMapperDelegate) => {
    const { delegateMap, permissionRanking } = fieldMapperDelegate

    const permissionIndex = permissionRanking.indexOf(permission)

    permissionRanking.forEach((curPermission: string, curPermissionIndex) => {
      // Remove any handler for lvls not equal to provided permission
      if (curPermissionIndex !== permissionIndex) {
        delegateMap[curPermission] = null
        return
      }

      delegateMap[curPermission] = mapper(fieldMapperDelegate)
    })

    return fieldMapperDelegate
  })
