'use strict'

import '@babel/polyfill'

import { TransformerRegistry, registry } from './registry'
import { Transformer } from './transformer'
import { Permissions } from './permission'
import { fieldDelegate } from './utils'

export {
  registry,
  Transformer,
  Permissions,
  fieldDelegate,
  TransformerRegistry
}
