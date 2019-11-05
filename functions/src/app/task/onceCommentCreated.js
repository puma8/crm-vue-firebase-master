import admin from 'firebase-admin'
import { chatPostMessage } from '../../thirdParty/slack'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import getUserSlackIntegration from '../slack/getUserSlackIntegration'
import getSlackUserMention from '../slack/getSlackUserMention'

const fStore = admin.firestore()

export default async ({ comment }) => {
  try {
    const { taskId, orgId, text, createdBy, ignoreTrigger } = comment

    if (ignoreTrigger) return

    const taskDoc = await fStore.doc(`tasks/${taskId}`).get()
    const { slackThread } = taskDoc.data()

    const integration = await getOrgSlackIntegration(orgId)
    if (integration) {
      const userIntegration = await getUserSlackIntegration(createdBy)
      const creatorName = await getSlackUserMention(createdBy)
      const message = userIntegration ? text : `${creatorName} Replied: ${text}`
      const slackAccessToken = (userIntegration || integration).accessToken
      const asSlackUser = Boolean(userIntegration)

      const response = await chatPostMessage(slackAccessToken, {
        channel: slackThread.channelId,
        thread_ts: slackThread.ts,
        text: message,
        as_user: asSlackUser
      })

      // The slack message is completed so we don't need to handle the echo slack message
      await fStore
        .doc(`slackChannels/${integration.teamId}_${slackThread.channelId}`)
        .update({
          [response.ts]: {
            type: 'message',
            status: 'completed'
          }
        })
    }

    await fStore.collection('history').add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId,
      target: 'comment',
      action: 'create',
      actor: createdBy,
      meta: {
        taskId: taskDoc.data().id,
        taskName: taskDoc.data().name,
        text,
        containerId: taskDoc.data().containerId,
        containerType: taskDoc.data().containerType
      }
    })
  } catch (error) {
    throw error
  }
}
