import admin from 'firebase-admin'
import _ from 'lodash'
import {
  userInfo
} from '../../thirdParty/slack'
import getOrgSlackIntegration from './getOrgSlackIntegration'

const fStore = admin.firestore()

export default async (eventData, indexData) => {
  const taskId = indexData.taskId
  const taskDoc = await fStore.doc(`tasks/${taskId}`).get()
  const task = taskDoc.data()

  // Check if the slack user who posted this message is associated with a Mavrik CRM account
  // If the slack user is not associated with Mavrik CRM, get the user info from slack in order to get it's real name that will be displayed on the comment thread in the web app.
  // If the slack user is associated with Mavrik CRM, get it's user id.
  const usersCollection = await fStore.collection('users')
    .where('orgId', '==', task.orgId)
    .get()
  const users = usersCollection.docs.map(userDoc => userDoc.data())

  let createdBy = ''
  let isCreatorMavrikUser = true
  let creatorName = ''

  const commentor = users.find(user => _.get(user, 'meta.slackUserId') === eventData.user)
  if (!commentor) {
    const integration = await getOrgSlackIntegration(task.orgId)
    const response = await userInfo(integration.accessToken, {
      user: eventData.user
    })
    createdBy = eventData.user
    isCreatorMavrikUser = false
    creatorName = response.user.real_name
  } else {
    createdBy = commentor.id
  }

  let text = eventData.text
  _.filter(users, user => eventData.text.indexOf(`<@${_.get(user, 'meta.slackUserId')}>`) !== -1)
    .filter(user => _.get(user, 'meta.slackUserId'))
    .forEach(user => {
      const regExp = new RegExp(`<@${user.meta.slackUserId}>`, 'g')
      text = text.replace(regExp, user.name)
    })

  await taskDoc.ref.update({
    commentsCount: (task.commentsCount || 0) + 1
  })
  const comment = await fStore.collection(`tasks/${task.id}/comments`).doc()
  await comment.set({
    id: comment.id,
    orgId: task.orgId,
    taskId: task.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy,
    isCreatorMavrikUser,
    creatorName,
    text,
    ignoreTrigger: true
  })
}
