
import { Transformer } from '../transformer'

type Next = (value: IObservablePayload) => void

export interface IObserver {
  closed?: boolean
  next: Next
  error: (err: any) => void
  complete: () => void
}

export interface IObservablePayload {
  message: string
  registry: TransformerRegistry
}

/**
 * A registry that can be used to register all Transformers. This registry
 * is tied directly into FieldMapperDelegates and can be used to perform
 * subtransformations
 */
class TransformerRegistry {
  registry: Record<string, Transformer>
  private observers: Array<IObserver> = []

  constructor () {
    this.registry = {}
  }

  /**
   * Register the Transformer at the provided the key in the registry
   *
   * @param {String} key - the key to use to register the Transformer.
   * @param {Transformer} transformer - the Transformer instance.
   */
  register (key: string, transformer: Transformer) {
    this.registry[key] = transformer
    this.emit(`Registered transform at key: ${key}`)
  }

  /**
   * Retrieve the Transformer at the provided the key in the registry
   *
   * @param {String} key - the key that references the Transformer in the registry
   *
   * @return {Transformer | undefined} the transformer
   */
  getTransformer (key: string) {
    return this.registry[key]
  }

  /**
   * Alias for getTransformer()
   *
   * @see {TransformerRegistry#getTransformer}
   */
  transformer (key: string) {
    return this.getTransformer(key)
  }

  /**
   * Clear all Transformers from the registry
   */
  clear () {
    delete this.registry
    this.registry = {}
    this.emit('Cleared registry')
  }

  /**
   * Subscribe to events emitted by the registry
   *
   * @param observer - the observer
   */
  subscribe (observer: IObserver | Next) {
    let _observer: IObserver
    if (typeof observer === 'function') {
      _observer = {
        error: () => {},
        next: observer,
        complete: () => {}
      }
    }

    if (typeof observer === 'object') {
      _observer = observer
    }

    if (!observer) {
      throw new Error('observer not correct shape')
    }

    this.observers.push(_observer!)

    let called = false
    // return a function that removes the observer
    return () => {
      // only call unsubscribe once
      if (called) return
      const index = this.observers.findIndex((observer: IObserver) => observer === _observer)
      this.observers.splice(index, 1)
      called = true
    }
  }

  private emit (message: string) {
    this.observers.forEach(observer => observer.next({
      message,
      registry: this
    }))
  }
}

export { TransformerRegistry }
