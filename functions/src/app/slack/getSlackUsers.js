import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import { usersList } from '../../thirdParty/slack'
import getOrgSlackIntegration from './getOrgSlackIntegration'

const fStore = admin.firestore()

export default async context => {
  const uid = context.auth.uid
  const caller = await fStore.doc(`users/${uid}`).get()
  const orgId = caller.get('orgId')

  try {
    const integration = await getOrgSlackIntegration(orgId)

    if (integration) {
      const response = await usersList(integration.accessToken)
      return response.members
        .filter(member => !member.deleted && !member.is_bot && member.id !== 'USLACKBOT')
        .map(member => ({
          id: member.id,
          name: member.profile.real_name,
          email: member.profile.email
        }))
    } else {
      return []
    }
  } catch (error) {
    console.log('getSlackUsers error', error)
    handleError(error)
  }
}
