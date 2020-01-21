
import { RuleBuilder } from './types'
import { checkPermission } from './_checkPermission'

export const atOrAbove: RuleBuilder = (permission, mapper) =>
  checkPermission(permission, (fieldMapperDelegate) => {
    const { delegateMap, permissionRanking } = fieldMapperDelegate

    const minimumPermissionIndex = permissionRanking.indexOf(permission)

    permissionRanking.forEach((curPermission: string, curPermissionIndex) => {
      // Remove any handler for lvls below provided permission
      if (curPermissionIndex < minimumPermissionIndex) {
        delegateMap[curPermission] = null
        return
      }

      delegateMap[curPermission] = mapper(fieldMapperDelegate)
    })

    return fieldMapperDelegate
  })
