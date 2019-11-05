import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async userId => {
  if (!userId) return ''
  const userDoc = await fStore.doc(`users/${userId}`).get()
  const user = userDoc.data()
  return user.meta && user.meta.slackUserId
    ? `<@${user.meta.slackUserId}>`
    : user.name
}
