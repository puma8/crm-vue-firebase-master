import admin from 'firebase-admin'
import createGoogleFolderForContainer from '../app/googleDrive/createGoogleFolderForContainer'
import { createGoogleFile } from '../thirdParty/gapis/drive'
import { collectionResolver } from '../utils/firestore'

export default async () => {
  try {
    const fStore = admin.firestore()
    const benUID = 'XC9JPLrqdQftOJIJ6Oj8RAfYyY53'
    const orgId = 'xOHJLOp57OwK5ChUiId3'

    const orgDoc = await fStore.doc(`organizations/${orgId}`).get()
    const org = orgDoc.data()

    if (org.googleDrive) return
    const integrationDoc = await fStore
      .doc(`integration/gDrive/users/${benUID}`)
      .get()
    const integration = integrationDoc.data()
    let response = await createGoogleFile(
      integration,
      [org.orgDriveId],
      'Deals'
    )
    const dealsFolderId = response.data.id
    response = await createGoogleFile(integration, [org.orgDriveId], 'Projects')
    const projectsFolderId = response.data.id

    fStore.doc(`organizations/${orgId}`).update({
      googleDrive: {
        connectedBy: org.orgDriveOwnerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        id: org.orgDriveId,
        type: 'standard',
        dealsFolderId,
        projectsFolderId
      }
    })

    await collectionResolver(
      fStore.collection('deals').where('orgId', '==', orgId),
      async dealDoc => {
        if (!dealDoc.data().googleFolder) {
          await createGoogleFolderForContainer({
            entity: dealDoc.data(),
            entityType: 'deal',
            integration
          })
        }
      }
    )

    await collectionResolver(
      fStore.collection('projects').where('orgId', '==', orgId),
      async projectDoc => {
        if (!projectDoc.data().googleFolder) {
          await createGoogleFolderForContainer({
            entity: projectDoc.data(),
            entityType: 'project',
            integration
          })
        }
      }
    )
  } catch (error) {
    console.log('error', error)
  }
}
