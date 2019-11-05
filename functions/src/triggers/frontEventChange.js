import * as functions from 'firebase-functions'
import {
  onceFrontEventReceived
} from '../app'

export const frontEventOnCreate = functions.firestore
  .document('frontEvents/{eventId}')
  .onCreate(async (snap, context) => {
    try {
      await onceFrontEventReceived({
        event: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('frontOnCreate', error)
    }
  })
