import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async (userId, hint) => {
  let user = hint
  if (!user) {
    const userDoc = await fStore.doc(`users/${userId}`).get()
    user = userDoc.data()
  }
  const meta = user.meta || {}
  const slackUserId = meta.slackUserId
  if (slackUserId) {
    const userIntegrationDoc = await fStore.doc(`integration/slack/private/${user.id}`).get()
    if (userIntegrationDoc.exists) {
      return userIntegrationDoc.data()
    }
  }

  return null
}
