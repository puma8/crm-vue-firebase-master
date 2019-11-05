import admin from 'firebase-admin'
import handleInOutboundMessage from './handleInOutboundMessage'
import handleComment from './handleComment'
import {
  arrayResolver
} from '../../utils/array'

const fStore = admin.firestore()

export default async (eventData, tagId) => {
  const tags = tagId
    ? [tagId]
    : (eventData.conversation.tags || []).map(tag => tag.id)

  const tagResolver = async tagId => {
    if (eventData.state && eventData.state[tagId]) return

    const deals = await fStore.collection('deals').where('frontTagId', '==', tagId).get()
    const projects = await fStore.collection('projects').where('frontTagId', '==', tagId).get()
    const containers = []
    deals.forEach(dealDoc => {
      const deal = dealDoc.data()
      if (!deal.slackChannel) return
      containers.push({
        type: 'deal',
        data: deal
      })
    })
    projects.forEach(projectDoc => {
      const project = projectDoc.data()
      if (!project.slackChannel) return
      containers.push({
        type: 'project',
        data: project
      })
    })

    if (eventData.type === 'inbound' || eventData.type === 'outbound' || eventData.type === 'out_reply') {
      await handleInOutboundMessage(eventData, containers)
    } else if (eventData.type === 'comment' || eventData.type === 'mention') {
      await handleComment(eventData, containers)
    }

    const state = eventData.state || {}
    state[tagId] = true
    await fStore.doc(`frontEvents/${eventData.docId}`).update({
      state
    })
  }
  await arrayResolver(tags, tagResolver)
}
