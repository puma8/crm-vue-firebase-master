import admin from 'firebase-admin'
import moment from 'moment'
import { collectionResolver } from '../../utils/firestore'
import { stopChange } from '../../thirdParty/gapis/drive'
import getOrgGoogleDriveIntegration from '../googleDrive/getOrgGoogleDriveIntegration'
import createNotificationChannel from '../googleDrive/createNotificationChannel'

const fStore = admin.firestore()

export default async () => {
  try {
    const startDate = moment()
      .tz('America/New_York')
      .toDate()
    const endDate = moment()
      .tz('America/New_York')
      .add(1, 'd')
      .toDate()

    const channelResolver = async channelDoc => {
      const channel = channelDoc.data()
      const integration = await getOrgGoogleDriveIntegration(channel.orgId)
      if (integration) {
        await stopChange(integration, channelDoc.id, channel.resourceId)
        await createNotificationChannel(
          channel.orgId,
          channel.driveId,
          integration
        )
      }
    }
    await collectionResolver(
      fStore
        .collection('gDriveNotificationChannels')
        .where('expiration', '>=', startDate)
        .where('expiration', '<', endDate),
      channelResolver
    )
  } catch (error) {
    console.log('daily check notification expiration error', error)
  }
}
