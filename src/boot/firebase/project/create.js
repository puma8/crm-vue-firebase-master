import handleError from './error'

export default context => {
  return {
    create: create(context)
  }
}

export const create = context => async data => {
  const {
    name,
    sectionId,
    teamLeadId,
    people,
    members = []
  } = data
  const {
    store,
    Vue
  } = context
  const {
    $firebase
  } = Vue.prototype
  const {
    orgId,
    id: userId
  } = store.getters['auth/user']

  try {
    const newProject = await $firebase.db.collection('projects').doc()
    await newProject.set({
      id: newProject.id,
      createdAt: $firebase.serverTimestamp(),
      createdBy: userId,
      orgId,
      name,
      sectionId,
      teamLeadId,
      people,
      members: members.includes(teamLeadId) ? members : [...members, teamLeadId]
    })

    return newProject.id
  } catch (error) {
    handleError(error)
  }
}
