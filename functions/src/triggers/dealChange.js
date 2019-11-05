import * as functions from 'firebase-functions'
import {
  onceDealCreated,
  onceDealUpdated,
  onceDealDeleted,
  onceDealMembersUpdated
} from '../app'
import { isEqual as isEqualArray } from '../utils/array'

export const dealOnCreate = functions.firestore
  .document('deals/{dealId}')
  .onCreate(async (snap, context) => {
    try {
      await onceDealCreated({
        deal: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('dealOnCreate', error)
    }
  })

export const dealOnUpdate = functions.firestore
  .document('deals/{dealId}')
  .onUpdate(async (change, context) => {
    const members = change.after.data().members || []
    const oldMembers = change.before.data().members || []

    try {
      if (!isEqualArray(members, oldMembers)) {
        await onceDealMembersUpdated({
          id: context.params.dealId,
          members,
          oldMembers
        })
      }

      await onceDealUpdated({
        dealBefore: change.before.data(),
        deal: change.after.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('dealOnUpdate', error)
    }
  })

export const dealOnDelete = functions.firestore
  .document('deals/{dealId}')
  .onDelete(async (snap, context) => {
    try {
      await onceDealDeleted({
        deal: snap.data()
      })
    } catch (error) {
      console.log('dealOnDelete', error)
    }
  })
