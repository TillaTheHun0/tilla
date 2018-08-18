'use strict'

import { expect } from 'chai'
import { PassthroughFieldMapper } from '../../src/fieldMapper'

function wrapsInPromise (done) {
  let passthroughMapper = new PassthroughFieldMapper()

  let obj = {
    value: 1
  }

  let result = passthroughMapper.map(obj, 'value')

  result.then((value) => {
    expect(value).to.be.equal(1)
    done()
  })
}

export {
  wrapsInPromise
}
