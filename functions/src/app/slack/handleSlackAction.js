import admin from 'firebase-admin'
import {
  completeTask,
  reopenTask,
  completeSubtask,
  reopenSubtask
} from '../index'
import {
  request
} from '../../utils/http'

const fStore = admin.firestore()

export default async event => {
  const {
    actions,
    response_url: responseUrl,
    user
  } = event

  const action = actions[0]
  const {
    action_id: actionId,
    selected_option: selectedOption
  } = action

  const actionDetailDoc = await fStore.doc(`slackActions/${actionId}`).get()
  const actionDetail = actionDetailDoc.data()

  const usersCollection = await fStore.collection('users')
    .where('orgId', '==', actionDetail.orgId)
    .where('meta.slackUserId', '==', user.id)
    .get()
  let crmUserId = null
  if (usersCollection.docs.length > 0) {
    crmUserId = usersCollection.docs[0].data().id
  }

  let ephemeralMessage = ''
  if (actionDetail.target === 'task') {
    if (selectedOption.value === 'complete') {
      const completed = await completeTask(crmUserId, actionDetail.taskId)
      if (!completed) {
        ephemeralMessage = 'This task can not be completed because it still has uncompleted subtasks'
      }
    } else if (selectedOption.value === 'reopen') {
      await reopenTask(crmUserId, actionDetail.taskId)
    } else if (selectedOption.value === 'in-progress') {
      await reopenTask(crmUserId, actionDetail.taskId, 'in-progress')
    }
  } else if (actionDetail.target === 'subtask') {
    if (selectedOption.value === 'complete') {
      await completeSubtask(crmUserId, actionDetail.taskId, actionDetail.subtaskId)
    } else {
      await reopenSubtask(crmUserId, actionDetail.taskId, actionDetail.subtaskId)
    }
  }

  if (ephemeralMessage) {
    await request({
      url: responseUrl,
      method: 'post',
      body: {
        text: ephemeralMessage,
        response_type: 'ephemeral',
        replace_original: false
      }
    })
  }
}
