
import { FieldMapperContextBuilder } from '../fieldMapper'
import { Rule } from './types'

type AlwaysRule = (mapper: FieldMapperContextBuilder) => Rule

export const always: AlwaysRule = (mapper) =>
  (fieldMapperDelegate) => {
    const { delegateMap, permissionRanking } = fieldMapperDelegate

    permissionRanking.forEach(permission => {
      // set each level to the mapper
      delegateMap[permission] = mapper(fieldMapperDelegate)
    })

    return fieldMapperDelegate
  }
