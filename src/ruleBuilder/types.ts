
import { FieldMapperContextBuilder } from '../fieldMapper'
import { FieldMapperDelegate } from '../fieldMapperDelegate'

export type Rule = (fieldMapperDelegate: FieldMapperDelegate) => FieldMapperDelegate

export type RuleBuilder = (permission: string, mapper: FieldMapperContextBuilder) => Rule
