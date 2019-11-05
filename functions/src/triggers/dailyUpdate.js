import * as functions from 'firebase-functions'
import { dailyUpdate, extendNotificationExpiration } from '../app'

export default functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('America/New_York')
  .onRun(async context => {
    await dailyUpdate(context)
    await extendNotificationExpiration(context)
    return null
  })
