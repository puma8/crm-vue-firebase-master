import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async ({ projectBefore, project }) => {
  if (
    (!projectBefore.archived && project.archived) ||
    (projectBefore.archived && !project.archived)
  ) {
    await fStore.collection('history').add({
      createdAt: project.archivedAt,
      orgId: project.orgId,
      target: 'project',
      action: project.archived ? 'archive' : 'unarchive',
      actor: project.archivedBy,
      meta: {
        id: project.id,
        containerId: project.id,
        containerType: 'project'
      }
    })
  }
}
