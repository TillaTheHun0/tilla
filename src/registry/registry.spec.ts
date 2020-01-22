
import { registry, Transformer } from '..'

describe('Registry', () => {
  it('should register the transformer', () => {
    const transformer = new Transformer({})

    registry.register('key', transformer)

    expect(registry.registry.key).toBe(transformer)
  })

  it('should retrieve the transformer', () => {
    const transformer = new Transformer({})

    registry.register('key', transformer)

    expect(registry.getTransformer('key')).toBe(transformer)
    expect(registry.transformer('key')).toBe(transformer)
  })

  it('should clear the registry', () => {
    const transformer = new Transformer({})

    registry.register('key', transformer)

    expect(registry.registry.key).toBe(transformer)

    registry.clear()

    expect(registry.registry).toMatchObject({})
  })

  it('should notify observers', () => {
    const fn = jest.fn()
    const obs = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn()
    }

    registry.subscribe(fn)
    registry.subscribe(obs)

    const transformer = new Transformer({})

    registry.register('key', transformer)

    expect(fn).toHaveBeenCalled()
    expect(obs.next).toHaveBeenCalled()
  })

  it('should unsubscribe the observer', () => {
    const fn = jest.fn()

    const unsubscrbe = registry.subscribe(fn)

    // immediatley unsubscribe
    unsubscrbe()

    const transformer = new Transformer({})
    registry.register('key', transformer)

    expect(fn).not.toHaveBeenCalled()
    expect(() => unsubscrbe()).not.toThrow()
  })
})
