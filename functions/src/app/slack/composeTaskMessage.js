import admin from 'firebase-admin'
import moment from 'moment'
import mrkdwn from 'html-to-mrkdwn'
import {
  buildSection,
  buildSelect,
  buildLinkButton,
  buildAction,
  divider
} from '../../utils/blockKit'
import config from '../../utils/config'
import {
  arrayResolver
} from '../../utils/array'
import getSlackUserMention from './getSlackUserMention'

const fStore = admin.firestore()

export default async task => {
  let blocks = []
  const creatorName = await getSlackUserMention(task.createdBy)

  const taskLink = `${config.mavrik.base_url}/${task.containerType}s/${task.containerId}/tasks/${task.id}`
  blocks.push(
    buildSection(`Created by ${creatorName}`)
  )

  let message = `*Title:*\n${task.name}\n*Description:*\n${mrkdwn(task.description).text}`
  blocks.push(
    buildSection(message)
  )

  blocks.push(divider)

  const assigneeName = await getSlackUserMention(task.assigneeId)
  if (assigneeName) {
    message = `*Assignee:*\n${assigneeName}\n`
  } else {
    message = `*Unassigned*\n`
  }

  const taskFollowers = task.members || []
  const followerResolver = followerId => getSlackUserMention(followerId)
  const followers = (await arrayResolver(taskFollowers, followerResolver)).join(' ')
  if (taskFollowers.length > 0) {
    message = `${message}*Followers:*\n${followers}\n`
  } else {
    message = `${message}*Unfollowed*\n`
  }

  message = `${message}*Due Date:*\n${moment(task.deadline.toDate()).format('MM/DD/YYYY')}`

  blocks.push(
    buildSection(message)
  )

  blocks.push(divider)

  const subtasks = await fStore.collection(`tasks/${task.id}/subtasks`).get()
  const subtaskResolver = subtask => async resolve => {
    const slackAction = await fStore.collection('slackActions').add({
      target: 'subtask',
      type: 'manage',
      orgId: task.orgId,
      taskId: task.id,
      subtaskId: subtask.id
    })
    let message = `<${taskLink}|${subtask.name}>`
    if (subtask.completed) {
      message = `~${message}~`
    }
    message = `${message}\n*Due Date*: ${moment(subtask.deadline.toDate()).format('MM/DD/YYYY')}\n*Description*: ${mrkdwn(subtask.description).text}`
    const accessory = buildSelect('Manage', slackAction.id, [!subtask.completed ? {
      title: 'Mark as complete',
      code: 'complete'
    } : {
      title: 'Reopen',
      code: 'reopen'
    }])
    resolve(buildSection(
      message,
      accessory
    ))
  }
  const subtaskPromises = subtasks.docs.map(subtaskDoc => new Promise(subtaskResolver(subtaskDoc.data())))
  const subtaskBlock = await Promise.all(subtaskPromises)

  blocks = [...blocks, ...subtaskBlock]

  if (subtaskBlock.length > 0) {
    blocks.push(divider)
  }

  const slackAction = await fStore.collection('slackActions').add({
    target: 'task',
    type: 'manage',
    orgId: task.orgId,
    taskId: task.id
  })

  let taskActions = []

  if (task.completed) {
    taskActions = [{
      title: 'Reopen',
      code: 'reopen'
    }]
  } else if (!task.status || task.status === 'todo') {
    taskActions = [{
      title: 'Mark In Progress',
      code: 'in-progress'
    }, {
      title: 'Mark Completed',
      code: 'complete'
    }]
  } else if (task.status === 'in-progress') {
    taskActions = [{
      title: 'Mark ToDo',
      code: 'reopen'
    }, {
      title: 'Mark Completed',
      code: 'complete'
    }]
  }

  blocks.push(
    buildAction([
      buildLinkButton('View task in Mavrik', taskLink),
      buildSelect('Manage', slackAction.id, taskActions)
    ])
  )

  return blocks
}
