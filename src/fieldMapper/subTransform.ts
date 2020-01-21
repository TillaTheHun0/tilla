
import { registry } from '../registry'
import { Transformer } from '../transformer'
import { promiseMap } from '../utils'

import { DoubleFieldMapperBuilder } from './types'
import { flattenGet } from './_get'

export type TransformerProvider = (...args: any[]) => Transformer | Promise<Transformer>

export const subTransform: DoubleFieldMapperBuilder<string | Transformer | TransformerProvider, string> =
  // TODO: How to make permission optional here
  (transformerIdentifier, permission?) =>
    ({ permissionRanking }) => {
      let transformer: Transformer

      if (permission && permissionRanking.indexOf(permission) === -1) {
        throw new Error('Permission Lvl Not Found')
      }

      return flattenGet(
        async (instance, key, isList, runtimePermission) => {
          // permission provided at construction time always trumps permission provided at transform time
          const scopedPermission: string = permission || runtimePermission

          if (permissionRanking.indexOf(scopedPermission) === -1) {
            throw new Error('Permission Lvl Not Found')
          }

          // Lazy load the transformer on first invocation
          if (!transformer) {
            transformer = await setTransformer(transformerIdentifier) as Transformer
          }

          // Subtransform each item in list
          if (isList) {
            const list = instance[key]
            return list ? promiseMap(list, (cur: any) => {
              return transformer.transform(scopedPermission, cur)
            }) : list
          }

          const val = instance[key]

          return val ? transformer.transform(scopedPermission, val) : val
        }
      )
    }

export async function setTransformer (transformerIdentifier: string | Transformer | TransformerProvider) {
  let transformer: Transformer | undefined

  // Transformer from the registry
  if (typeof transformerIdentifier === 'string') {
    transformer = registry.getTransformer(transformerIdentifier)
  }

  // Transformer instance
  if (transformerIdentifier instanceof Transformer) {
    transformer = transformerIdentifier
  }

  // Function that returns a Transformer
  if (typeof transformerIdentifier === 'function') {
    transformer = await transformerIdentifier()
  }

  // Check if the final value is indeed a Transformer
  if (transformer instanceof Transformer) {
    return transformer
  }

  throw new Error('No Valid Transformer identifier provided')
}
