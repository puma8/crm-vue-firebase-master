import * as functions from 'firebase-functions'
import moment from 'moment'
import admin from 'firebase-admin'
import { listDriveActivity } from '../thirdParty/gapis/drive'
import getOrgGoogleDriveIntegration from '../app/googleDrive/getOrgGoogleDriveIntegration'

const fStore = admin.firestore()

export default functions.https.onRequest(async (request, response) => {
  const headers = request.headers
  const channelId = headers['x-goog-channel-id']
  const resourceState = headers['x-goog-resource-state']
  const resourceId = headers['x-goog-resource-id']
  const channelExpiration = headers['x-goog-channel-expiration']

  const channelDoc = await fStore
    .doc(`gDriveNotificationChannels/${channelId}`)
    .get()
  if (!channelDoc.exists) {
    return response.status(200).send(request.body)
  }

  const channel = channelDoc.data()
  const integration = await getOrgGoogleDriveIntegration(channel.orgId)

  // *sync* state is an echo of notification channel registration.
  if (resourceState === 'sync') {
    // store expiration date to the channel database.
    await fStore.doc(`gDriveNotificationChannels/${channelId}`).update({
      expiration: moment(channelExpiration).toDate(),
      resourceId
    })
  } else {
    // List all activities in the google folder of `channel.driveId` starting from the page of `channel.startPageToken`
    const params = {}
    params.pageToken = channel.startPageToken
    if (channel.driveType === 'shared') {
      params.driveId = channel.driveId
    }
    const activityResponse = await listDriveActivity(integration, params)

    // Instantly store the next page token for the next notification
    await fStore.doc(`gDriveNotificationChannels/${channelId}`).update({
      startPageToken: activityResponse.data.newStartPageToken,
      expiration: moment(channelExpiration).toDate()
    })

    // push activities data to gDriveEvents queue. `onceGoogleDriveEventReceived` will handle each activity
    await fStore.collection('gDriveEvents').add({
      orgId: channel.orgId,
      driveId: channel.driveId,
      driveType: channel.driveType || 'standard',
      changes: activityResponse.data.changes
    })
  }
  return response.status(200).send(request.body)
})
