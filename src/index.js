'use strict'

import '@babel/polyfill'

import { TransformerRegistry } from './transformer.registry'
import { Transformer } from './transformer'
import { PermissionLvl } from './permission'
import { fieldDelegate } from './utils'

let registry = new TransformerRegistry()

export {
  registry,
  Transformer,
  PermissionLvl,
  fieldDelegate,
  TransformerRegistry
}
