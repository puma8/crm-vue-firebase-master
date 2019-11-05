import handleError from './error'
import { sanitizeJson } from 'src/utils'

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
    boardId,
    stageId,
    teamLeadId,
    revenue,
    members,
    people,
    customFields,
    archived
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { id: userId } = store.getters['auth/user']

  const { createdAt, ...update } = {
    ...store.getters['deals/dealById'](id),
    ...sanitizeJson({
      updatedAt: $firebase.serverTimestamp(),
      updatedBy: userId,
      name,
      tags,
      boardId,
      stageId,
      teamLeadId,
      revenue,
      members,
      people,
      customFields,
      archived
    })
  }

  try {
    await $firebase.db.doc(`deals/${id}`).update(update)
    return {
      data: { success: true }
    }
  } catch (error) {
    handleError(error)
  }
}
