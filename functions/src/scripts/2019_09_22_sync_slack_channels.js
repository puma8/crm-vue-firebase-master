import admin from 'firebase-admin'
import {
  conversationsList
} from '../thirdParty/slack'
import {
  arrayResolver
} from '../utils/array'
import getOrgSlackIntegration from '../app/slack/getOrgSlackIntegration'

const fStore = admin.firestore()

const getChannelsRecursively = async (integration, nextCursor = '') => {
  const response = await conversationsList(integration.accessToken, {
    cursor: nextCursor
  })

  const channelResolver = async channel => {
    const data = {
      channelId: channel.id,
      name: channel.name,
      isArchived: channel.is_archived,
      creator: channel.creator,
      teamId: channel.shared_team_ids[0]
    }
    const channelIndexDoc = await fStore.doc(`slackChannels/${integration.teamId}_${channel.id}`).get()
    if (channelIndexDoc.exists) {
      await fStore.doc(`slackChannels/${integration.teamId}_${channel.id}`).update(data)
    } else {
      await fStore.doc(`slackChannels/${integration.teamId}_${channel.id}`).set(data)
    }
  }
  await arrayResolver(response.channels, channelResolver)

  if (response.response_metadata.next_cursor) {
    await getChannelsRecursively(integration, response.response_metadata.next_cursor)
  }
}

export default async () => {
  const orgId = 'xOHJLOp57OwK5ChUiId3'
  const integration = await getOrgSlackIntegration(orgId)

  await getChannelsRecursively(integration)
}
