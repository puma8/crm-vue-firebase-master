import admin from 'firebase-admin'
import _ from 'lodash'
import { chatPostMessage } from '../../thirdParty/slack'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import composeTaskMessage from '../slack/composeTaskMessage'
import getSlackUserMention from '../slack/getSlackUserMention'

const fStore = admin.firestore()

export default async ({ task }) => {
  const {
    id,
    orgId,
    assigneeId,
    members: taskMembers = [],
    containerId,
    containerType
  } = task
  try {
    const taskContainerDoc = await fStore
      .doc(`${containerType}s/${containerId}`)
      .get()
    const taskContainer = taskContainerDoc.data()
    const { members: taskContainerMembers, slackChannel } = taskContainer

    // If users who are not members of the deal/project are added to the task as assignee/followers, add them to the deal/project as members
    const newlyAddedMembers = _.difference(
      _.compact([assigneeId, ...taskMembers]),
      taskContainerMembers
    )
    if (newlyAddedMembers.length > 0) {
      taskContainerDoc.ref.update({
        members: _.concat(taskContainerMembers, newlyAddedMembers)
      })
    }

    // Check if the owner of this org has connected to slack
    const integration = await getOrgSlackIntegration(orgId)
    if (integration) {
      const creatorName = await getSlackUserMention(task.createdBy)
      const composedMessage = await composeTaskMessage(task)

      // Send a slack message to a channel of the deal.
      const response = await chatPostMessage(integration.botAccessToken, {
        channel: slackChannel.id,
        text: `Task: ${task.name} created by ${creatorName}`,
        blocks: composedMessage,
        as_user: false
      })

      // Once CRM user comments on the task on the CRM, use the `slackThread` to point out the comment thread in the slack.
      await fStore.doc(`tasks/${id}`).update({
        slackThread: {
          channelId: slackChannel.id,
          ts: response.ts
        }
      })

      // We need to index each thread in slack for the upcoming slack events.
      await fStore
        .doc(`slackChannels/${integration.teamId}_${slackChannel.id}`)
        .update({
          [response.ts]: {
            type: 'thread',
            name: 'task-comments',
            taskId: id
          }
        })
    }

    await fStore.collection('history').add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId: task.orgId,
      target: 'task',
      action: 'create',
      actor: task.createdBy,
      meta: {
        id: task.id,
        name: task.name,
        description: task.description,
        containerId: task.containerId,
        containerType: task.containerType
      }
    })
  } catch (error) {
    throw error
  }
}
