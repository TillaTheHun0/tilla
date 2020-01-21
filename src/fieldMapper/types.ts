
import { FieldMapperDelegate } from '../fieldMapperDelegate'

export type FieldMapperContextBuilder = (delegate: FieldMapperDelegate) => FieldMapper

export type FieldMapperBuilder = () => FieldMapperContextBuilder
export type MonoFieldMapperBuilder<T> = (arg: T) => FieldMapperContextBuilder
export type DoubleFieldMapperBuilder<T, U> = (arg: T, arg2?: U) => FieldMapperContextBuilder
export type TripleFieldMapperBuilder<T, U, V> = (arg: T, arg2?: U, arg3?: V) => FieldMapperContextBuilder

export type FieldMapper<returnType = any> =
  (instance: any, key: string, isList: boolean, permission: string) =>
    Promise<returnType>
