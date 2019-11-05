import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async orgId => {
  const organizationDoc = await fStore.doc(`organizations/${orgId}`).get()
  const slack = organizationDoc.data().slack
  if (slack) {
    const integrationDoc = await fStore
      .doc(`integration/slack/private/${slack.connectedBy}`)
      .get()
    return integrationDoc.data()
  } else {
    return null
  }
}
