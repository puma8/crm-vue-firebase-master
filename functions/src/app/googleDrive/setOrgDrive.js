import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import { createGoogleFolderForContainer } from '../index'
import shareGoogleFileWithMembers from './shareGoogleFileWithMembers'
import { createGoogleFile } from '../../thirdParty/gapis/drive'
import { collectionResolver } from '../../utils/firestore'
import createNotificationChannel from './createNotificationChannel'

const fStore = admin.firestore()

export default async ({ folderId }, context) => {
  const uid = context.auth.uid

  try {
    const integrationDoc = await fStore
      .doc(`integration/gDrive/users/${uid}`)
      .get()
    const integration = integrationDoc.data()

    let response = await createGoogleFile(integration, [folderId], 'Deals')
    const dealsFolderId = response.data.id

    response = await createGoogleFile(integration, [folderId], 'Projects')
    const projectsFolderId = response.data.id

    const caller = await fStore.doc(`users/${uid}`).get()
    const orgId = caller.get('orgId')
    await fStore.doc(`organizations/${orgId}`).update({
      googleDrive: {
        id: folderId,
        type: 'standard',
        connectedBy: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        dealsFolderId,
        projectsFolderId
      }
    })

    await fStore.doc(`gDriveIndex/${orgId}`).set({})

    await collectionResolver(
      fStore.collection('deals').where('orgId', '==', orgId),
      async dealDoc => {
        const deal = dealDoc.data()
        if (!deal.googleFolder) {
          const dealFolderId = await createGoogleFolderForContainer({
            entity: deal,
            entityType: 'deal',
            integration
          })
          await shareGoogleFileWithMembers(
            deal.orgId,
            dealFolderId,
            deal.members
          )
        }
      },
      10
    )

    await collectionResolver(
      fStore.collection('projects').where('orgId', '==', orgId),
      async projectDoc => {
        const project = projectDoc.data()
        if (!project.googleFolder) {
          const projectFolderId = await createGoogleFolderForContainer({
            entity: project,
            entityType: 'project',
            integration
          })
          await shareGoogleFileWithMembers(
            project.orgId,
            projectFolderId,
            project.members
          )
        }
      },
      10
    )

    await createNotificationChannel(orgId, folderId, integration)

    return {
      success: true
    }
  } catch (error) {
    console.log('setOrgGDrive error', error)
    handleError(error)
  }
}
