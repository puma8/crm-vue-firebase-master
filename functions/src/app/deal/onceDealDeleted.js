import admin from 'firebase-admin'

const fStore = admin.firestore()

export default async ({ deal }) => {
  await fStore.collection('history').add({
    createdAt: deal.deletedAt,
    orgId: deal.orgId,
    target: 'deal',
    action: 'delete',
    actor: deal.deletedBy,
    meta: {
      data: deal,
      containerId: deal.id,
      containerType: 'deal'
    }
  })
}
