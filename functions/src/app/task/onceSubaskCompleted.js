import admin from 'firebase-admin'
import { chatPostMessage, chatUpdate } from '../../thirdParty/slack'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import getSlackUserMention from '../slack/getSlackUserMention'
import composeTaskMessage from '../slack/composeTaskMessage'

const fStore = admin.firestore()
const sendSubtaskCompletionMessage = false

export default async ({ subtask }) => {
  try {
    const { taskId, orgId, name, completed, statusChangedBy } = subtask

    const taskDoc = await fStore.doc(`tasks/${taskId}`).get()
    const task = taskDoc.data()
    const { slackThread } = task

    const integration = await getOrgSlackIntegration(orgId)
    if (integration) {
      if (sendSubtaskCompletionMessage) {
        const updatorName = await getSlackUserMention(statusChangedBy)

        let message
        if (completed) {
          message = `Subtask ${name} is marked complete by: ${updatorName}`
        } else {
          message = `Subtask ${name} is re-opened by: ${updatorName}`
        }

        const response = await chatPostMessage(integration.botAccessToken, {
          channel: slackThread.channelId,
          thread_ts: slackThread.ts,
          text: message,
          as_user: false,
          reply_broadcast: true
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

      const composedMessage = await composeTaskMessage(task)
      await chatUpdate(integration.botAccessToken, {
        channel: slackThread.channelId,
        ts: slackThread.ts,
        blocks: composedMessage,
        as_user: true
      })
    }

    await fStore.collection('history').add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId: task.orgId,
      target: 'subtask',
      action: completed ? 'complete' : 're-open',
      actor: statusChangedBy,
      meta: {
        taskId: task.id,
        name: subtask.name,
        containerId: task.containerId,
        containerType: task.containerType
      }
    })
  } catch (error) {
    throw error
  }
}
