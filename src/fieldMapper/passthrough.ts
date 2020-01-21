
import { FieldMapperBuilder } from './types'
import { flattenGet } from './_get'

export const passthrough: FieldMapperBuilder = () =>
  () => flattenGet((instance, key) => instance[key])
