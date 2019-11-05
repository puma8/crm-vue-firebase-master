import admin from 'firebase-admin'
import moment from 'moment'
import handleError from '../../utils/handleError'
import getAccessToken from '../../thirdParty/gapis/getAccessToken'

const fStore = admin.firestore()

export default async (data, context) => {
  const uid = context.auth.uid

  try {
    const integrationnDoc = await fStore.doc(`integration/gDrive/users/${uid}`).get()
    const integration = integrationnDoc.data()
    const expired = moment(integration.expiresAt.toDate()).isBefore(moment())

    if (expired) {
      const token = await getAccessToken(integration.refreshToken)

      await fStore.doc(`integration/gDrive/users/${uid}`).update({
        accessToken: token.access_token,
        expiresAt: admin.firestore.Timestamp.fromDate(moment().add(token.expires_in, 's').toDate())
      })

      return {
        accessToken: token.access_token
      }
    } else {
      return {
        accessToken: integration.accessToken
      }
    }
  } catch (error) {
    console.log('getFreshToken error', error)
    handleError(error)
  }
}
