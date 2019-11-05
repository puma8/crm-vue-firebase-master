import admin from 'firebase-admin'
import { collectionResolver } from '../../utils/firestore'

const fStore = admin.firestore()

export default async (orgId, tags) => {
  try {
    const projectResolver = async projectDoc => {
      const projectTags = projectDoc.data().tags || []
      await projectDoc.ref.update({
        tags: projectTags.filter(tagId => tags.find(tag => tag.id === tagId))
      })
    }
    await collectionResolver(
      fStore.collection('projects').where('orgId', '==', orgId),
      projectResolver
    )
  } catch (error) {
    console.log('propagate Project Tags error', error)
    throw error
  }
}
