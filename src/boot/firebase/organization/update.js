import handleError from './error'

export default context => {
  return {
    update: update(context)
  }
}

export const update = context => async data => {
  const {
    name
  } = data

  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const { createdAt, ...update } = {
    ...store.getters['organization/data'],
    ...{ name }
  }

  try {
    await $firebase.db.doc(`organizations/${orgId}`).update(update)
  } catch (error) {
    handleError(error)
  }
}
