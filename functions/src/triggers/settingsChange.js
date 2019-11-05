import * as functions from 'firebase-functions'
import {
  propagateDealCustomFields,
  propagateProjectCustomFields,
  propagateDealTags,
  propagateProjectTags
} from '../app'

export const dealSettingsOnUpdate = functions.firestore
  .document('organizations/{organizationId}/settings/deal')
  .onUpdate((change, context) => {
    const newCustomFields = change.after.data().customFields || []
    const prevCustomFields = change.before.data().customFields || []

    if (newCustomFields.length !== prevCustomFields.length) {
      return propagateDealCustomFields(
        context.params.organizationId,
        newCustomFields
      )
    }

    const newTags = change.after.data().tags || []
    const prevTags = change.before.data().tags || []

    if (newTags.length !== prevTags.length) {
      return propagateDealTags(context.params.organizationId, newTags)
    }

    return true
  })

export const projectSettingsOnUpdate = functions.firestore
  .document('organizations/{organizationId}/settings/project')
  .onUpdate((change, context) => {
    const newCustomFields = change.after.data().customFields || []
    const prevCustomFields = change.before.data().customFields || []

    if (newCustomFields.length !== prevCustomFields.length) {
      return propagateProjectCustomFields(
        context.params.organizationId,
        newCustomFields
      )
    }

    const newTags = change.after.data().tags || []
    const prevTags = change.before.data().tags || []

    if (newTags.length !== prevTags.length) {
      return propagateProjectTags(context.params.organizationId, newTags)
    }

    return true
  })
