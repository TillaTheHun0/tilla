
import { FieldMapperDelegate } from './field.mapper.delegate'

export const fieldDelegate = permissionRanking => sourceKey =>
  new FieldMapperDelegate(sourceKey, permissionRanking)

export const getKeys = obj => Object.keys(obj)

export const getColumnsFromModel = Model => Object.keys(Model.rawAttributes)

export const utils = {
  fieldDelegate,
  getKeys,
  getColumnsFromModel
}
