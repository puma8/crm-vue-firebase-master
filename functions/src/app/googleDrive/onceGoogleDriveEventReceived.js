import admin from 'firebase-admin'
import moment from 'moment'
import { arrayResolver } from '../../utils/array'
import { chatPostMessage } from '../../thirdParty/slack'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'

const fStore = admin.firestore()

export default async event => {
  const { event: eventData } = event
  const { orgId, changes = [] } = eventData

  const filteredChanges = changes.filter(
    change =>
      !change.file.trashed &&
      change.file.mimeType !== 'application/vnd.google-apps.folder'
  )

  if (filteredChanges.length > 0) {
    const integration = await getOrgSlackIntegration(orgId)

    if (integration) {
      const gDriveIndexDoc = await fStore.doc(`gDriveIndex/${orgId}`).get()
      const gDriveIndex = gDriveIndexDoc.data()

      const changeResolver = async change => {
        const parentFolderId = change.file.parents[0]
        const folderIndex = gDriveIndex[parentFolderId]
        if (!folderIndex) return

        // Need to know container (deal or project) which is relevant to the google folder.
        const containerDoc = await fStore
          .doc(`${folderIndex.containerType}s/${folderIndex.containerId}`)
          .get()
        const container = containerDoc.data()

        const emailAddress = change.file.lastModifyingUser.emailAddress
        const displayName = change.file.lastModifyingUser.displayName
        let uploader = `${displayName} (${emailAddress})`
        let uploaderSlackId = ''
        let uploaderCRMId = ''
        const userCollection = await fStore
          .collection('integration/gDrive/users')
          .where('orgId', '==', orgId)
          .where('email', '==', emailAddress)
          .get()
        if (userCollection.size > 0) {
          uploaderCRMId = userCollection.docs[0].id
          const userDoc = await fStore.doc(`users/${uploaderCRMId}`).get()
          uploaderSlackId = (userDoc.data().meta || {}).slackUserId
          if (uploaderSlackId) {
            uploader = `<@${uploaderSlackId}>`
          }
        }

        await chatPostMessage(integration.botAccessToken, {
          channel: container.slackChannel.id,
          text: `${uploader} uploaded <${change.file.webContentLink}|${change.file.name}>`,
          as_user: false
        })

        // Store the file to database
        const fileId = fStore.collection('files').doc().id
        await fStore.doc(`files/${fileId}`).set({
          id: fileId,
          googleFileId: change.file.id,
          name: change.file.name,
          mimeType: change.file.mimeType,
          webContentLink: change.file.webContentLink,
          lastModifyingUser: {
            email: emailAddress,
            displayName,
            crmId: uploaderCRMId,
            slackId: uploaderSlackId
          },
          orgId,
          containerType: folderIndex.containerType,
          containerId: folderIndex.containerId,
          createdAt: admin.firestore.Timestamp.fromDate(
            moment(change.time).toDate()
          )
        })
      }
      await arrayResolver(filteredChanges, changeResolver)
    }
  }
}
