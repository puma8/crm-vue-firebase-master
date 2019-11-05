import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import getOrgNylasIntegration from './getOrgNylasIntegration'
import { getThreads } from '../../thirdParty/nylas'

const fStore = admin.firestore()

export default async (data, context) => {
  try {
    const uid = context.auth.uid
    const caller = await fStore.doc(`users/${uid}`).get()
    const orgId = caller.get('orgId')

    const integration = await getOrgNylasIntegration(orgId)
    if (integration) {
      const threads = await getThreads(integration, {
        limit: 50
      })
      return threads.map(thread => ({
        subject: thread.subject,
        snippet: thread.snippet
      }))
    }
    return []
  } catch (error) {
    console.log('nylas getThreads error', error)
    handleError(error)
  }
}
