'use strict'

import { expect } from 'chai'
import { Permissions } from '../../src'
import { PassthroughFieldMapper, CustomFieldMapper, SubTransformFieldMapper } from '../../src/fieldMapper'
import { FieldMapperDelegate } from '../../src/field.mapper.delegate'

function always () {
  const delegate = new FieldMapperDelegate('woop')

  delegate.always()

  expect(delegate.alwaysFlag).to.be.equal(true)

  delegate.passthrough()

  expect(delegate.alwaysFlag).to.be.equal(null)
}

function alwaysSetsAllLvls () {
  const fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().passthrough()

  fMDelegate.permissionRanking.forEach((p) => {
    expect(fMDelegate.delegate[p]).to.not.be.equal(null)
    expect(fMDelegate.delegate[p]).to.not.be.equal(undefined)
  })
}

function passthroughAlways () {
  const fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().passthrough()

  fMDelegate.permissionRanking.forEach((p) => {
    expect(fMDelegate.delegate[p] instanceof PassthroughFieldMapper).to.be.equal(true)
  })

  expect(fMDelegate.curPermissionLvl).to.be.equal(null)
}

function buildWithAlways () {
  const fMDelegate = new FieldMapperDelegate('woop')
  const builder = () => {
    console.log('builder')
  }

  fMDelegate.always().buildWith(builder)

  fMDelegate.permissionRanking.forEach((p) => {
    expect(fMDelegate.delegate[p] instanceof CustomFieldMapper).to.be.equal(true)
  })

  expect(fMDelegate.curPermissionLvl).to.be.equal(null)
}

function subTransformWithPermission () {
  const fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().subTransform('something', Permissions.PUBLIC)

  fMDelegate.permissionRanking.forEach((p) => {
    const trans = fMDelegate.delegate[p]
    expect(fMDelegate.delegate[p] instanceof SubTransformFieldMapper).to.be.equal(true)
    expect(trans.permission).to.be.equal(Permissions.PUBLIC)
  })

  expect(fMDelegate.curPermissionLvl).to.be.equal(null)
}

function subTransformWithPermissionInvalidErr (done) {
  const fMDelegate = new FieldMapperDelegate('woop')

  try {
    fMDelegate.always().subTransform('something', 'INVALID')
  } catch (err) {
    done()
  }
}

function subTransformWithoutPermission () {
  const fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().subTransform('something')

  fMDelegate.permissionRanking.forEach((p) => {
    const trans = fMDelegate.delegate[p]
    expect(fMDelegate.delegate[p] instanceof SubTransformFieldMapper).to.be.equal(true)
    expect(trans.permission).to.be.equal(p)
  })

  expect(fMDelegate.curPermissionLvl).to.be.equal(null)
}

function asList () {
  const fMDelegate = new FieldMapperDelegate('woop').asList()
  expect(fMDelegate.isList).to.be.equal(true)
}

function checkAlways () {
  const fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().passthrough()

  fMDelegate.permissionRanking.forEach((p) => {
    expect(fMDelegate.delegate[p] instanceof PassthroughFieldMapper).to.be.equal(true)
  })

  expect(fMDelegate.alwaysFlag).to.be.equal(null)
}

function restrictAtOrAbove () {
  const fMDelegate = new FieldMapperDelegate('woop')

  const index = fMDelegate.permissionRanking.indexOf(Permissions.PRIVATE)
  fMDelegate.atOrAbovePrivate().passthrough()

  fMDelegate.permissionRanking.forEach((p, i) => {
    if (i < index) {
      expect(fMDelegate.delegate[p]).to.be.equal(null)
      return
    }
    expect(fMDelegate.delegate[p] instanceof PassthroughFieldMapper).to.be.equal(true)
  })
}

function transformAtLvl () {
  const fMDelegate = new FieldMapperDelegate('woop')
  const obj = {
    woop: 200
  }

  fMDelegate.atOrAbovePrivate().passthrough()

  fMDelegate.transform(Permissions.PRIVATE, obj).then((value) => {
    expect(value).to.be.equal(200)
  })
}

