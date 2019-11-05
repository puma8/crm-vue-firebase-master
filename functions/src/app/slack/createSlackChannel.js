import admin from 'firebase-admin'
import {
  channelsCreate
} from '../../thirdParty/slack'
import getOrgSlackIntegration from './getOrgSlackIntegration'

const fStore = admin.firestore()

export default async (data, context) => {
  const {
    name
  } = data
  const uid = context.auth.uid
  const caller = await fStore.doc(`users/${uid}`).get()
  const orgId = caller.get('orgId')

  try {
    const integration = await getOrgSlackIntegration(orgId)

    if (integration) {
      const response = await channelsCreate(integration.accessToken, name)
      const channelId = response.channel.id
      await fStore.doc(`slackChannels/${integration.teamId}_${channelId}`).set({
        teamId: integration.teamId,
        channelId,
        name
      })

      return {
        id: channelId
      }
    }
  } catch (error) {
    console.log('create slack channel', error)
  }
}
