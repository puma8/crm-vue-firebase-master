import admin from 'firebase-admin'
import _ from 'lodash'
import handleError from '../../utils/handleError'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import getSlackUserMention from '../slack/getSlackUserMention'
import composeTaskMessage from '../slack/composeTaskMessage'
import {
  chatPostMessage,
  chatUpdate
} from '../../thirdParty/slack'
import {
  isEqual as isEqualArray
} from '../../utils/array'

const fStore = admin.firestore()

export default async ({
  task,
  previousAssigneeId
}) => {
  try {
    const {
      assigneeId,
      members: taskMembers,
      orgId,
      slackThread,
      containerId,
      containerType
    } = task
    if (!assigneeId) return

    // Add previous assignee to the followers
    const updatedTaskMembers = _.compact([
      ..._.difference(
        taskMembers,
        [assigneeId]
      ),
      previousAssigneeId
    ])
    await fStore.doc(`tasks/${task.id}`).update({
      members: updatedTaskMembers
    })

    // If the assignee is not member of the container, add it as a member
    const taskContainerDoc = await fStore.doc(`${containerType}s/${containerId}`).get()
    const taskContainerMembers = taskContainerDoc.data().members || []

    if (!taskContainerMembers.includes(assigneeId)) {
      taskContainerDoc.ref.update({
        members: _.concat(taskContainerMembers, assigneeId)
      })
    }

    // Only update the thread message only when followers wasn't updated. If the followers was updated, the corresponding firebase event would be triggered.
    // onceTaskFollowersUpdated will update the thread message.
    const shouldUpdateTaskThread = isEqualArray(updatedTaskMembers, task.members)

    // Slack notification of new assignee
    const integration = await getOrgSlackIntegration(orgId)
    if (integration) {
      const assigneeName = await getSlackUserMention(assigneeId)
      const message = `Task is assigned to: ${assigneeName}`

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
  } catch (error) {
    console.log('onceTaskAssigneeUpdated error', error)
    handleError(error)
  }
}
