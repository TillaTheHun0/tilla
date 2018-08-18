'use strict'

import { FieldMapper } from '../../src/fieldMapper'

function throwNotImplementedError (done) {
  let customMapper = new FieldMapper((instance, key, isList) => {
    let value = instance[key]
    if (isList) {
      return value + 2
    }
    return value + 1
  })

  let obj = {
    value: 1
  }

  customMapper.map(obj, 'value').catch(() => {
    done()
  })
}

export {
  throwNotImplementedError
}
