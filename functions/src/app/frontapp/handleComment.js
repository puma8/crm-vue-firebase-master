import admin from 'firebase-admin'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import getUserSlackIntegration from '../slack/getUserSlackIntegration'
import {
  getComment,
  getCommentMentions
} from '../../thirdParty/frontapp'
import {
  chatPostMessage
} from '../../thirdParty/slack'
import {
  arrayResolver
} from '../../utils/array'

const fStore = admin.firestore()

export default async (eventData, containers) => {
  const conversationId = eventData.conversation.id

  const frontComment = await getComment(eventData.target.data.id)
  const comment = frontComment.body
  const frontUserId = frontComment.author.id
  const frontUserName = `${frontComment.author.first_name} ${frontComment.author.last_name}`

  // Get all mentions in front
  let mentions = []
  if (eventData.type === 'mention') {
    const response = await getCommentMentions(eventData.target.data.id)
    mentions = response._results
  }

  const containerResolver = async container => {
    const containerData = container.data

    // Find a CRM user who is associated with the front user
    const users = await fStore.collection('users')
      .where('orgId', '==', containerData.orgId)
      .where('meta.frontUserId', '==', frontUserId)
      .get()
    let userSlackAccessToken = null
    if (users.size > 0) {
      const user = users.docs[0].data()
      const userSlackIntegration = await getUserSlackIntegration(null, user)
      if (userSlackIntegration) {
        userSlackAccessToken = userSlackIntegration.accessToken
      }
    }

    let enhancedComment = comment
    const mentionResolver = async mention => {
      const users = await fStore.collection('users')
        .where('orgId', '==', containerData.orgId)
        .where('meta.frontUserId', '==', mention.id)
        .get()
      if (users.size > 0) {
        const user = users.docs[0].data()
        const meta = user.meta || {}
        return {
          key: `@${mention.username}`,
          value: meta.slackUserId ? `<@${meta.slackUserId}>` : `${mention.first_name} ${mention.last_name}`
        }
      } else {
        return {
          key: `@${mention.username}`,
          value: `${mention.first_name} ${mention.last_name}`
        }
      }
    }
    const mentionSubs = await arrayResolver(mentions, mentionResolver)
    mentionSubs.forEach(mention => {
      const regExp = new RegExp(mention.key, 'g')
      enhancedComment = comment.replace(regExp, mention.value)
    })

    const integration = await getOrgSlackIntegration(containerData.orgId)
    if (!integration) return

    const slackChannelId = containerData.slackChannel.id
    const containerId = containerData.id
    const conversationPath = `${container.type}s/${containerId}/inbox/${conversationId}`
    const conversationDoc = await fStore.doc(conversationPath).get()
    const conversation = conversationDoc.data()
    const threadTs = conversation.threadTs
    if (!userSlackAccessToken) {
      enhancedComment = `${frontUserName} Commented: ${enhancedComment}`
    }

    const response = await chatPostMessage(userSlackAccessToken || integration.botAccessToken, {
      channel: slackChannelId,
      thread_ts: threadTs,
      text: enhancedComment,
      as_user: Boolean(userSlackAccessToken)
    })

    await fStore.doc(`slackChannels/${integration.teamId}_${slackChannelId}`).update({
      [response.ts]: {
        type: 'message',
        status: 'completed'
      }
    })
  }
  await arrayResolver(containers, containerResolver)
}
