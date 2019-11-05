import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import {
  exchangeForToken
} from '../../thirdParty/slack'

const fStore = admin.firestore()

export default async (data, context) => {
  const {
    code
  } = data
  const uid = context.auth.uid
  const caller = await fStore.doc(`users/${uid}`).get()
  const orgId = caller.get('orgId')

  try {
    // Exchange a temporary OAuth code for an API access token.
    const result = await exchangeForToken(code)
    const {
      team_id: teamId,
      team_name: teamName,
      access_token: accessToken,
      scope,
      bot,
      user_id: slackUserId
    } = result

    await fStore.doc(`users/${uid}`).update({
      meta: {
        slackUserId: slackUserId
      }
    })

    // Save slack integration information
    const createdAt = admin.firestore.FieldValue.serverTimestamp()
    const integrationPublic = {
      createdAt,
      teamId,
      teamName
    }
    const integration = {
      ...integrationPublic,
      slackUserId,
      orgId,
      accessToken,
      scope,
      botUserId: bot.bot_user_id,
      botAccessToken: bot.bot_access_token
    }

    // Set information on the slack integration to the team profile so that all team members can be notified of the integration
    await fStore.doc(`organizations/${orgId}`).update({
      slack: {
        ...integrationPublic,
        connectedBy: uid
      }
    })
    // Personally store the integration
    await fStore.doc(`integration/slack/public/${uid}`).set({
      orgId,
      ...integrationPublic
    })
    await fStore.doc(`integration/slack/private/${uid}`).set(integration)

    // Sync slack channels list
    await fStore.doc(`sync/${orgId}`).update({
      slackChannels: {
        status: 'start'
      }
    })
  } catch (error) {
    console.log('connectSlack error', error)
    handleError(error)
  }
}
