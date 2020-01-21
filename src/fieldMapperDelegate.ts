
import { PermissionRanking } from './permission'

import { FieldMapper } from './fieldMapper'
import { Rule } from './ruleBuilder'

export class FieldMapperDelegate {
  sourceKey: string | undefined
  isList: boolean
  delegateMap: {
    [permissionLvl: string]: FieldMapper | null | undefined
  }

  permissionRanking: string[]

  constructor (sourceKey: string | undefined, permissionRanking = PermissionRanking, ...rulesFns: Rule[]) {
    this.sourceKey = sourceKey
    this.delegateMap = {}
    this.isList = false
    this.permissionRanking = permissionRanking

    if (!rulesFns.length) {
      console.warn('No rules specified. This FieldMapperDelegate will essentially do nothing')
    }

    // Apply the rules
    rulesFns.reduce((self, rule) => {
      return rule(self)
    }, this as FieldMapperDelegate)
  }

  async transform (permission: string, instance: any) {
    const fieldMapper = this.delegateMap[permission]

    if (!fieldMapper) {
      // Lacking permissions
      return
    }

    // Map calls builder so always returns a Promise
    return fieldMapper(instance, this.sourceKey as string, this.isList)
  }
}
