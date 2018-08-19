'use strict'

describe('FieldMapperDelegate', () => {
  const tests = require('./fieldMapperDelegate')

  it('should set and reset the always flag', tests.always)
  it('should set all the permission lvls and reset flag', tests.alwaysSetsAllLvls)
  it('should set each permission lvl to passthrough and clear cur permission lvl', tests.passthroughAlways)
  it('should set each permission lvl to the custom builder and clear cur permission lvl', tests.buildWithAlways)
  it('should use subtransformer and provided permission lvl', tests.subTransformWithPermission)
  it('should use subtransformer and parents permission lvl', tests.subTransformWithoutPermission)
  it('should throw error when given invalid subtransformer permission lvl', tests.subTransformWithPermissionInvalidErr)
  it('should set the is List flag', tests.asList)
  it('should set all permission lvls', tests.checkAlways)
  it('should set lower permissions to null', tests.restrict)
  it('should transform the field on the object', tests.transformAtLvl)
  it('should not transform the field and return undefined', tests.transformBelowLvl)
  it('should set the cur permission lvl', tests.when)
  it('should set the cur permission lvl and restriction', tests.restrictTo)
  it('should set the permission ranking on the prototype', tests.setPermissionRanking)
  it('should build the new permission API on the prototype', tests.buildPermissionMethods)
  it('should throw error if old API is used when permission ranking is provided', tests.oldApiThrowsErr)
})
