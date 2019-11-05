import * as functions from 'firebase-functions'
import {
  onceProjectCreated,
  onceProjectUpdated,
  onceProjectDeleted,
  onceProjectMembersUpdated
} from '../app'

export const projectOnCreate = functions.firestore
  .document('projects/{projectId}')
  .onCreate(async (snap, context) => {
    try {
      await onceProjectCreated({
        project: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('projectOnCreate', error)
    }
  })

export const projectOnUpdate = functions.firestore
  .document('projects/{projectId}')
  .onUpdate(async (change, context) => {
    const members = change.after.data().members || []
    const oldMembers = change.before.data().members || []

    try {
      await onceProjectMembersUpdated({
        id: context.params.projectId,
        members,
        oldMembers
      })

      await onceProjectUpdated({
        projectBefore: change.before.data(),
        project: change.after.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('projectOnUpdate', error)
    }
  })

export const projectOnDelete = functions.firestore
  .document('projects/{projectId}')
  .onDelete(async (snap, context) => {
    try {
      await onceProjectDeleted({
        project: snap.data()
      })
    } catch (error) {
      console.log('projectOnDelete', error)
    }
  })
