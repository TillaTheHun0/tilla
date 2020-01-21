
import { registry, Transformer, fieldDelegate, Permissions } from '../index'
import { always, atOrAbove } from '../ruleBuilder'
import { FieldMapperDelegate } from '../fieldMapperDelegate'

import { passthrough } from './passthrough'
import { subTransform } from './subTransform'

const delegate = fieldDelegate()
const subTransformerKey = 'subTransformer'

const subTransformer = new Transformer({
  value: delegate('value', always(passthrough())),
  secret: delegate('secret', atOrAbove(Permissions.PRIVATE, passthrough()))
})

registry.clear()
// Add to registry
registry.register(subTransformerKey, subTransformer)

const fieldMapperDelegate = new FieldMapperDelegate('foobar')

describe('FieldMapper', () => {
  describe('subTransform', () => {
    // single value
    describe('single', () => {
      it('should lazily set the transformer from registry', async () => {
        const obj = {
          sub: {
            value: 1,
            secret: 100
          }
        }

        expect(subTransform(subTransformerKey, Permissions.PUBLIC)(fieldMapperDelegate)(obj, 'sub', false)).resolves.toBeDefined()
      })

      it('should lazily set the transformer directly', async () => {
        const obj = {
          sub: {
            value: 1,
            secret: 100
          }
        }

        expect(subTransform(subTransformer, Permissions.PUBLIC)(fieldMapperDelegate)(obj, 'sub', false)).resolves.toBeDefined()
      })

      it('should lazily set the transformer from thunk that returns Promise', async () => {
        const obj = {
          sub: {
            value: 1,
            secret: 100
          }
        }

        expect(subTransform(() => subTransformer, Permissions.PUBLIC)(fieldMapperDelegate)(obj, 'sub', false)).resolves.toBeDefined()
      })

      it('should throw error when no transformer can be set', async () => {
        const obj = {
          sub: {
            value: 1,
            secret: 100
          }
        }

        expect(subTransform('SOME_NONEXISTENT_TRANSFORMER', Permissions.PUBLIC)(fieldMapperDelegate)(obj, 'sub', false)).rejects.toThrow('No Valid Transformer identifier provided')
      })

      it('should throw if permission lvl is not found', () => {
        expect(() => subTransform(subTransformer, 'bogusPermission')(fieldMapperDelegate)).toThrow('Permission Lvl Not Found')
      })

      it('should set the public field, but not the private field', async () => {
        const obj = {
          sub: {
            value: 1,
            secret: 100
          }
        }

        const res = await subTransform(subTransformer, Permissions.PUBLIC)(fieldMapperDelegate)(obj, 'sub', false)

        expect(res.value).toBe(1)
        expect(res.secret).toBeUndefined()
      })

      it('should set both the public field and the private field', async () => {
        const obj = {
          sub: {
            value: 1,
            secret: 100
          }
        }

        const res = await subTransform(subTransformer, Permissions.PRIVATE)(fieldMapperDelegate)(obj, 'sub', false)

        expect(res.value).toBe(1)
        expect(res.secret).toBe(100)
      })

      it('should resolve falsey values to themselves', async () => {
        const obj = {
          false: false,
          null: null
        }

        let res = await subTransform(subTransformer, Permissions.PRIVATE)(fieldMapperDelegate)(obj, 'false', false)
        expect(res).toBe(false)

        res = await subTransform(subTransformer, Permissions.PRIVATE)(fieldMapperDelegate)(obj, 'null', false)
        expect(res).toBeNull()

        res = await subTransform(subTransformer, Permissions.PRIVATE)(fieldMapperDelegate)(obj, 'invalidKey', false)
        expect(res).toBeUndefined()
      })

      it('should call get() on sub instance', async () => {
        const obj = {
          sub: {
            get: () => {
              return {
                value: 1,
                secret: 100
              }
            }
          }
        }

        const res = await subTransform(subTransformer, Permissions.PRIVATE)(fieldMapperDelegate)(obj, 'sub', false)

        expect(res.value).toBe(1)
        expect(res.secret).toBe(100)
      })
    })

    describe('list', () => {
      it('should transform each instance in list with subtransform', async () => {
        const obj = {
          sub: [
            {
              value: 1,
              secret: 100
            },
            {
              value: 2,
              secret: 200
            }
          ]
        }

        const res = await subTransform(subTransformer, Permissions.PRIVATE)(fieldMapperDelegate)(obj, 'sub', true)

        const [res1, res2] = res
        expect(res1.value).toBe(1)
        expect(res1.secret).toBe(100)

        expect(res2.value).toBe(2)
        expect(res2.secret).toBe(200)
      })

      it('should call get() on each sub instance in list', async () => {
        const obj = {
          sub: [
            {
              get: () => {
                return {
                  value: 1,
                  secret: 100
                }
              }
            },
            {
              get: () => {
                return {
                  value: 2,
                  secret: 200
                }
              }
            }
          ]
        }

        const res = await subTransform(subTransformer, Permissions.PRIVATE)(fieldMapperDelegate)(obj, 'sub', true)

        const [res1, res2] = res
        expect(res1.value).toBe(1)
        expect(res1.secret).toBe(100)

        expect(res2.value).toBe(2)
        expect(res2.secret).toBe(200)
      })
    })
  })
})
