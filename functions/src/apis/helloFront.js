import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
// import { onceFrontEventReceived } from '../app'

const fStore = admin.firestore()

export default functions.https.onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    return response.send(405, 'Only POST requests are accepted')
  }

  const event = request.body

  const frontEventDoc = await fStore.collection('frontEvents').doc()
  await frontEventDoc.set({
    docId: frontEventDoc.id,
    ...event
  })

  // await onceFrontEventReceived({
  //   event: {
  //     docId: frontEventDoc.id,
  //     ...event
  //   }
  // })

  return response.status(200).send(request.body)
  // if (request.body.type !== 'url_verification') {
  // await fStore.collection('frontEvents').add(request.body)
  // }
  // return response.status(200).send(request.body)
  // } else {
  //   response.send(401, 'Invalid request token!')
  // }
})
