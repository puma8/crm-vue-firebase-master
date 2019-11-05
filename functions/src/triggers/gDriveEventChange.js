import * as functions from 'firebase-functions'
import {
  onceGoogleDriveEventReceived
} from '../app'

export const gDriveEventOnCreate = functions.firestore
  .document('gDriveEvents/{eventId}')
  .onCreate(async (snap) => {
    try {
      await onceGoogleDriveEventReceived({
        event: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('gDriveEventOnCreate', error)
    }
  })
