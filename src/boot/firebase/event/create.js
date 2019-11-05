import handleError from './error'

export default context => {
  return {
    create: create(context)
  }
}

export const create = context => async data => {
  const { event, containerType, containerId } = data

  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { id: userId, orgId } = store.getters['auth/user']

  try {
    const newEvent = await $firebase.db.collection('events').doc()
    await newEvent.set({
      id: newEvent.id,
      createdAt: $firebase.serverTimestamp(),
      createdBy: userId,
      orgId,
      containerType,
      containerId,
      ...event
    })

    return newEvent.id
  } catch (error) {
    handleError(error)
  }
}
