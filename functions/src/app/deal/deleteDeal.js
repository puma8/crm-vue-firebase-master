import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import { channelsRename, channelsArchive } from '../../thirdParty/slack'

const fStore = admin.firestore()

export default async (data, context) => {
  const { id } = data
  const uid = context.auth.uid

  try {
    const dealDoc = await fStore.doc(`deals/${id}`).get()
    const deal = dealDoc.data()
    await fStore.doc(`deals/${id}`).update({
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedBy: uid
    })

    const integration = await getOrgSlackIntegration(deal.orgId)

    if (integration) {
      await channelsRename(integration.accessToken, {
        channel: deal.slackChannel.id,
        name: `deleted-${deal.slackChannel.name}`
      })
      await channelsArchive(integration.accessToken, {
        channel: deal.slackChannel.id
      })
    }

    return {
      success: true
    }
  } catch (error) {
    console.log('deleteDeal error', error)
    handleError(error)
  }
}
