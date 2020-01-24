
import { FieldMapperDelegate } from './fieldMapperDelegate'
import { Rule } from './ruleBuilder'

export const fieldDelegate = (permissionRanking?: string[]) => (first: string | Rule | undefined, ...rest: Rule[]) => {
  if (!first) {
    return new FieldMapperDelegate(undefined, permissionRanking, ...rest)
  }

  if (typeof first === 'string') {
    return new FieldMapperDelegate(first, permissionRanking, ...rest)
  }

  return new FieldMapperDelegate(undefined, permissionRanking, ...[first, ...rest])
}

export const getKeys = (obj: {}) => Object.keys(obj)

export const getColumnsFromModel = (Model: { rawAttributes: any }) => Object.keys(Model.rawAttributes)

export const promiseMap = (list: any[] = [], fn: Function) => {
  return Promise.all(
    list.map(
      async (cur) => fn(cur)
    )
  )
}

export const utils = {
  fieldDelegate,
  getKeys,
  getColumnsFromModel
}
