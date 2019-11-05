import admin from 'firebase-admin'
import { createGoogleFolderForContainer } from '../index'
import createFrontTag from '../frontapp/createFrontTag'
import linkWithSlackChannel from '../slack/_linkWithSlackChannel'
import shareGoogleFileWithMembers from '../googleDrive/shareGoogleFileWithMembers'

const fStore = admin.firestore()

export default async ({ project }) => {
  try {
    // Create a folder inside the google team drive if the owner has connected to google drive.
    const folderId = await createGoogleFolderForContainer({
      entity: project,
      entityType: 'project'
    })

    await shareGoogleFileWithMembers(project.orgId, folderId, project.members)

    // Create a tag in the frontapp so that all mails tagged by the tag can be displayed on Mavrik CRM.
    await createFrontTag({
      entity: project,
      entityType: 'project'
    })

    // Create a slack channel for the project
    await linkWithSlackChannel({
      entity: project,
      entityType: 'project'
    })

    await fStore.collection('history').add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId: project.orgId,
      target: 'project',
      action: 'create',
      actor: project.createdBy,
      meta: {
        id: project.id,
        containerId: project.id,
        containerType: 'project'
      }
    })
  } catch (error) {
    throw error
  }
}
