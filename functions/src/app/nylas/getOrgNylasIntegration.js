import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async orgId => {
  const organizationDoc = await fStore.doc(`organizations/${orgId}`).get()
  const nylas = organizationDoc.data().nylas
  if (nylas) {
    const integrationDoc = await fStore
      .doc(`integration/nylas/private/${nylas.connectedBy}`)
      .get()
    return integrationDoc.data()
  } else {
    return null
  }
}
