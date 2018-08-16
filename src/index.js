'use strict'

import 'babel-polyfill'

import { TransformerRegistry } from './transformer.registry'
import * as FieldMapper from './fieldMapper'
import { FieldMapperDelegate } from './field.mapper.delegate'
import { Transformer } from './transformer'
import { PermissionRanking, FieldPermissionLvl } from './permission'
import { utils } from './utils'

let setPermissionRanking = (ranking) => {
  FieldMapperDelegate.prototype.setPermissionRanking(ranking)
}

const registry = new TransformerRegistry()

export {
  FieldMapper,
  FieldMapperDelegate,
  Transformer,
  PermissionRanking,
  FieldPermissionLvl,
  utils,
  registry,
  setPermissionRanking
}
