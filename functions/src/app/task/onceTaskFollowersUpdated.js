import admin from 'firebase-admin'
import _ from 'lodash'
import {
  chatUpdate
} from '../../thirdParty/slack'
import composeTaskMessage from '../slack/composeTaskMessage'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'

const fStore = admin.firestore()

export default async ({
  task
}) => {
  const {
    orgId,
    members: taskMembers,
    slackThread,
    containerId,
    containerType
  } = task

  const taskContainerDoc = await fStore.doc(`${containerType}s/${containerId}`).get()
  const taskContainerMembers = taskContainerDoc.data().members || []
  // If users who are not members of the deal/project are added to the task as assignee/followers, add them to the deal/project as members
  const newlyAddedMembers = _.difference(taskMembers, taskContainerMembers)
  if (newlyAddedMembers.length > 0) {
    taskContainerDoc.ref.update({
      members: _.concat(taskContainerMembers, newlyAddedMembers)
    })
  }

  const integration = await getOrgSlackIntegration(orgId)
  if (integration) {
    const composedMessage = await composeTaskMessage(task)
    await chatUpdate(integration.botAccessToken, {
      channel: slackThread.channelId,
      ts: slackThread.ts,
      blocks: composedMessage,
      as_user: true
    })
  }
}
