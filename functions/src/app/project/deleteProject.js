import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import { channelsRename, channelsArchive } from '../../thirdParty/slack'

const fStore = admin.firestore()

export default async (data, context) => {
  const { id } = data
  const uid = context.auth.uid

  try {
    const projectDoc = await fStore.doc(`projects/${id}`).get()
    const project = projectDoc.data()
    await fStore.doc(`projects/${id}`).update({
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedBy: uid
    })

    const integration = await getOrgSlackIntegration(project.orgId)

    if (integration) {
      await channelsRename(integration.accessToken, {
        channel: project.slackChannel.id,
        name: `deleted-${project.slackChannel.name}`
      })
      await channelsArchive(integration.accessToken, {
        channel: project.slackChannel.id
      })
    }

    return {
      success: true
    }
  } catch (error) {
    console.log('deleteProject error', error)
    handleError(error)
  }
}
