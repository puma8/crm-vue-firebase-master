import admin from 'firebase-admin'
import _ from 'lodash'
import handleError from '../../utils/handleError'
import inviteMembersToChannel from '../slack/inviteMembersToChannel'
import getOrgSlackIntegration from '../slack/getOrgSlackIntegration'
import updateTasksMembers from '../task/updateTasksMembers'
// import kickMembersFromChannel from '../slack/kickMembersFromChannel'

const fStore = admin.firestore()

export default async ({
  id,
  members = [],
  oldMembers = [],
  projectHint
}) => {
  try {
    const addedMembers = _.difference(members, oldMembers)
    const removedMembers = _.difference(oldMembers, members)

    if (addedMembers.length === 0 && removedMembers.length === 0) return

    let project = projectHint
    if (!project) {
      const projectDoc = await fStore.doc(`projects/${id}`).get()
      project = projectDoc.data()
    }

    await updateTasksMembers({
      containerType: 'project',
      containerId: id,
      removedMembers
    })

    const integration = await getOrgSlackIntegration(project.orgId)
    if (integration) {
      await inviteMembersToChannel(addedMembers, project.slackChannel.id, integration)
      // await kickMembersFromChannel(removedMembers, project.slackChannel.id, integration)
    }
  } catch (error) {
    console.log('updateProjectMember error', error)
    handleError(error)
  }
}
