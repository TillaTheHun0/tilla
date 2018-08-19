'use strict'

import { FieldMapperDelegate } from './field.mapper.delegate'

class TransformUtils {
  fieldDelegate (permissionRanking) {
    return (sourceKey) => {
      return new FieldMapperDelegate(sourceKey, permissionRanking)
    }
  }

  // Mainly for
  getColumnsFromModel (Model) {
    return Object.keys(Model.rawAttributes)
  }

  getKeys (obj) {
    return Object.keys(obj)
  }
}

export const utils = new TransformUtils()
