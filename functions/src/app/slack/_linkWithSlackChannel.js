import admin from 'firebase-admin'
import {
  channelsCreate
} from '../../thirdParty/slack'
import getOrgSlackIntegration from './getOrgSlackIntegration'
import inviteMembersToChannel from './inviteMembersToChannel'

const fStore = admin.firestore()

export default async ({
  entity,
  entityType,
  channelId,
  integration
}) => {
  try {
    let _integration = integration

    if (!_integration) {
      _integration = await getOrgSlackIntegration(entity.orgId)
    }

    if (!_integration) return

    const prefixes = {
      deal: 'd',
      project: 'p'
    }
    const channelName = `${prefixes[entityType]}-${entity.name.toLowerCase().replace(/\s/g, '_')}`

    // Merge with existing channel on new deal/project if the names are the same, or channel is selected
    let channelsDoc
    if (channelId) {
      channelsDoc = await fStore.collection('slackChannels')
        .where('teamId', '==', _integration.teamId)
        .where('channelId', '==', channelId).get()
    } else {
      channelsDoc = await fStore.collection('slackChannels')
        .where('teamId', '==', _integration.teamId)
        .where('name', '==', channelName).get()
    }
    if (channelsDoc.docs.length > 0) {
      const channelDoc = channelsDoc.docs[0]
      const channel = channelDoc.data()
      await fStore.doc(`${entityType}s/${entity.id}`).update({
        slackChannel: {
          id: channel.channelId,
          name: channel.name
        }
      })

      const entities = channel.entities || []
      if (!entities.find(e => e.id === entity.id && e.type === entityType)) {
        await channelDoc.ref.update({
          entities: [...entities, {
            type: entityType,
            id: entity.id
          }]
        })
      }
    } else {
      // Compose channel name for the created deal and create a channel with the name.
      const response = await channelsCreate(_integration.accessToken, channelName)
      const channelId = response.channel.id

      await fStore.doc(`${entityType}s/${entity.id}`).update({
        slackChannel: {
          id: channelId,
          name: response.channel.name_normalized
        }
      })

      await fStore.doc(`slackChannels/${_integration.teamId}_${channelId}`).set({
        teamId: _integration.teamId,
        channelId,
        name: channelName,
        entities: [{
          type: entityType,
          id: entity.id
        }]
      })

      await inviteMembersToChannel(entity.members, channelId, _integration)
    }
  } catch (error) {
    throw error
  }
}
