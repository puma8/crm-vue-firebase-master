import admin from 'firebase-admin'
import _ from 'lodash'
import handleSlackMessageForTaskComments from './handleSlackMessageForTaskComments'
import handleSlackMessageForFrontComments from './handleSlackMessageForFrontComments'
import handleSlackAction from './handleSlackAction'
import handleSlackMessageAction from './handleSlackMessageAction'
import handleSlackDialogSubmission from './handleSlackDialogSubmission'

const fStore = admin.firestore()

export default async ({
  event
}) => {
  const {
    team_id: teamId,
    event: eventData
  } = event

  if (event.type === 'block_actions') {
    await handleSlackAction(event)
  } else if (event.type === 'message_action') {
    await handleSlackMessageAction(event)
  } else if (event.type === 'dialog_submission') {
    await handleSlackDialogSubmission(event)
  } else if (eventData.type === 'message') {
    const channelIndexDoc = await fStore.doc(`slackChannels/${teamId}_${eventData.channel}`).get()
    const channelIndex = channelIndexDoc.data()

    const messageIndex = _.get(channelIndex, eventData.ts)
    if (messageIndex && messageIndex.status === 'completed') return

    const threadIndex = _.get(channelIndex, eventData.thread_ts)
    if (threadIndex && threadIndex.type === 'thread') {
      if (threadIndex.name === 'front-messages') {
        await handleSlackMessageForFrontComments(eventData, threadIndex)
      } else if (threadIndex.name === 'task-comments') {
        await handleSlackMessageForTaskComments(eventData, threadIndex)
      }
    }
  }
}
