import admin from 'firebase-admin'
import {
  conversationsList
} from '../../thirdParty/slack'
import {
  arrayResolver
} from '../../utils/array'
import getOrgSlackIntegration from './getOrgSlackIntegration'

export default async orgId => {
  const fStore = admin.firestore()
  const orgSyncDoc = await fStore.doc(`sync/${orgId}`).get()
  const orgSync = orgSyncDoc.data()
  const integration = await getOrgSlackIntegration(orgId)

  let nextCursor = orgSync.slackChannels.nextCursor || ''
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

  nextCursor = response.response_metadata.next_cursor
  if (nextCursor) {
    fStore.doc(`sync/${orgId}`).update({
      slackChannels: {
        status: 'syncing',
        nextCursor
      }
    })
  } else {
    fStore.doc(`sync/${orgId}`).update({
      slackChannels: {
        status: 'complete'
      }
    })
  }
}
