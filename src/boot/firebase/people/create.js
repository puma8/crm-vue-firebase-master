import handleError from './error'

export default context => {
  return {
    create: create(context)
  }
}

export const create = context => async data => {
  const {
    name,
    companyId,
    position,
    phoneNumbers,
    emails
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']

  try {
    const newContact = await $firebase.db.collection('people').doc()
    await newContact.set({
      id: newContact.id,
      createdAt: $firebase.serverTimestamp(),
      orgId,
      name,
      companyId,
      position,
      phoneNumbers,
      emails
    })

    return newContact.id
  } catch (error) {
    handleError(error)
  }
}
