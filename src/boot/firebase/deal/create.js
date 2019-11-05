import handleError from './error'

export default context => {
  return {
    create: create(context)
  }
}

export const create = context => async data => {
  const {
    name,
    boardId,
    stageId,
    teamLeadId,
    people,
    members = []
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const {
    id: userId,
    orgId
  } = store.getters['auth/user']

  try {
    const newDeal = await $firebase.db.collection('deals').doc()
    await newDeal.set({
      id: newDeal.id,
      createdAt: $firebase.serverTimestamp(),
      createdBy: userId,
      orgId,
      name,
      boardId,
      stageId,
      teamLeadId,
      people,
      members: members.includes(teamLeadId) ? members : [...members, teamLeadId]
    })

    return newDeal.id
  } catch (error) {
    handleError(error)
  }
}
