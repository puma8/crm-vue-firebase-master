import admin from 'firebase-admin'

import getOrgGoogleDriveIntegration from './getOrgGoogleDriveIntegration'
import {
  getDriveChangesStartPageToken,
  watchDriveChanges
} from '../../thirdParty/gapis/drive'

const fStore = admin.firestore()

export default async (orgId, fileId, integration) => {
  const newChannel = await fStore.collection('gDriveNotificationChannels').doc()
  let _integration = integration
  if (_integration) {
    _integration = await getOrgGoogleDriveIntegration(orgId)
  }

  if (_integration) {
    const startPageToken = await getDriveChangesStartPageToken(_integration)

    if (startPageToken) {
      await fStore.doc(`gDriveNotificationChannels/${newChannel.id}`).set({
        orgId,
        driveId: fileId,
        driveType: 'standard',
        startPageToken
      })
      // await watchFileChanges(_integration, fileId, newChannel.id)
      await watchDriveChanges(integration, null, startPageToken, newChannel.id)
    }
  }
}
