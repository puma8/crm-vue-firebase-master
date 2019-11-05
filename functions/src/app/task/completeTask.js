import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async (userId, id) => {
  const uncompletedSubtasks = await fStore
    .collection(`tasks/${id}/subtasks`)
    .where('completed', '==', false)
    .get()

  if (uncompletedSubtasks.docs.length > 0) {
    return false
  }

  await fStore.doc(`tasks/${id}`).update({
    completed: true,
    status: 'complete',
    statusChangedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusChangedBy: userId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: userId
  })

  return true
}
