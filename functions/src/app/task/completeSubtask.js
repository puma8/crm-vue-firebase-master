import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async (userId, taskId, id) => {
  await fStore.doc(`tasks/${taskId}/subtasks/${id}`).update({
    completed: true,
    statusChangedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusChangedBy: userId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: userId
  })
}
