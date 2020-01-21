
import { Rule } from './types'

type AsList = () => Rule

export const asList: AsList = () =>
  (fieldMapperDelegate) => {
    fieldMapperDelegate.isList = true
    return fieldMapperDelegate
  }