function transformBelowLvl () {
  const fMDelegate = new FieldMapperDelegate('woop')
  const obj = {
    woop: 200
  }

  fMDelegate.atOrAbovePrivate().passthrough()

  fMDelegate.transform(Permissions.PUBLIC, obj).then((value) => {
    expect(value).to.be.equal(undefined)
  })
}

function when () {
  const fMDelegate = new FieldMapperDelegate('woop').whenPrivate()

  expect(fMDelegate.curPermissionLvl).to.be.equal(Permissions.PRIVATE)
}

function atOrAbove () {
  const fMDelegate = new FieldMapperDelegate('woop')

  const index = fMDelegate.permissionRanking.indexOf(Permissions.PRIVATE)
  fMDelegate.atOrAbovePrivate()

  expect(fMDelegate.curPermissionLvl).to.be.equal(Permissions.PRIVATE)
  expect(index).to.be.equal(fMDelegate.restrictAtOrAbove)
}

function restrictTo () {
  const fMDelegate = new FieldMapperDelegate('woop')

  const index = fMDelegate.permissionRanking.indexOf(Permissions.PRIVATE)
  fMDelegate.restrictToPrivate()

  expect(fMDelegate.curPermissionLvl).to.be.equal(Permissions.PRIVATE)
  expect(index).to.be.equal(fMDelegate.restrict)
}

function _restrictTo () {
  const fMDelegate = new FieldMapperDelegate('woop')

  const index = fMDelegate.permissionRanking.indexOf(Permissions.PRIVATE)
  fMDelegate.restrictToPrivate().passthrough()

  fMDelegate.permissionRanking.forEach((p, i) => {
    if (i !== index) {
      expect(fMDelegate.delegate[p]).to.be.equal(null)
      return
    }

    expect(fMDelegate.delegate[p] instanceof PassthroughFieldMapper).to.be.equal(true)
  })
}

function setPermissionRanking () {
  const permissions = ['low', 'medium', 'high']

  const fMDelegate = new FieldMapperDelegate('woop', permissions)

  expect(fMDelegate.atOrAboveLow).to.not.be.equal(undefined)
  expect(fMDelegate.whenMedium).to.not.be.equal(undefined)

  fMDelegate.atOrAboveLow().passthrough()
  fMDelegate.whenMedium().passthrough()

  expect(fMDelegate.permissionRanking).has.members(permissions)
}

function buildPermissionMethods () {
  const permissions = ['low', 'medium', 'high']

  const fMDelegate = new FieldMapperDelegate('woop', permissions)

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)
  }

  permissions.forEach((p) => {
    const m = fMDelegate[`atOrAbove${capitalize(p)}`]
    expect(m).to.not.be.equal(null)
    expect(m).to.not.be.equal(undefined)
  })

  permissions.forEach((p) => {
    const m = fMDelegate[`when${capitalize(p)}`]
    expect(m).to.not.be.equal(null)
    expect(m).to.not.be.equal(undefined)
  })
}

function oldApiThrowsErr () {
  const permissions = ['low', 'medium', 'high']
  const fMDelegate = new FieldMapperDelegate('woop', permissions)

  try {
    fMDelegate.whenPrivate()
    throw new Error('Should have thrown error using old API')
  } catch (err) {
    expect(err).to.not.be.equal(null)
  }

  try {
    fMDelegate.atOrAbovePrivate()
    throw new Error('Should have thrown error using old API')
  } catch (err) {
    expect(err).to.not.be.equal(null)
  }
}

export {
  always,
  alwaysSetsAllLvls,
  passthroughAlways,
  buildWithAlways,
  subTransformWithPermission,
  subTransformWithoutPermission,
  subTransformWithPermissionInvalidErr,
  asList,
  checkAlways,
  restrictAtOrAbove,
  transformAtLvl,
  transformBelowLvl,
  when,
  atOrAbove,
  restrictTo,
  _restrictTo,
  setPermissionRanking,
  buildPermissionMethods,
  oldApiThrowsErr
}
