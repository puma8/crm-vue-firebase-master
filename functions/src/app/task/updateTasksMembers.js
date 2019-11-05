import admin from 'firebase-admin'
import _ from 'lodash'
import {
  collectionResolver
} from '../../utils/firestore'

const fStore = admin.firestore()

export default async ({
  containerType,
  containerId,
  removedMembers = []
}) => {
  const taskResolver = async taskDoc => {
    const task = taskDoc.data()
    const members = _.difference(task.members, removedMembers)
    const updateData = {
      members
    }
    if (removedMembers.includes(task.assigneeId)) {
      updateData.assigneeId = null
    }
    await taskDoc.ref.update(updateData)

    const subtaskResolver = async subtaskDoc => {
      const subtask = subtaskDoc.data()
      if (removedMembers.includes(subtask.assigneeId)) {
        await subtaskDoc.ref.update({
          assigneeId: null
        })
      }
    }
    await collectionResolver(taskDoc.ref.collection('subtasks'), subtaskResolver)
  }
  await collectionResolver(
    fStore.collection('tasks')
      .where('containerId', '==', containerId)
      .where('containerType', '==', containerType),
    taskResolver
  )
}
