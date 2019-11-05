import admin from 'firebase-admin'
import { collectionResolver } from '../../utils/firestore'

const fStore = admin.firestore()

export default async (orgId, tags) => {
  try {
    const dealResolver = async dealDoc => {
      const dealTags = dealDoc.data().tags || []
      await dealDoc.ref.update({
        tags: dealTags.filter(tagId => tags.find(tag => tag.id === tagId))
      })
    }
    await collectionResolver(
      fStore.collection('deals').where('orgId', '==', orgId),
      dealResolver
    )
  } catch (error) {
    console.log('propagate Deal Tags error', error)
    throw error
  }
}
