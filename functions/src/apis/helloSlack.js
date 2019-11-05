import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import config from '../utils/config'

const fStore = admin.firestore()
const consideredEventTypes = [
  'message'
]
const consideredEventSubtypes = [
]
const consideredInteractiveEventTypes = [
  'block_actions',
  'message_action',
  'dialog_submission'
]

export default functions.https.onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    return response.send(405, 'Only POST requests are accepted')
  }

  if (request.body.token === config.slack.verification_token) {
    if (request.body.type === 'url_verification') return response.status(200).send(request.body)

    const eventType = request.body.event.type
    const eventSubtype = request.body.event.subtype
    const isConsiderableEvent = consideredEventTypes.includes(eventType) && (!eventSubtype || consideredEventSubtypes.includes(eventSubtype))
    if (isConsiderableEvent) {
      await fStore.collection('slackEvents').add(request.body)
    }

    return response.status(200).send(request.body)
  } else if (request.body.payload) {
    const payload = JSON.parse(request.body.payload)
    if (payload.token === config.slack.verification_token) {
      if (consideredInteractiveEventTypes.includes(payload.type)) {
        await fStore.collection('slackEvents').add(payload)
      }
      return response.status(200).send()
    } else {
      return response.send(401, 'Invalid request token!')
    }
  } else {
    return response.send(401, 'Invalid request token!')
  }
})
