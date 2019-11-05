import admin from 'firebase-admin'
import { createGoogleFile } from '../../thirdParty/gapis/drive'
import { arrayResolver } from '../../utils/array'
import getOrgGoogleDriveIntegration from './getOrgGoogleDriveIntegration'

const fStore = admin.firestore()

const createFoldersRecursively = async (
  containerType,
  containerId,
  integration,
  parentId,
  folders
) => {
  const folderResolver = async folder => {
    const response = await createGoogleFile(
      integration,
      [parentId],
      folder.title
    )

    // Index google folder to make it easy to find it's relevant deal/project
    await fStore.doc(`gDriveIndex/${integration.orgId}`).update({
      [response.data.id]: {
        containerType,
        containerId
      }
    })

    if (folder.children && folder.children.length > 0) {
      await createFoldersRecursively(
        containerType,
        containerId,
        integration,
        response.data.id,
        folder.children
      )
    }
  }
  await arrayResolver(folders, folderResolver)
}

export default async ({ entity, entityType, integration }) => {
  let _integration = integration

  if (!_integration) {
    _integration = await getOrgGoogleDriveIntegration(entity.orgId)
  }

  if (_integration) {
    const organizationDoc = await fStore
      .doc(`organizations/${entity.orgId}`)
      .get()
    const organization = organizationDoc.data()
    const gDrive = organization.googleDrive
    const response = await createGoogleFile(
      _integration,
      [gDrive[`${entityType}sFolderId`]],
      entity.name
    )
    const folderId = response.data.id

    await fStore.doc(`${entityType}s/${entity.id}`).update({
      googleFolder: {
        id: folderId,
        name: response.data.name,
        webViewLink: response.data.webViewLink
      }
    })

    // Index google folder to make it easy to find it's relevant deal/project
    await fStore.doc(`gDriveIndex/${entity.orgId}`).update({
      [folderId]: {
        containerType: entityType,
        containerId: entity.id
      }
    })

    const entitySettingsDoc = await fStore
      .doc(`organizations/${entity.orgId}/settings/${entityType}`)
      .get()
    const entitySettings = entitySettingsDoc.data()
    if (entitySettings.folderTemplate) {
      await createFoldersRecursively(
        entityType,
        entity.id,
        _integration,
        response.data.id,
        entitySettings.folderTemplate
      )
    }

    return folderId
  }
}
