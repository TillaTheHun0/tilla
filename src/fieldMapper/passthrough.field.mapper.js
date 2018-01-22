'use strict'

import { FieldMapper } from './field.mapper'

class PassthroughFieldMapper extends FieldMapper {
  builder (instance, key) {
    return Promise.resolve(instance[key])
  }
}

export { PassthroughFieldMapper }
