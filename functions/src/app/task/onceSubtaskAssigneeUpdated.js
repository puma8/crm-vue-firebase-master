import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import getSlackUserMention from '../slack/getSlackUserMention'
import {
  chatPostMessage
} from '../../thirdParty/slack'

const fStore = admin.firestore()
const sendSlackMessage = true

export default async ({
  subtask,
  assigneeId
}) => {
  try {
    const taskDoc = await fStore.doc(`tasks/${subtask.taskId}`).get()
    const task = taskDoc.data()
    const {
      orgId,
      slackThread
    } = task

    // Slack notification of new assignee
    if (assigneeId) {
      const taskMembers = task.members || []
      if (!taskMembers.includes(assigneeId) && assigneeId !== task.assigneeId) {
        await fStore.doc(`tasks/${task.id}`).update({
          members: [...taskMembers, assigneeId]
        })
      }

      if (sendSlackMessage) {
        const integration = await getOrgSlackIntegration(orgId)
        if (integration) {
          const assigneeName = await getSlackUserMention(assigneeId)
          const message = `Subtask: ${subtask.name} Assigned to: ${assigneeName}`

          const response = await chatPostMessage(integration.botAccessToken, {
            channel: slackThread.channelId,
            thread_ts: slackThread.ts,
            text: message,
            as_user: false,
            reply_broadcast: true
          })

          // The slack message is completed so we don't need to handle the echo slack message
          await fStore.doc(`slackChannels/${integration.teamId}_${slackThread.channelId}`).update({
            [response.ts]: {
              type: 'message',
              status: 'completed'
            }
          })
        }
      }
    }
  } catch (error) {
    console.log('onceSubtaskAssigneeUpdated error', error)
    handleError(error)
  }
}
