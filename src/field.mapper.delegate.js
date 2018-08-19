'use strict'

import { PassthroughFieldMapper, CustomFieldMapper, SubTransformFieldMapper } from './fieldMapper'
import { PermissionRanking } from './permission'

const restrictTo = 'restrictTo'
const when = 'when'

class FieldMapperDelegate {
  constructor (sourceKey, permissionRanking) {
    this.permissionRanking = permissionRanking || PermissionRanking

    if (permissionRanking) {
      this.setPermissionRanking()
    } else {
      this._defaultPermissionRanking = true
    }

    this.sourceKey = sourceKey
    this.delegate = {}
  }

  getMapper (permission) {
    return this.delegate[permission]
  }

  always () {
    this._always = true
    // doesn't matter what we set permission to since builder will be copied across all lvls
    this.curPermissionLvl = this.permissionRanking[0]
    return this
  }

  passthrough () {
    this.delegate[this.curPermissionLvl] = new PassthroughFieldMapper()
    this.checkAlways()
    this.restrict(this.delegate[this.curPermissionLvl])
    this.curPermissionLvl = null
    return this
  }

  buildWith (builder) {
    this.delegate[this.curPermissionLvl] = new CustomFieldMapper(builder)
    this.checkAlways()
    this.restrict(this.delegate[this.curPermissionLvl])
    this.curPermissionLvl = null
    return this
  }

  /**
   * Using the provided key and optional permissionLvl, retrieve the transformer
   * from the registry and use this transformer and permissionLvl to transform the field.
   *
   * @param {String} transformerKey - the key where the transform is registered
   * @param {FieldPermissionLvl} *optional* permissionLvl - an optional permissionLvl. This can
   * be used to set an overall permission for transforming the child object, no matter what permission
   * lvl the parent is being transformed.
   */
  subTransform (transformerKey, permissionLvl) {
    /**
     * Set all permission lvls on this transform
     * to transform the child object using the provided permissionLvl
     */
    if (permissionLvl) {
      if (this.permissionRanking.indexOf(permissionLvl) === -1) {
        throw new Error('Invalid permission lvl provided')
      }
      let mapper = new SubTransformFieldMapper(transformerKey, permissionLvl)
      this.permissionRanking.forEach((curPermissionLvl) => {
        // Using same mapper for each lvl on parent
        this.delegate[curPermissionLvl] = mapper
      })
    } else {
      // use parents permission lvl
      this.permissionRanking.forEach((curPermissionLvl) => {
        this.delegate[curPermissionLvl] = new SubTransformFieldMapper(transformerKey, curPermissionLvl)
      })
    }
    // reset always flag, since all lvls are set above
    this._always = null
    /**
     * Restrict transforming if needed. This will go back and null out some lvls we just set
     * if that is desired.
     */
    this.restrict(this.delegate[this.curPermissionLvl])
    this.curPermissionLvl = null
    return this
  }

  // Indicate transforming list of models ie. 1:M or M:M associations
  asList () {
    this.isList = true
    return this
  }

  /**
   * Set all permission lvls to call the same field mapper
   * ie. its always used to map that field
   */
  checkAlways () {
    if (this._always) {
      // Set the delegate for each permission lvl to the same delegate
      this.permissionRanking.forEach((permission) => {
        this.delegate[permission] = this.delegate[this.curPermissionLvl]
      })
      this._always = null
    }
  }

  /**
   * Restrict access to fields less than the specified restriction
   * and reset flag
   * @param {Function} builder - the builder function
   */
  restrict (fieldMapper) {
    if (this.restriction !== null && this.restriction !== undefined) {
      for (let i = 0; i < this.permissionRanking.length; i++) {
        if (i < this.restriction) {
          this.delegate[this.permissionRanking[i]] = null
          continue
        }
        this.delegate[this.permissionRanking[i]] = fieldMapper
      }
    }
  }

  /**
   * Grab the value from the instance and transform it using
   * the specified fieldMapper
   *
   * @param {FieldPermissionLvl} permission - the indicated permission
   * used to specify the builder to transform the field
   * @param {Instance} instance - the instance that is currently
   * being transformed.
   */
  transform (permission, instance) {
    let fieldMapper = this.delegate[permission]

    if (fieldMapper) {
      // Map calls builder so always returns a Promise
      return fieldMapper.map(instance, this.sourceKey, this.isList)
    }
    // Lacking permissions
    return Promise.resolve()
  }

  when (permission) {
    this.curPermissionLvl = permission
    return this
  }

  restrictTo (permission) {
    let index = this.permissionRanking.indexOf(permission)
    if (index === -1) {
      throw new Error('Permission Lvl Not Found')
    }
    this.restriction = index
    this.curPermissionLvl = permission
    return this
  }

  setPermissionRanking () {
    this.buildPermissionMethods()
  }

  buildPermissionMethods () {
    if (!this.permissionRanking) {
      return
    }
    // Dynamically add all of the permission methods to the FieldMapperDelegate Class
    this.permissionRanking.forEach((permission) => {
      let capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)
      }

      // Add all restrictTo_____ methods
      this[`${restrictTo}${capitalize(permission)}`] = () => {
        return this.restrictTo(permission)
      }

      // Add all when_____ methods
      this[`${when}${capitalize(permission)}`] = () => {
        return this.when(permission)
      }
    })
  }
}

/**
 * To prevent having mulitple duplicate default functions in memory for the default API
 * we add them on the prototype and check if they have been overwritten
 */
PermissionRanking.forEach((permission) => {
  let capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)
  }

  // Add all restrictTo_____ methods
  FieldMapperDelegate.prototype[`${restrictTo}${capitalize(permission)}`] = function () {
    if (!this._defaultPermissionRanking) {
      throw new Error('Cannot use overwritten default permission ranking API')
    }
    return this.restrictTo(permission)
  }

  // Add all when_____ methods
  FieldMapperDelegate.prototype[`${when}${capitalize(permission)}`] = function () {
    if (!this._defaultPermissionRanking) {
      throw new Error('Cannot use overwritten default permission ranking API')
    }
    return this.when(permission)
  }
})

export { FieldMapperDelegate }
