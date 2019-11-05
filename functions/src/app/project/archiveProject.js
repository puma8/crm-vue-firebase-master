import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import { channelsArchive, channelsUnarchive } from '../../thirdParty/slack'

const fStore = admin.firestore()

export default async (data, context) => {
  const { id, archived } = data
  const uid = context.auth.uid

  try {
    await fStore.doc(`projects/${id}`).update({
      archived,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      archivedBy: uid
    })

    const projectDoc = await fStore.doc(`projects/${id}`).get()
    const project = projectDoc.data()
    const integration = await getOrgSlackIntegration(project.orgId)

    if (integration) {
      const func = archived ? channelsArchive : channelsUnarchive
      await func(integration.accessToken, {
        channel: project.slackChannel.id
      })
    }

    return {
      success: true
    }
  } catch (error) {
    console.log('archiveProject error', error)
    handleError(error)
  }
}
