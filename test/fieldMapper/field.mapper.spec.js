
import { FieldMapper } from '../../src/fieldMapper'

function throwNotImplementedError (done) {
  const customMapper = new FieldMapper((instance, key, isList) => {
    const value = instance[key]
    if (isList) {
      return value + 2
    }
    return value + 1
  })

  const obj = {
    value: 1
  }

  customMapper.map(obj, 'value').catch(() => {
    done()
  })
}

export {
  throwNotImplementedError
}
