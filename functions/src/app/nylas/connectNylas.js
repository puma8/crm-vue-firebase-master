import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import { exchangeForToken, getAccount } from '../../thirdParty/nylas'

const fStore = admin.firestore()

export default async (data, context) => {
  try {
    const token = await exchangeForToken(data.code)
    const connectedAccount = await getAccount(token)
    const uid = context.auth.uid
    const caller = await fStore.doc(`users/${uid}`).get()
    const orgId = caller.get('orgId')

    const integrationPublic = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      id: connectedAccount.id,
      accountId: connectedAccount.accountId,
      name: connectedAccount.name,
      email: connectedAccount.emailAddress,
      provider: connectedAccount.provider,
      organizationUnit: connectedAccount.organizationUnit,
      syncState: connectedAccount.syncState
    }

    // Set information on the nylas integration to the team profile so that all team members can be notified of the integration
    await fStore.doc(`organizations/${orgId}`).update({
      nylas: {
        ...integrationPublic,
        connectedBy: uid
      }
    })

    // Personally store the integration
    await fStore.doc(`integration/nylas/public/${uid}`).set({
      orgId,
      ...integrationPublic
    })
    await fStore.doc(`integration/nylas/private/${uid}`).set({
      orgId,
      ...integrationPublic,
      accessToken: token
    })
  } catch (error) {
    console.log('connectNylas error', error)
    handleError(error)
  }
}
