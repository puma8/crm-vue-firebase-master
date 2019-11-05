import admin from 'firebase-admin'
import moment from 'moment'
import { dialogOpen } from '../../thirdParty/slack'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import getSlackUserCRMId from './getSlackUserCRMId'
import { request } from '../../utils/http'

const fStore = admin.firestore()

export default async event => {
  const {
    callback_id: callbackId,
    trigger_id: triggerId,
    team,
    user,
    message,
    response_url: responseUrl
  } = event

  try {
    const orgCollection = await fStore
      .collection('organizations')
      .where('slack.teamId', '==', team.id)
      .get()
    if (orgCollection.size === 0) return
    const organization = orgCollection.docs[0].data()
    const integration = await getOrgSlackIntegration(organization.id)

    if (callbackId === 'create_task') {
      let assignee = user.id

      // If the action creator is not a CRM user, he is not able to create a task
      const actorCRMId = await getSlackUserCRMId(organization.id, assignee)
      if (!actorCRMId) {
        await request({
          url: responseUrl,
          method: 'post',
          body: {
            text: 'You are not able to create a task on Mavrik CRM',
            response_type: 'ephemeral',
            replace_original: false
          }
        })
        return
      }
      assignee = actorCRMId

      // Prepare deadline options
      const deadlineOptions = []
      for (var index = 0; index < 100; index++) {
        const date = moment()
          .add(index, 'd')
          .format('MM-DD-YYYY')
        deadlineOptions.push({
          label: date,
          value: date
        })
      }

      // Prepare assignee options
      const userCollection = await fStore
        .collection('users')
        .where('orgId', '==', organization.id)
        .get()
      const assigneeOptions = userCollection.docs
        .filter(userDoc => userDoc.data().meta.slackUserId)
        .map(userDoc => ({
          label: `<@${userDoc.data().meta.slackUserId}>`,
          value: userDoc.data().id
        }))

      // If a slack user is mentioned in the message, he should be assignee to new task.
      const mentions = message.text.match(/<@.*>/g) || []
      let title = message.text
      if (mentions.length > 0) {
        const mentionedUser = mentions[0].substr(2, mentions[0].length - 3)
        const mentionedUserCRMId = await getSlackUserCRMId(
          organization.id,
          mentionedUser
        )
        if (mentionedUserCRMId) {
          assignee = mentionedUserCRMId
        }
        title = title.replace(/<@.*>/g, '')
      }

      const dialog = JSON.stringify({
        title: 'Create a Task',
        callback_id: 'create_task',
        submit_label: 'Create',
        elements: [
          {
            label: 'Name',
            type: 'text',
            name: 'name',
            value: title
          },
          {
            label: 'Description',
            type: 'textarea',
            name: 'description',
            value: ''
          },
          {
            label: 'Deadline',
            type: 'select',
            name: 'deadline',
            options: deadlineOptions
          },
          {
            label: 'Assignee',
            name: 'assignee',
            type: 'select',
            options: assigneeOptions,
            value: assignee
          }
        ]
      })

      await dialogOpen(integration.botAccessToken, {
        dialog,
        trigger_id: triggerId
      })
    }
  } catch (error) {
    console.log('handle slack message action', error)
  }
}
