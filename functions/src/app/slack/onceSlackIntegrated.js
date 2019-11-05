import admin from 'firebase-admin'
import linkWithSlackChannel from './_linkWithSlackChannel'

const fStore = admin.firestore()

export default async ({
  integration
}) => {
  const dealsCollection = await fStore.collection('deals').where('orgId', '==', integration.orgId).get()
  const deals = []
  dealsCollection.forEach(dealDoc => {
    if (!dealDoc.data().slackChannel) deals.push(dealDoc.data())
  })
  const promises1 = deals.map(deal => new Promise(async resolve => {
    await linkWithSlackChannel({
      entity: deal,
      entityType: 'deal',
      integration
    })
    resolve()
  }))
  await Promise.all(promises1)

  const projectsCollection = await fStore.collection('projects').where('orgId', '==', integration.orgId).get()
  const projects = []
  projectsCollection.forEach(projectDoc => {
    if (!projectDoc.data().slackChannel) projects.push(projectDoc.data())
  })
  const promises2 = projects.map(project => new Promise(async resolve => {
    await linkWithSlackChannel({
      entity: project,
      entityType: 'project',
      integration
    })
    resolve()
  }))
  await Promise.all(promises2)
}
