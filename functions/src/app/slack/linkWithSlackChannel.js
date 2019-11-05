import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import linkWithSlackChannel from './_linkWithSlackChannel'

const fStore = admin.firestore()

export default async data => {
  const {
    containerId,
    containerType,
    channelId
  } = data
  try {
    const containerDoc = await fStore.doc(`${containerType}s/${containerId}`).get()
    const container = containerDoc.data()
    await linkWithSlackChannel({
      entity: container,
      entityType: containerType,
      channelId
    })
  } catch (error) {
    console.log('link with slack channel error', error)
    handleError(error)
  }
}
