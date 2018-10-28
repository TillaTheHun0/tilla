'use strict'

import '@babel/polyfill'

import { TransformerRegistry, registry } from './registry'
import { Transformer } from './transformer'
import { PermissionLvl } from './permission'
import { fieldDelegate } from './utils'

export {
  registry,
  Transformer,
  PermissionLvl,
  fieldDelegate,
  TransformerRegistry
}
