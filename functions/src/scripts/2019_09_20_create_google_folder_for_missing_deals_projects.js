import admin from 'firebase-admin'
import createGoogleFolderForContainer from '../app/googleDrive/createGoogleFolderForContainer'
import { collectionResolver } from '../utils/firestore'

export default async () => {
  try {
    const fStore = admin.firestore()
    const benUID = 'XC9JPLrqdQftOJIJ6Oj8RAfYyY53'
    const orgId = 'xOHJLOp57OwK5ChUiId3'

    const integrationDoc = await fStore
      .doc(`integration/gDrive/users/${benUID}`)
      .get()
    const integration = integrationDoc.data()

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
    console.log('2019_09_20_create_google_folder_for_missing_deals_projects')
  }
}
