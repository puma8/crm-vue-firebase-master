import admin from 'firebase-admin'
import {
  createComment
} from '../../thirdParty/frontapp'

const fStore = admin.firestore()

export default async (eventData, indexData) => {
  const conversationId = indexData.conversationId
  const slackUserId = eventData.user
  const text = eventData.text
  const users = await fStore.collection('users')
    .where('orgId', '==', indexData.orgId)
    .where('meta.slackUserId', '==', slackUserId)
    .get()
  if (users.size === 0) return

  const user = users.docs[0].data()
  const frontUserId = user.meta.frontUserId

  if (!frontUserId) return

  await createComment(conversationId, frontUserId, text)
}
