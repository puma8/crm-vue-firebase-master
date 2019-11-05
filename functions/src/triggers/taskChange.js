import * as functions from 'firebase-functions'
import {
  onceTaskCreated,
  onceTaskCompleted,
  onceCommentCreated,
  onceSubtaskCreated,
  onceSubaskCompleted,
  onceTaskAssigneeUpdated,
  onceTaskFollowersUpdated,
  onceSubtaskAssigneeUpdated
} from '../app'
import { isEqual as isEqualArray } from '../utils/array'

export const taskOnCreate = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    try {
      await onceTaskCreated({
        task: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('taskOnCreate', error)
    }
  })

export const taskOnUpdate = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async change => {
    try {
      const newTask = change.after.data()
      const prevTask = change.before.data()

      if (newTask.completed !== prevTask.completed || newTask.status !== prevTask.status) {
        await onceTaskCompleted({
          task: newTask
        })
      }

      if (newTask.assigneeId !== prevTask.assigneeId) {
        await onceTaskAssigneeUpdated({
          task: newTask,
          previousAssigneeId: prevTask.assigneeId
        })
      }

      if (!isEqualArray(newTask.members, prevTask.members)) {
        await onceTaskFollowersUpdated({
          task: newTask
        })
      }
    } catch (error) {
      // @todo report to google analytics
      console.log('taskOnUpdate', error)
    }
  })

export const subtaskOnCreate = functions.firestore
  .document('tasks/{taskId}/subtasks/{subtaskId}')
  .onCreate(async (snap, context) => {
    try {
      await onceSubtaskCreated({
        subtask: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('subtaskOnCreate', error)
    }
  })

export const subtaskOnUpdate = functions.firestore
  .document('tasks/{taskId}/subtasks/{subtaskId}')
  .onUpdate(async (change, context) => {
    try {
      const newSubtask = change.after.data()
      const oldSubtask = change.before.data()

      if (newSubtask.assigneeId !== oldSubtask.assigneeId) {
        await onceSubtaskAssigneeUpdated({
          subtask: newSubtask,
          assigneeId: newSubtask.assigneeId
        })
      }

      if (newSubtask.completed !== oldSubtask.completed) {
        await onceSubaskCompleted({
          subtask: newSubtask
        })
      }
    } catch (error) {
      // @todo report to google analytics
      console.log('subtaskOnUpdate', error)
    }
  })

export const commentOnCreate = functions.firestore
  .document('tasks/{taskId}/comments/{commentId}')
  .onCreate(async (snap, context) => {
    try {
      onceCommentCreated({
        comment: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('commentOnCreate', error)
    }
  })
