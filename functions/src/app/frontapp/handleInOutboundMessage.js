import admin from 'firebase-admin'
import {
  chatPostMessage
} from '../../thirdParty/slack'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import getMessageComponents from './getMessageComponents'
import {
  arrayResolver
} from '../../utils/array'

const fStore = admin.firestore()

export default async (eventData, containers) => {
  const conversationId = eventData.conversation.id
  const frontMessage = await getMessageComponents(eventData.target.data.id)

  const containerResolver = async container => {
    const containerData = container.data

    const integration = await getOrgSlackIntegration(containerData.orgId)
    if (!integration) return

    const slackChannelId = containerData.slackChannel.id
    const containerId = containerData.id
    const conversationPath = `${container.type}s/${containerId}/inbox/${conversationId}`
    const conversationDoc = await fStore.doc(conversationPath).get()
    const conversation = conversationDoc.data()

    if (conversation) {
      const threadTs = conversation.threadTs
      let message = `${frontMessage.text}${frontMessage.attachments}`
      const response = await chatPostMessage(integration.botAccessToken, {
        channel: slackChannelId,
        thread_ts: threadTs,
        text: message,
        as_user: false,
        reply_broadcast: true
      })
      await fStore.doc(`slackChannels/${integration.teamId}_${slackChannelId}`).update({
        [response.ts]: {
          type: 'message',
          status: 'completed'
        }
      })
    } else {
      const recipients = eventData.conversation.last_message.recipients
      const from = recipients.find(r => r.role === 'from').handle
      const subject = eventData.conversation.subject
      let message = `*From*: ${from}\n`
      if (eventData.type === 'outbound') {
        const to = recipients.find(r => r.role === 'to').handle
        message = `${message}*To*: ${to}\n*Subject*: ${subject}\n*Body*:\n>${frontMessage.text}${frontMessage.attachments}`
      } else {
        message = `${message}*Subject*: ${subject}\n*Body*:\n>${frontMessage.text}${frontMessage.attachments}`
      }

      const response = await chatPostMessage(integration.botAccessToken, {
        channel: slackChannelId,
        text: message,
        as_user: false
      })
      await fStore.doc(conversationPath).set({
        threadTs: response.ts
      })
      // We need to index each thread in slack for the upcoming slack events.
      await fStore.doc(`slackChannels/${integration.teamId}_${slackChannelId}`).update({
        [response.ts]: {
          type: 'thread',
          name: 'front-messages',
          orgId: containerData.orgId,
          conversationId
        }
      })
    }
  }
  await arrayResolver(containers, containerResolver)
}
