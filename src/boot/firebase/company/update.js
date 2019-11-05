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
    website,
    address,
    designationId,
    roleId,
    phoneNumbers,
    emails
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { createdAt, ...update } = {
    ...store.getters['companies/companyById'](id),
    ...sanitizeJson({ name, website, address, designationId, roleId, phoneNumbers, emails })
  }

  try {
    await $firebase.db.doc(`companies/${id}`).update(update)
    return {
      data: { success: true }
    }
  } catch (error) {
    handleError(error)
  }
}
