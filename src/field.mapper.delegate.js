'use strict'

import { PassthroughFieldMapper, CustomFieldMapper, SubTransformFieldMapper } from './fieldMapper'
import { PermissionRanking } from './permission'

const restrictTo = 'restrictTo'
const when = 'when'

/**
 * FieldMapperDelegates provide the API for orchaestrating and arranging
 * FieldMappers on a Transformer. They should typically be used through the util module
 */
class FieldMapperDelegate {
  /**
   * @param {string} [sourceKey] - the key on the source object.
   * @param {Array<string>} permissionRanking - a custom permission ranking to use to build
   * the permission api.
   */
  constructor (sourceKey, permissionRanking) {
    this.permissionRanking = permissionRanking || PermissionRanking

    if (!permissionRanking) {
      this._defaultPermissionRanking = true
    }

    this.setPermissionRanking()

    this.sourceKey = sourceKey
    this.delegate = {}
  }

  /**
   * Indicate the following action should be used for every permission level
   */
  always () {
    this._always = true
    // doesn't matter what we set permission to since builder will be copied across all lvls
    this.curPermissionLvl = this.permissionRanking[0]
    return this
  }

  /**
   * Indicate the following action should be used for the indicated permission level
   *
   * @param {string} permission - the permission level
   */
  when (permission) {
    this.curPermissionLvl = permission
    return this
  }

  /**
   * Indicate the following action should be used for this permission level and above
   *
   * @param {string} permission - the permission level
   */
  restrictTo (permission) {
    let index = this.permissionRanking.indexOf(permission)
    if (index === -1) {
      throw new Error('Permission Lvl Not Found')
    }
    this.restriction = index
    this.curPermissionLvl = permission
    return this
  }

  /**
   * Assigns a PassthroughFieldMapper to the current permission masking
   */
  passthrough () {
    this.delegate[this.curPermissionLvl] = new PassthroughFieldMapper()
    this._checkAlways()
    this._restrict(this.delegate[this.curPermissionLvl])
    this.curPermissionLvl = null
    return this
  }

  /**
   * Assign a CustomFieldMapper to the current permission masking
   *
   * @param {function (instance: Object, key: string, isList: boolean)} builder - the builder function to use when building this field
   */
  buildWith (builder) {
    this.delegate[this.curPermissionLvl] = new CustomFieldMapper(builder)
    this._checkAlways()
    this._restrict(this.delegate[this.curPermissionLvl])
    this.curPermissionLvl = null
    return this
  }

  /**
   * Assign a SubtransformFieldMapper, indicated by @param transformerKey
   * to the current permission masking.
   *
   * @param {string | Transformer | function (): any } transformerKey - the Transformer provider.
   * @param {string} [permissionLvl] - If provided, the permission level is used to perform the subtransformation.
   * By the default the parents permission level is used.
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
    this._restrict(this.delegate[this.curPermissionLvl])
    this.curPermissionLvl = null
    return this
  }

  /**
   * Set the isList falg to be passed to the FieldMapper ie. 1:M or M:M associations
   */
  asList () {
    this.isList = true
    return this
  }

  /**
   * Set all permission lvls to use the same field mapper if the always flag is set
   */
  _checkAlways () {
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
   *
   * @param {FieldMapper} fieldMapper - the FieldMapper instance
   */
  _restrict (fieldMapper) {
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
   * Perform the field transformation at the provided permission level
   *
   * @param {string} permission - The permission level to perform the transformation
   * @param {Object} instance - the source object
   *
   * @return {Promise} the transformed value
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

  setPermissionRanking () {
    this.buildPermissionMethods()
  }

  /**
   * Build the permission API for the provided permission ranking on the FieldMapperDelegate instance
   */
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
