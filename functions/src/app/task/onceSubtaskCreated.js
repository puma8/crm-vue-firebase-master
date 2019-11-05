import admin from 'firebase-admin'
import mrkdwn from 'html-to-mrkdwn'
import { chatPostMessage, chatUpdate } from '../../thirdParty/slack'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import getSlackUserMention from '../slack/getSlackUserMention'
import composeTaskMessage from '../slack/composeTaskMessage'
import { isEqual as isEqualArray } from '../../utils/array'

const fStore = admin.firestore()
const sendSlackMessage = true

export default async ({ subtask }) => {
  try {
    const { taskId, orgId, name, description, assigneeId, createdBy } = subtask

    const taskDoc = await fStore.doc(`tasks/${taskId}`).get()
    const task = taskDoc.data()

    let taskMembers = task.members || []
    if (
      assigneeId &&
      !taskMembers.includes(assigneeId) &&
      assigneeId !== task.assigneeId
    ) {
      taskMembers = [...taskMembers, assigneeId]
      await fStore.doc(`tasks/${taskId}`).update({
        members: taskMembers
      })
    }

    // Only update the thread message only when followers wasn't updated. If the followers was updated, the corresponding firebase event would be triggered.
    // onceTaskFollowersUpdated will update the thread message.
    const shouldUpdateTaskThread = isEqualArray(taskMembers, task.members)

    const { slackThread } = task

    const integration = await getOrgSlackIntegration(orgId)
    if (integration) {
      if (sendSlackMessage) {
        const createName = await getSlackUserMention(createdBy)
        const assigneeName = await getSlackUserMention(assigneeId)
        const message = `Subtask: ${name} Created by: ${createName} Description: ${
          mrkdwn(description).text
        } Assigned to: ${assigneeName}`

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

      if (shouldUpdateTaskThread) {
        const composedMessage = await composeTaskMessage(task)
        await chatUpdate(integration.botAccessToken, {
          channel: slackThread.channelId,
          ts: slackThread.ts,
          blocks: composedMessage,
          as_user: true
        })
      }
    }

    await fStore.collection('history').add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId: task.orgId,
      target: 'subtask',
      action: 'create',
      actor: subtask.createdBy,
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
