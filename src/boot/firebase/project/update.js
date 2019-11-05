import handleError from './error'
import {
  sanitizeJson
} from 'src/utils'

export default context => {
  return {
    update: update(context)
  }
}

export const update = context => async data => {
  const {
    id,
    name,
    tags,
    sectionId,
    teamLeadId,
    revenue,
    members,
    people,
    customFields,
    archived
  } = data
  const {
    store,
    Vue
  } = context
  const {
    $firebase
  } = Vue.prototype
  const {
    id: userId
  } = store.getters['auth/user']
  const {
    createdAt,
    ...update
  } = {
    ...store.getters['projects/projectById'](id),
    ...sanitizeJson({
      updatedAt: $firebase.serverTimestamp(),
      updatedBy: userId,
      name,
      tags,
      sectionId,
      teamLeadId,
      revenue,
      members,
      people,
      customFields,
      archived
    })
  }

  try {
    await $firebase.db.doc(`projects/${id}`).update(update)
    return {
      data: {
        success: true
      }
    }
  } catch (error) {
    handleError(error)
  }
}
