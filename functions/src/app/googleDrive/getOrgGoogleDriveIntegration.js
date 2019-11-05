import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async orgId => {
  const organizationDoc = await fStore.doc(`organizations/${orgId}`).get()
  const gDrive = organizationDoc.data().googleDrive

  if (gDrive) {
    const integrationDoc = await fStore
      .doc(`integration/gDrive/users/${gDrive.connectedBy}`)
      .get()
    return integrationDoc.data()
  } else {
    return null
  }
}
