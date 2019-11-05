import moment from 'moment'
import handleError from './error'
import { sanitizeJson, composeError } from 'src/utils'

export default context => {
  return {
    complete: complete(context),
    update: update(context),
    subtask: {
      update: updateSubtask(context)
    }
  }
}

export const update = context => async data => {
  const {
    id,
    orgId,
    containerId,
    name,
    deadline,
    description,
    assigneeId,
    members,
    completed,
    status,
    subtasks,
    statusChangedAt,
    statusChangedBy
  } = data
  const { Vue, store } = context
  const { $firebase } = Vue.prototype
  const { id: userId } = store.getters['auth/user']
  const update = sanitizeJson({
    updatedAt: $firebase.serverTimestamp(),
    updatedBy: userId,
    statusChangedAt,
    statusChangedBy,
    orgId,
    containerId,
    name,
    deadline:
      typeof deadline === 'string'
        ? $firebase.serverTimestampFromDate(moment(deadline).toDate())
        : $firebase.serverTimestampFromDate(deadline.toDate()),
    description,
    assigneeId,
    members,
    completed,
    status,
    subtasks
  })

  try {
    await $firebase.db.doc(`tasks/${id}`).update(update)
    return {
      data: { success: true }
    }
  } catch (error) {
    handleError(error)
  }
}

export const complete = context => async data => {
  const { id, orgId, completed, status } = data
  const { Vue, store } = context
  const { id: userId } = store.getters['auth/user']
  const { $firebase } = Vue.prototype

  try {
    if (!completed) {
      return update(context)({
        ...data,
        completed: false,
        status,
        statusChangedAt: $firebase.serverTimestamp(),
        statusChangedBy: userId
      })
    } else {
      const uncompletedSubtasks = await $firebase.db
        .collection(`tasks/${id}/subtasks`)
        .where('orgId', '==', orgId)
        .where('completed', '==', false)
        .get()

      if (uncompletedSubtasks.size === 0) {
        return update(context)({
          ...data,
          completed: true,
          status,
          statusChangedAt: $firebase.serverTimestamp(),
          statusChangedBy: userId
        })
      } else {
        throw composeError(
          'task/uncompleted-subtasks-exist',
          'The task can not be completed because it includes uncompleted subtasks'
        )
      }
    }
  } catch (error) {
    handleError(error)
  }
}

export const updateSubtask = context => async data => {
  const { Vue, store } = context
  const { $firebase } = Vue.prototype
  const { id: userId } = store.getters['auth/user']
  const { taskId, id, deadline } = data

  try {
    await $firebase.db.doc(`tasks/${taskId}/subtasks/${id}`).update({
      ...data,
      deadline,
      updatedAt: $firebase.serverTimestamp(),
      updatedBy: userId
    })

    return {
      data: { success: true }
    }
  } catch (error) {
    handleError(error)
  }
}
