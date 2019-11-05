import admin from 'firebase-admin'
import moment from 'moment'

const fAuth = admin.auth()
const fStore = admin.firestore()

export default async ({
  userId,
  confirmationToken
}) => {
  const confirmation = await fStore.doc(`confirmation/${userId}`).get()

  if (!confirmation.exists) {
    return {
      code: 'invalid-token'
    }
  }

  const {
    token,
    expiresAt
  } = confirmation.data()

  if (token !== confirmationToken) {
    return {
      code: 'invalid-token'
    }
  } else if (moment(expiresAt).isBefore(moment())) {
    return {
      code: 'token-expired'
    }
  }

  await fAuth.updateUser(userId, {
    emailVerified: true
  })

  await fStore.doc(`metadata/${userId}`).set({
    refreshTime: new Date().getTime()
  })

  return {
    code: 'success'
  }
}
