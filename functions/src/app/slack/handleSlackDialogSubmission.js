import admin from 'firebase-admin'
import moment from 'moment'
import _ from 'lodash'
import { arrayResolver } from '../../utils/array'
import getSlackUserCRMId from './getSlackUserCRMId'

const fStore = admin.firestore()

export default async event => {
  const { submission, callback_id: callbackId, team, user, channel } = event

  try {
    const channelIndexDoc = await fStore
      .doc(`slackChannels/${team.id}_${channel.id}`)
      .get()
    const channelIndex = channelIndexDoc.data()

    if (callbackId === 'create_task') {
      const containerResolver = async containerIndex => {
        const containerDocRef = fStore.doc(
          `${containerIndex.type}s/${containerIndex.id}`
        )

        await fStore.runTransaction(async transaction => {
          const containerDoc = await transaction.get(containerDocRef)
          const container = containerDoc.data()

          const createdBy = await getSlackUserCRMId(container.orgId, user.id)

          const tasksCount = container.tasksCount || 0

          const newTask = await fStore.collection('tasks').doc()
          await newTask.set({
            id: newTask.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: createdBy.id,
            no: tasksCount + 1,
            orgId: container.orgId,
            containerId: container.id,
            containerType: containerIndex.type,
            name: submission.name,
            description: submission.description,
            deadline: admin.firestore.Timestamp.fromDate(
              moment(submission.deadline).toDate()
            ),
            assigneeId: submission.assignee,
            members: _.compact([container.teamLeadId]),
            completed: false,
            status: 'todo'
          })

          return transaction.update(containerDocRef, {
            tasksCount: tasksCount + 1
          })
        })
      }
      await arrayResolver(channelIndex.entities, containerResolver)
    }
  } catch (error) {
    console.log('handle slack dialog submission', error)
  }
}
