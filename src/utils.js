'use strict'

import { FieldMapperDelegate } from './field.mapper.delegate'

class TransformUtils {
  fieldDelegate (sourceKey) {
    return new FieldMapperDelegate(sourceKey)
  }
  getColumnsFromModel (Model) {
    return Object.keys(Model.rawAttributes)
  }
  getKeys (obj) {
    return Object.keys(obj)
  }
}

export const utils = new TransformUtils()
