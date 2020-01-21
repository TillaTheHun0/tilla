
import { always, atOrAbove } from './ruleBuilder'
import { passthrough, FieldMapper, buildWith } from './fieldMapper'
import { Transformer, fieldDelegate, Permissions, registry } from './'

const delegate = fieldDelegate()

describe('Transformer', () => {
  let transformer: Transformer

  beforeEach(() => {
    transformer = new Transformer({
      value: delegate('value', always(passthrough())),
      secret: delegate('secret', atOrAbove(Permissions.PRIVATE, passthrough()))
    })
  })

  it('should set flag and default attributes', () => {
    expect(transformer.defaultAttributes).toBe(undefined)
    expect(transformer.hasDefault).toBe(false)

    transformer.byDefault(['field1', 'field2'])

    expect(transformer.defaultAttributes).toEqual(['field1', 'field2'])
    expect(transformer.hasDefault).toBe(true)
  })

  it('should set to passthrough by default', () => {
    transformer.byDefault().PASSTHROUGH()

    expect(transformer.defaultMask).toBe('PASSTHROUGH')
  })

  it('should throw err on passthrough when default flag is not set', () => {
    try {
      transformer.PASSTHROUGH()
    } catch (err) {
      expect(err.message).toBe('Default flag not set')
    }
  })

  it('should set to build_with by default and set builder', () => {
    const builder: FieldMapper = async () => {
      console.log('my sweet builder')
    }

    transformer.byDefault().BUILD_WITH(builder)

    expect(transformer.defaultMask).toBe('BUILD_WITH')
    expect(transformer.defaultBuilder).toBe(builder)
  })

  it('should throw err on build_with when default flag is not set', () => {
    try {
      const builder: FieldMapper = async () => {
        console.log('my sweet builder')
      }

      transformer.BUILD_WITH(builder)
    } catch (err) {
      expect(err.message).toBe('Default flag not set')
    }
  })

  it('should transform the object and ignore values not specified', async () => {
    const obj = {
      value: 1,
      secret: 100,
      otherValue: 200 // field ignored by transformer
    }

    const dto = await transformer.transform(Permissions.PRIVATE, obj)

    expect(dto.value).toBe(1)
    expect(dto.secret).toBe(100)
    expect(dto.otherValue).toBe(undefined)
  })

  it('should transform the object and specified default fields as specified', async () => {
    transformer.byDefault(['otherValue']).PASSTHROUGH()

    const obj = {
      value: 1,
      secret: 100,
      otherValue: 200
    }

    const dto = await transformer.transform(Permissions.PRIVATE, obj)

    expect(dto.value).toBe(1)
    expect(dto.secret).toBe(100)
    expect(dto.otherValue).toBe(200)
  })

  it('should transform the object and ignore values not specified in default attributes', async () => {
    transformer.byDefault().PASSTHROUGH()

    const obj = {
      value: 1,
      secret: 100,
      otherValue: 200 // field ignored by transformer
    }

    const dto = await transformer.transform(Permissions.PRIVATE, obj)

    expect(dto.value).toBe(1)
    expect(dto.secret).toBe(100)
    expect(dto.otherValue).toBe(undefined)
  })

  it('should transform the object and specified default fields with the default builder', async () => {
    transformer.byDefault(['otherValue']).BUILD_WITH((instance, key) => {
      return instance[key] + 1
    })

    const obj = {
      value: 1,
      secret: 100,
      otherValue: 200
    }

    const dto = await transformer.transform(Permissions.PRIVATE, obj)

    expect(dto.value).toBe(1)
    expect(dto.secret).toBe(100)
    expect(dto.otherValue).toBe(201)
  })

  it('should transform the object and default custom builder and ignore values not specified in default attributes', async () => {
    transformer.byDefault().BUILD_WITH((instance, key) => {
      return instance[key] + 1
    })

    const obj = {
      value: 1,
      secret: 100,
      otherValue: 200
    }

    const dto = await transformer.transform(Permissions.PRIVATE, obj)

    expect(dto.value).toBe(1)
    expect(dto.secret).toBe(100)
    expect(dto.otherValue).toBe(undefined)
  })

  it('should throw an error if no default masking is set', async () => {
    transformer.byDefault(['otherValue']) // missing mask here

    const obj = {
      value: 1,
      secret: 100,
      otherValue: 200
    }

    const dto = transformer.transform(Permissions.PRIVATE, obj)

    expect(dto).rejects.toThrow()
  })

  it('should extend the transformer and merge the maps', async () => {
    const extension = transformer.extend({
      value: delegate('value', atOrAbove(Permissions.ADMIN, passthrough())),
      otherValue: delegate('otherValue', always(
        buildWith(
          (instance, key) => {
            return instance[key] + 1
          })
      )
      ),
      computed: delegate(undefined, always(
        buildWith(
          async () => {
            return 500
          }
        )
      ))
    })

    const obj = {
      value: 1,
      secret: 100,
      otherValue: 200
    }

    const dto = await extension.transform(Permissions.PRIVATE, obj)

    expect(dto.value).toBe(undefined)
    expect(dto.secret).toBe(100)
    expect(dto.computed).toBe(500)
    expect(dto.otherValue).toBe(201)
  })

  it('should register the transformer in the registry automatically', () => {
    const key = 'awesomeTransformer'
    // adds transformer to internal registry
    let awesomeTransformer = new Transformer(key, { //eslint-disable-line
      value: delegate('value', always(passthrough())),
      secret: delegate('secret', atOrAbove(Permissions.PRIVATE, passthrough()))
    })

    expect(registry.getTransformer(key)).toBe(awesomeTransformer)
  })

  it('should curry the arguments provided when calling transform()', async () => {
    transformer.byDefault().PASSTHROUGH()

    const obj = {
      value: 1,
      secret: 100,
      otherValue: 200 // field ignored by transformer
    }

    const curried = transformer.transform(Permissions.PRIVATE) as (instance: any) => Promise<any>

    const dto = await curried(obj)

    expect(dto.value).toBe(1)
    expect(dto.secret).toBe(100)
    expect(dto.otherValue).toBe(undefined)
  })
})
