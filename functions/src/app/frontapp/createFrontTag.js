import admin from 'firebase-admin'
import {
  createTag
} from '../../thirdParty/frontapp'

const fStore = admin.firestore()

export default async ({
  entity,
  entityType
}) => {
  const category = {
    deal: 'Deals',
    project: 'Projects'
  }
  const tagName = entity.name.toLowerCase().replace(/\s/g, '_')
  const response = await createTag({
    name: `${category[entityType]}/${tagName}`
  })
  await fStore.doc(`${entityType}s/${entity.id}`).update({
    frontTagId: response.id
  })
}
