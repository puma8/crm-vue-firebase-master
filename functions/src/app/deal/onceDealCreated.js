import admin from 'firebase-admin'
import createGoogleFolderForContainer from '../googleDrive/createGoogleFolderForContainer'
import createFrontTag from '../frontapp/createFrontTag'
import linkWithSlackChannel from '../slack/_linkWithSlackChannel'
import shareGoogleFileWithMembers from '../googleDrive/shareGoogleFileWithMembers'

const fStore = admin.firestore()

export default async ({ deal }) => {
  try {
    // Create a folder inside the google team drive if the owner has connected to google drive.
    const folderId = await createGoogleFolderForContainer({
      entity: deal,
      entityType: 'deal'
    })

    await shareGoogleFileWithMembers(deal.orgId, folderId, deal.members)

    // Create a tag in the frontapp so that all mails tagged by the tag can be displayed on Mavrik CRM.
    await createFrontTag({
      entity: deal,
      entityType: 'deal'
    })

    // Create a slack channel for the deal
    await linkWithSlackChannel({
      entity: deal,
      entityType: 'deal'
    })

    await fStore.collection('history').add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId: deal.orgId,
      target: 'deal',
      action: 'create',
      actor: deal.createdBy,
      meta: {
        id: deal.id,
        containerId: deal.id,
        containerType: 'deal'
      }
    })
  } catch (error) {
    throw error
  }
}
