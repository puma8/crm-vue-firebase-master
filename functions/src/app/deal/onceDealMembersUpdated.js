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
  dealHint
}) => {
  try {
    const addedMembers = _.difference(members, oldMembers)
    const removedMembers = _.difference(oldMembers, members)

    if (addedMembers.length === 0 && removedMembers.length === 0) return

    let deal = dealHint
    if (!deal) {
      const dealDoc = await fStore.doc(`deals/${id}`).get()
      deal = dealDoc.data()
    }

    await updateTasksMembers({
      containerType: 'deal',
      containerId: id,
      removedMembers
    })

    const integration = await getOrgSlackIntegration(deal.orgId)
    if (integration) {
      await inviteMembersToChannel(addedMembers, deal.slackChannel.id, integration)
      // await kickMembersFromChannel(removedMembers, deal.slackChannel.id, integration)
    }
  } catch (error) {
    console.log('updateDealMember error', error)
    handleError(error)
  }
}
