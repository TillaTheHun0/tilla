
import { FieldMapperDelegate } from './fieldMapperDelegate'
import { Rule } from './ruleBuilder'

export const fieldDelegate = (permissionRanking?: string[]) => (sourceKey: string | undefined, ...ruleFns: Rule[]) =>
  new FieldMapperDelegate(sourceKey, permissionRanking, ...ruleFns)

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
