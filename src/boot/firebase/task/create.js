import handleError from './error'

export default context => {
  return {
    create: create(context),
    subtask: {
      create: createSubtask(context)
    },
    comment: {
      create: commentTask(context)
    }
  }
}

export const create = context => async data => {
  const {
    containerId,
    containerType,
    name,
    description,
    deadline,
    assigneeId,
    members = []
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { id, orgId } = store.getters['auth/user']
  const { teamLeadId } = store.getters[`${containerType}s/${containerType}ById`](containerId)

  try {
    const docRef = await $firebase.db.doc(`${containerType}s/${containerId}`)

    await $firebase.db.runTransaction(async transaction => {
      const doc = await transaction.get(docRef)

      if (!doc.exists) {
        // @todo normalize all kind of Errors
        throw new Error(`The ${containerType} does not exist!`)
      }

      const tasksCount = doc.data().tasksCount || 0

      const newTask = await $firebase.db.collection('tasks').doc()
      await newTask.set({
        id: newTask.id,
        createdAt: $firebase.serverTimestamp(),
        createdBy: id,
        no: tasksCount + 1,
        orgId,
        containerId,
        containerType,
        name,
        description,
        deadline,
        assigneeId,
        members: members.includes(teamLeadId) ? members : [...members, teamLeadId],
        completed: false,
        status: 'todo'
      })

      return transaction.update(docRef, { tasksCount: tasksCount + 1 })
    })
  } catch (error) {
    handleError(error)
  }
}

export const createSubtask = context => async data => {
  const {
    taskId,
    name,
    description,
    deadline,
    assigneeId
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { id, orgId } = store.getters['auth/user']

  try {
    const taskDocRef = await $firebase.db.doc(`tasks/${taskId}`)

    await $firebase.db.runTransaction(async transaction => {
      const taskDoc = await transaction.get(taskDocRef)
      const task = taskDoc.data()

      if (!taskDoc.exists) {
        // @todo normalize all kind of Errors
        throw new Error('The task does not exist!')
      }

      const subtasksCount = task.subtasksCount || 0

      const newSubtask = $firebase.db.collection(`tasks/${taskId}/subtasks`).doc()
      await newSubtask.set({
        id: newSubtask.id,
        createdAt: $firebase.serverTimestamp(),
        createdBy: id,
        name,
        description,
        deadline,
        assigneeId,
        completed: false,
        orgId,
        containerId: task.containerId,
        containerType: task.containerType,
        taskId
      })

      return transaction.update(taskDocRef, { subtasksCount: subtasksCount + 1 })
    })
  } catch (error) {
    handleError(error)
  }
}

export const commentTask = context => async data => {
  const {
    taskId,
    text
  } = data
  const { Vue, store } = context
  const { $firebase } = Vue.prototype
  const { id, orgId } = store.getters['auth/user']

  try {
    const taskDocRef = await $firebase.db.doc(`tasks/${taskId}`)

    await $firebase.db.runTransaction(async transaction => {
      const taskDoc = await transaction.get(taskDocRef)
      const task = taskDoc.data()

      if (!taskDoc.exists) {
        // @todo normalize all kind of Errors
        throw new Error('The task does not exist!')
      }

      const commentsCount = taskDoc.data().commentsCount || 0

      const newComment = $firebase.db.collection(`tasks/${taskId}/comments`).doc()
      await newComment.set({
        id: newComment.id,
        createdAt: $firebase.serverTimestamp(),
        createdBy: id,
        text,
        isCreatorMavrikUser: true,
        orgId,
        taskId,
        containerId: task.containerId,
        containerType: task.containerType
      })

      return transaction.update(taskDocRef, { commentsCount: commentsCount + 1 })
    })
  } catch (error) {
    handleError(error)
  }
}
