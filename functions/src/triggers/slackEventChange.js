import * as functions from 'firebase-functions'
import { onceSlackEventReceived } from '../app'

export const slackEventOnCreate = functions.firestore
  .document('slackEvents/{eventId}')
  .onCreate(async (snap, context) => {
    try {
      await onceSlackEventReceived({
        event: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('slackOnCreate', error)
    }
  })
