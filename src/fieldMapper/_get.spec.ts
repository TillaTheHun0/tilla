
import { flattenGet } from './_get'

describe('FieldMapper', () => {
  const fieldMapper = flattenGet((instance, key) => instance[key])

  describe('flattenGet', () => {
    it('should return a Promise', () => {
      const val = fieldMapper({ bar: '123' }, 'bar', false)

      expect(val).toBeInstanceOf(Promise)
    })

    it('should call get on the instance', async () => {
      const foo = {
        get: () => ({ bar: '123' })
      }

      const val = await fieldMapper(foo, 'bar', false)

      expect(val).toBe(foo.get().bar)
    })

    it('should passthrough to the underlying FieldMapper', async () => {
      const foo = { bar: '123' }

      const val = await fieldMapper(foo, 'bar', false)

      expect(val).toBe(foo.bar)
    })
  })
})
