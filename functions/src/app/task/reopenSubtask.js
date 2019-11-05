import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async (userId, taskId, id) => {
  await fStore.doc(`tasks/${taskId}/subtasks/${id}`).update({
    completed: false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: userId
  })
}
