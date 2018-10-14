'use strict'

import '@babel/polyfill'

import { TransformerRegistry } from './transformer.registry'
import * as FieldMapper from './fieldMapper'
import { Transformer } from './transformer'
import { PermissionRanking, PermissionLvl } from './permission'
import { utils } from './utils'

const registry = new TransformerRegistry()

export {
  FieldMapper,
  Transformer,
  PermissionRanking,
  PermissionLvl,
  utils,
  registry
}
