import admin from 'firebase-admin'
import {
  channelInfo,
  inviteToChannel
} from '../../thirdParty/slack'
import {
  arrayResolver
} from '../../utils/array'

const fStore = admin.firestore()

export default async (members, channelId, integration) => {
  try {
    // Filter out users amongst the deal members and then invite them to the slack
    const memberResolver = async uid => {
      const userDoc = await fStore.doc(`users/${uid}`).get()
      const user = userDoc.data()
      return user.meta ? user.meta.slackUserId : null
    }
    const slackUsers = await arrayResolver(members, memberResolver)

    const slackUserResolver = async slackUserId => {
      const response = await channelInfo(integration.accessToken, {
        channel: channelId
      })
      const channelMembers = response.channel.members || []
      if (!channelMembers.includes(slackUserId)) {
        await inviteToChannel(integration.accessToken, {
          channel: channelId,
          user: slackUserId
        })
      }
    }
    await arrayResolver(
      slackUsers
        .filter(u => !!u)
        .filter(slackUserId => integration.slackUserId !== slackUserId), // Authenticated user is not in the channel
      slackUserResolver
    )
  } catch (error) {
    console.log('invite members to channel', error)
  }
}
