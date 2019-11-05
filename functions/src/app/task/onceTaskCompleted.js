import admin from 'firebase-admin'
import { chatPostMessage, chatUpdate } from '../../thirdParty/slack'
import getSlackUserMention from '../slack/getSlackUserMention'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import composeTaskMessage from '../slack/composeTaskMessage'

const fStore = admin.firestore()
const sendSlackMessage = false

export default async ({ task }) => {
  const {
    updatedBy,
    orgId,
    containerId,
    containerType,
    completed,
    status,
    slackThread
  } = task
  try {
    const taskContainerDoc = await fStore
      .doc(`${containerType}s/${containerId}`)
      .get()
    const { slackChannel } = taskContainerDoc.data()

    // Check if the owner of this org has connected to slack
    const integration = await getOrgSlackIntegration(orgId)
    if (integration) {
      if (sendSlackMessage) {
        const updatorName = await getSlackUserMention(updatedBy)

        let message
        if (completed) {
          message = `Task ${task.name} is marked complete by: ${updatorName}`
        } else if (status === 'todo') {
          message = `Task ${task.name} is re-opened by: ${updatorName}`
        } else if (status === 'in-progress') {
          message = `Task ${task.name} is in progress by: ${updatorName}`
        }

        // Send a slack message to a channel of the deal.
        const response = await chatPostMessage(integration.botAccessToken, {
          channel: slackChannel.id,
          thread_ts: slackThread.ts,
          text: message,
          as_user: false,
          reply_broadcast: true
        })

        // The slack message is completed so we don't need to handle the echo slack message
        await fStore
          .doc(`slackChannels/${integration.teamId}_${slackChannel.id}`)
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
      orgId,
      target: 'task',
      action: completed
        ? 'complete'
        : status === 'todo'
          ? 're-open'
          : status === 'in-progress'
            ? 'in-progress'
            : '',
      actor: task.updatedBy,
      meta: {
        id: task.id,
        name: task.name,
        containerId: task.containerId,
        containerType: task.containerType
      }
    })
  } catch (error) {
    throw error
  }
}
