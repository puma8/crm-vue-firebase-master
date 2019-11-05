import admin from 'firebase-admin'
import moment from 'moment-timezone'
import getSlackUserMention from '../slack/getSlackUserMention'
import {
  collectionResolver,
  collectionSeriesResolver
} from '../../utils/firestore'
import { arrayResolver } from '../../utils/array'
import { buildSection, divider } from '../../utils/blockKit'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import { chatPostMessage } from '../../thirdParty/slack'
import config from '../../utils/config'

const fStore = admin.firestore()

export default async () => {
  try {
    const rangeStartDate = moment()
      .tz('America/New_York')
      .subtract(24, 'h')
      .toDate()
    const orgResolver = async orgDoc => {
      const recap = {}

      recap.createdDeals = []
      const createdDealResolver = async dealDoc => {
        const deal = dealDoc.data()
        const createdBy = await getSlackUserMention(deal.createdBy)

        recap.createdDeals.push({
          name: deal.name,
          createdBy
        })
      }
      await collectionResolver(
        fStore
          .collection('deals')
          .where('orgId', '==', orgDoc.id)
          .where('createdAt', '>', rangeStartDate),
        createdDealResolver
      )

      recap.createdProjects = []
      const createdProjectResolver = async projectDoc => {
        const project = projectDoc.data()
        const createdBy = await getSlackUserMention(project.createdBy)

        recap.createdProjects.push({
          name: project.name,
          createdBy
        })
      }
      await collectionResolver(
        fStore
          .collection('projects')
          .where('orgId', '==', orgDoc.id)
          .where('createdAt', '>', rangeStartDate),
        createdProjectResolver
      )

      recap.containers = []
      const completedTaskResolver = async taskDoc => {
        const task = taskDoc.data()

        if (!task.completed && (!task.status || task.status === 'todo')) return

        const statusChangedBy = await getSlackUserMention(task.statusChangedBy)
        const containerIndex = recap.containers.findIndex(
          c =>
            c.containerType === task.containerType &&
            c.containerId === task.containerId
        )
        const subtasks = []

        const subtaskResolver = async subtaskDoc => {
          const subtask = subtaskDoc.data()
          const statusChangedBy = await getSlackUserMention(
            subtask.statusChangedBy
          )
          subtasks.push({
            name: subtask.name,
            completed: subtask.completed,
            statusChangedBy
          })
        }
        await collectionResolver(
          taskDoc.ref.collection('subtasks'),
          subtaskResolver
        )

        const reportTask = {
          name: task.name,
          completed: task.completed,
          status: task.status,
          statusChangedBy,
          subtasks
        }
        if (containerIndex !== -1) {
          recap.containers[containerIndex].tasks.push(reportTask)
        } else {
          recap.containers.push({
            containerType: task.containerType,
            containerId: task.containerId,
            tasks: [reportTask]
          })
        }
      }
      await collectionSeriesResolver(
        fStore
          .collection('tasks')
          .where('orgId', '==', orgDoc.id)
          .where('statusChangedAt', '>', rangeStartDate),
        completedTaskResolver
      )

      const commentResolver = async commentDoc => {
        const comment = commentDoc.data()
        const containerIndex = recap.containers.findIndex(
          c =>
            c.containerType === comment.containerType &&
            c.containerId === comment.containerId
        )
        const commentorMame = await getSlackUserMention(comment.createdBy)

        if (containerIndex !== -1) {
          recap.containers[containerIndex].discussion =
            recap.containers[containerIndex].discussion || []
          const discussion = recap.containers[containerIndex].discussion
          const taskIndex = discussion.findIndex(
            e => e.taskId === comment.taskId
          )

          if (taskIndex !== -1) {
            const comments =
              recap.containers[containerIndex].discussion[taskIndex].comments
            const commentIndex = comments.findIndex(
              c => c.createdBy === comment.createdBy
            )

            if (commentIndex !== -1) {
              // prettier-ignore
              recap.containers[containerIndex]
                .discussion[taskIndex]
                .comments[commentIndex]
                .commentsCount = comments[commentIndex].commentsCount + 1
            } else {
              // prettier-ignore
              recap.containers[containerIndex]
                .discussion[taskIndex]
                .comments.push({
                  commentsCount: 1,
                  commentorMame,
                  createdBy: comment.createdBy
                })
            }
          } else {
            const taskDoc = await fStore.doc(`tasks/${comment.taskId}`).get()
            recap.containers[containerIndex].discussion.push({
              taskId: comment.taskId,
              name: taskDoc.data().name,
              comments: [
                {
                  commentsCount: 1,
                  commentorMame,
                  createdBy: comment.createdBy
                }
              ]
            })
          }
        } else if (comment.containerId) {
          const taskDoc = await fStore.doc(`tasks/${comment.taskId}`).get()
          recap.containers.push({
            containerType: comment.containerType,
            containerId: comment.containerId,
            discussion: [
              {
                taskId: comment.taskId,
                name: taskDoc.data().name,
                comments: [
                  {
                    commentsCount: 1,
                    commentorMame,
                    createdBy: comment.createdBy
                  }
                ]
              }
            ]
          })
        }
      }
      await collectionSeriesResolver(
        fStore
          .collectionGroup('comments')
          .where('orgId', '==', orgDoc.id)
          .where('createdAt', '>', rangeStartDate),
        commentResolver
      )

      const fileResolver = async fileDoc => {
        const fileData = fileDoc.data()
        const containerIndex = recap.containers.findIndex(
          c =>
            c.containerType === fileData.containerType &&
            c.containerId === fileData.containerId
        )
        const lastModifyingUser = fileData.lastModifyingUser
        const fileRecap = {
          actor: lastModifyingUser.slackId
            ? `<@${lastModifyingUser.slackId}>`
            : `${lastModifyingUser.displayName} (${lastModifyingUser.email})`,
          action: 'upload',
          target: `<${fileData.webContentLink}|${fileData.name}>`
        }

        if (containerIndex !== -1) {
          recap.containers[containerIndex].files.push(fileRecap)
        } else {
          recap.containers.push({
            containerType: fileData.containerType,
            containerId: fileData.containerId,
            files: [fileRecap]
          })
        }
      }
      await collectionSeriesResolver(
        fStore
          .collection('files')
          .where('orgId', '==', orgDoc.id)
          .where('createdAt', '>', rangeStartDate),
        fileResolver
      )

      // if (recap.createdDeals.length > 0) {
      //   blocks.push(
      //     buildSection(`${recap.createdDeals.length} Deals created`)
      //   )
      //   const deals = recap.createdDeals.reduce((result, deal) => {
      //     result = `${result}• ${deal.name} (Created by ${deal.createdBy})\n`
      //     return result
      //   }, '')
      //   blocks.push(
      //     buildSection(deals)
      //   )
      // }
      // blocks.push(divider)
      // if (recap.createdProjects.length > 0) {
      //   blocks.push(
      //     buildSection(`${recap.createdProjects.length} Projects created`)
      //   )
      //   const projects = recap.createdProjects.reduce((result, project) => {
      //     result = `${result}• ${project.name} (Created by ${project.createdBy})\n`
      //     return result
      //   }, '')
      //   blocks.push(
      //     buildSection(projects)
      //   )
      // }
      // blocks.push(divider)
      const containerResolver = async containerUpdate => {
        const containerDoc = await fStore
          .doc(
            `${containerUpdate.containerType}s/${containerUpdate.containerId}`
          )
          .get()
        const container = containerDoc.data()

        const title = `*Daily Recap* for ${container.name} on ${moment()
          .tz('America/New_York')
          .format('dddd, MMM D')}`
        const blocks = []
        blocks.push(buildSection(title))

        const reportTasks = containerUpdate.tasks || []
        const reportDiscussions = containerUpdate.discussion || []
        const reportFiles = containerUpdate.files || []

        if (
          reportTasks.length === 0 &&
          reportDiscussions.length === 0 &&
          reportFiles.length === 0
        ) {
          blocks.push(buildSection('No Update'))
        }

        if (reportTasks.length > 0) {
          blocks.push(divider)
          reportTasks.forEach(task => {
            const taskLink = `${config.mavrik.base_url}/${task.containerType}s/${task.containerId}/tasks/${task.id}`
            if (task.completed) {
              blocks.push(
                buildSection(
                  `:heavy_check_mark: ~<${taskLink}|${task.name}> (Completed by ${task.statusChangedBy})~`
                )
              )
            } else {
              blocks.push(
                buildSection(
                  `- <${taskLink}|${task.name}> (In Progress by ${task.statusChangedBy})`
                )
              )
            }

            const reportSubtasks = task.subtasks || []
            reportSubtasks.forEach(subtask => {
              if (subtask.completed) {
                blocks.push(
                  buildSection(
                    `>:white_check_mark ~${subtask.name} (Completed by ${subtask.statusChangedBy})~`
                  )
                )
              }
            })
          })
        }

        if (reportDiscussions.length > 0) {
          blocks.push(divider)
          blocks.push(
            buildSection(`${reportDiscussions.length} things were discussed`)
          )

          reportDiscussions.forEach(task => {
            const taskLink = `${config.mavrik.base_url}/${task.containerType}s/${task.containerId}/tasks/${task.id}`
            blocks.push(buildSection(`- <${taskLink}|${task.name}>`))

            const reportComments = task.comments || []
            reportComments.forEach(comment => {
              blocks.push(
                buildSection(
                  `>${comment.commentsCount} comment(s) by ${comment.commentorMame}`
                )
              )
            })
          })
        }

        if (reportFiles.length > 0) {
          blocks.push(divider)
          blocks.push(buildSection(`${reportFiles.length} files were uploaded`))
          reportFiles.forEach(file => {
            blocks.push(buildSection(`- ${file.actor} uploaded ${file.target}`))
          })
        }

        const integration = await getOrgSlackIntegration(container.orgId)
        if (integration) {
          // Send a slack message to a channel of the deal.
          const response = await chatPostMessage(integration.botAccessToken, {
            channel: container.slackChannel.id,
            text: title,
            blocks,
            as_user: false
          })

          // The slack message is completed so we don't need to handle the echo slack message
          await fStore
            .doc(
              `slackChannels/${integration.teamId}_${container.slackChannel.id}`
            )
            .update({
              [response.ts]: {
                type: 'message',
                status: 'completed'
              }
            })
        }
      }
      await arrayResolver(recap.containers, containerResolver)
    }
    await collectionResolver(fStore.collection('organizations'), orgResolver)
  } catch (error) {
    console.log('daily update error', error)
  }
}
