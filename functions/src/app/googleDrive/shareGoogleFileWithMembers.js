import admin from 'firebase-admin'
import getOrgGoogleDriveIntegration from './getOrgGoogleDriveIntegration'
import { shareGoogleFile } from '../../thirdParty/gapis/drive'
import gDriveRoles from '../../constants/gDriveRoles'
import { arrayResolver } from '../../utils/array'

const fStore = admin.firestore()

const func = async (orgId, fileId, members = []) => {
  const role = gDriveRoles.WRITER
  const integration = await getOrgGoogleDriveIntegration(orgId)
  if (integration) {
    const memberResolver = async uid => {
      const userIntegrationDoc = await fStore
        .doc(`integration/gDrive/users/${uid}`)
        .get()
      const userIntegration = userIntegrationDoc.data()
      if (userIntegration && integration.email !== userIntegration.email) {
        await shareGoogleFile(integration, fileId, userIntegration.email, role)
      }
    }
    await arrayResolver(members, memberResolver)
  }
}

export default func
