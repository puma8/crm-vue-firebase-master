import admin from 'firebase-admin'
import {
  collectionResolver
} from '../../utils/firestore'

const fStore = admin.firestore()

export default async (orgId, customFields) => {
  try {
    const projectResolver = async projectDoc => {
      const existingIds = (projectDoc.data().customFields || []).map(customField => customField.id)
      const newCustomFields = customFields.map(customField => {
        if (existingIds.includes(customField.id)) {
          return {
            id: customField.id,
            fieldValue: projectDoc
              .data()
              .customFields
              .find(({
                id
              }) => id === customField.id)
              .fieldValue
          }
        } else {
          return {
            id: customField.id,
            fieldValue: ''
          }
        }
      })

      await projectDoc.ref.update({
        customFields: newCustomFields
      })
    }
    await collectionResolver(
      fStore.collection('projects').where('orgId', '==', orgId),
      projectResolver
    )
  } catch (error) {
    throw error
  }
}
