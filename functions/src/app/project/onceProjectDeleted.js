import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async ({ project }) => {
  await fStore.collection('history').add({
    createdAt: project.deletedAt,
    orgId: project.orgId,
    target: 'project',
    action: 'delete',
    actor: project.deletedBy,
    meta: {
      data: project,
      containerId: project.id,
      containerType: 'project'
    }
  })
}
