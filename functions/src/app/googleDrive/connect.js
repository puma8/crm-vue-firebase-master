import admin from 'firebase-admin'
import moment from 'moment'
import handleError from '../../utils/handleError'
import {
  exchangeAuthCode
} from '../../thirdParty/gapis'

const fStore = admin.firestore()

export default async (data, context) => {
  const {
    authCode
  } = data
  const uid = context.auth.uid
  const caller = await fStore.doc(`users/${uid}`).get()
  const orgId = caller.get('orgId')

  try {
    const {
      accessToken,
      expiresIn,
      refreshToken,
      idToken,
      email
    } = await exchangeAuthCode(authCode)

    await fStore.doc(`integration/gDrive/users/${uid}`).set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId,
      accessToken,
      expiresAt: admin.firestore.Timestamp.fromDate(moment().add(expiresIn, 's').toDate()),
      refreshToken,
      idToken,
      email
    })

    return {
      success: true
    }
  } catch (error) {
    console.log('connectGoogleDrive error', error)
    handleError(error)
  }
}
