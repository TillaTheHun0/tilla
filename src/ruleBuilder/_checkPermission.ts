
import { FieldMapperDelegate } from 'src/fieldMapperDelegate'
import { Rule } from './types'

/**
 * Wraps the provided Rule, checking that the provided Permission is valid
 * in the Permission Ranking in context
 *
 * @param permission - The permission to check
 * @param rule - The Rule to wrap
 */
export const checkPermission = (permission: string, rule: Rule): Rule =>
  (fieldMapperDelegate: FieldMapperDelegate) => {
    const { permissionRanking } = fieldMapperDelegate
    if (permissionRanking.indexOf(permission) === -1) {
      throw new Error('Permission Lvl Not Found')
    }

    return rule(fieldMapperDelegate)
  }
