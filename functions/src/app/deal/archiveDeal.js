import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import { channelsArchive, channelsUnarchive } from '../../thirdParty/slack'

const fStore = admin.firestore()

export default async (data, context) => {
  const { id, archived } = data
  const uid = context.auth.uid

  try {
    await fStore.doc(`deals/${id}`).update({
      archived,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      archivedBy: uid
    })

    const dealDoc = await fStore.doc(`deals/${id}`).get()
    const deal = dealDoc.data()
    const integration = await getOrgSlackIntegration(deal.orgId)

    if (integration) {
      const func = archived ? channelsArchive : channelsUnarchive
      await func(integration.accessToken, {
        channel: deal.slackChannel.id
      })
    }

    return {
      success: true
    }
  } catch (error) {
    console.log('archiveDeal error', error)
    handleError(error)
  }
}
