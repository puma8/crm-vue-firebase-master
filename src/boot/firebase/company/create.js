import handleError from './error'

export default context => {
  return {
    create: create(context)
  }
}

export const create = context => async data => {
  const {
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
  const { orgId } = store.getters['auth/user']

  try {
    const newCompany = await $firebase.db.collection('companies').doc()
    await newCompany.set({
      id: newCompany.id,
      createdAt: $firebase.serverTimestamp(),
      orgId,
      name,
      website,
      address,
      designationId,
      roleId,
      phoneNumbers,
      emails
    })

    return newCompany.id
  } catch (error) {
    handleError(error)
  }
}
