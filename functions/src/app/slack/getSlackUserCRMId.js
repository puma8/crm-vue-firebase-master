import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async (orgId, slackUserId) => {
  const userCollection = await fStore
    .collection('users')
    .where('orgId', '==', orgId)
    .where('meta.slackUserId', '==', slackUserId)
    .get()

  if (userCollection.size === 0) {
    return null
  } else {
    return userCollection.docs[0].data()
  }
}
