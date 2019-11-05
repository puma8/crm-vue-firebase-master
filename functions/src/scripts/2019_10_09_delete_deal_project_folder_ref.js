import admin from 'firebase-admin'
import { collectionResolver } from '../utils/firestore'

export default async () => {
  try {
    const fStore = admin.firestore()

    // const userResolver = async userIntegrationDoc => {
    //   await userIntegrationDoc.ref.delete()
    // }
    // await collectionResolver(
    //   fStore.collection('integration/gDrive/users'),
    //   userResolver
    // )

    // const orgResolver = async orgDoc => {
    //   await orgDoc.ref.update({
    //     googleDrive: admin.firestore.FieldValue.delete()
    //   })
    // }
    // await collectionResolver(fStore.collection('organizations'), orgResolver)

    const dealResolver = async dealDoc => {
      await dealDoc.ref.update({
        googleFolder: admin.firestore.FieldValue.delete()
      })
    }
    await collectionResolver(fStore.collection('deals'), dealResolver)

    const projectResolver = async projectDoc => {
      await projectDoc.ref.update({
        googleFolder: admin.firestore.FieldValue.delete()
      })
    }
    await collectionResolver(fStore.collection('projects'), projectResolver)
  } catch (error) {
    console.log('2019_10_09_staging_delete_deal_project_folder_ref', error)
  }
}
