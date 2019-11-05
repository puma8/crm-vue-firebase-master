import admin from 'firebase-admin'
import handleError from '../../utils/handleError'

const fStore = admin.firestore()

export default async (data) => {
  const {
    id,
    externalType
  } = data

  try {
    const userDoc = await fStore.doc(`users/${id}`).get()
    const meta = userDoc.data().meta || {}
    delete meta[`${externalType}UserId`]
    await fStore.doc(`users/${id}`).update({ meta })

    return {
      success: true
    }
  } catch (error) {
    handleError(error)
  }
}
