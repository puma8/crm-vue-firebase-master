import * as functions from 'firebase-functions'
import { onceSlackIntegrated } from '../app'

export const slackIntegrationOnCreate = functions.firestore
  .document('integration/slack/private/{userId}')
  .onCreate(async (snap, context) => {
    try {
      await onceSlackIntegrated({
        integration: snap.data()
      })
    } catch (error) {
      // @todo report to google analytics
      console.log('slack integration change', error)
    }
  })
