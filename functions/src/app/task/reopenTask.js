import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async (userId, id, nextStatus) => {
  await fStore.doc(`tasks/${id}`).update({
    completed: false,
    status: nextStatus || 'todo',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: userId
  })
}
