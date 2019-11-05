import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async ({ dealBefore, deal }) => {
  if (
    (!dealBefore.archived && deal.archived) ||
    (dealBefore.archived && !deal.archived)
  ) {
    await fStore.collection('history').add({
      createdAt: deal.archivedAt,
      orgId: deal.orgId,
      target: 'deal',
      action: deal.archived ? 'archive' : 'unarchive',
      actor: deal.archivedBy,
      meta: {
        id: deal.id,
        containerId: deal.id,
        containerType: 'deal'
      }
    })
  }
}
