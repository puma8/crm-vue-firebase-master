import admin from 'firebase-admin'
import handleError from '../../utils/handleError'

const fStore = admin.firestore()

export default async ({
  id,
  externalType,
  externalUserId
}) => {
  try {
    const userDoc = await fStore.doc(`users/${id}`).get()
    const meta = userDoc.data().meta || {}
    await fStore.doc(`users/${id}`).update({
      meta: {
        ...meta,
        [`${externalType}UserId`]: externalUserId
      }
    })

    return {
      success: true
    }
  } catch (error) {
    handleError(error)
  }
}
