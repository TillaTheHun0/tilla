
import { MonoFieldMapperBuilder, FieldMapper } from './types'
import { flattenGet } from './_get'

export const buildWith: MonoFieldMapperBuilder<FieldMapper> = (customBuilder: FieldMapper) =>
  () => flattenGet(customBuilder)
