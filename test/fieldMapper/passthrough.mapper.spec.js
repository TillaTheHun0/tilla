'use strict'

import { expect } from 'chai'
import { PassthroughFieldMapper } from '../../src/fieldMapper'

function wrapsInPromise (done) {
  const passthroughMapper = new PassthroughFieldMapper()

  const obj = {
    value: 1
  }

  const result = passthroughMapper.map(obj, 'value')

  result.then((value) => {
    expect(value).to.be.equal(1)
    done()
  })
}

export {
  wrapsInPromise
}
