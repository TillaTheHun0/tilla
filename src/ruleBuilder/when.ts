
import { RuleBuilder } from './types'
import { checkPermission } from './_checkPermission'

export const when: RuleBuilder = (permission, mapper) =>
  checkPermission(permission, (fieldMapperDelegate) => {
    const { delegateMap } = fieldMapperDelegate
    delegateMap[permission] = mapper(fieldMapperDelegate)
    return fieldMapperDelegate
  })
