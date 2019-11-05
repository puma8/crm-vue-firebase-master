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
    companyId,
    position,
    phoneNumbers,
    emails
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { createdAt, ...update } = {
    ...store.getters['people/personById'](id),
    ...sanitizeJson({ name, companyId, position, phoneNumbers, emails })
  }

  try {
    await $firebase.db.doc(`people/${id}`).update(update)
    return {
      data: { success: true }
    }
  } catch (error) {
    handleError(error)
  }
}
