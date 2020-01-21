
import { FieldMapper } from './types'

/**
 * This FieldMapper is used to flatten instances that have a `.get()`
 * method. Otherwise, this FieldMapper is just a passthrough to the provided FieldMapper
 *
 * @param fieldMapper - the FieldMapper to wrap
 */
export const flattenGet = (fieldMapper: FieldMapper): FieldMapper =>
  async (instance, key, isList, permission) => {
    if (typeof instance.get === 'function') {
      return fieldMapper(instance.get(), key, isList, permission)
    }
    return fieldMapper(instance, key, isList, permission)
  }
