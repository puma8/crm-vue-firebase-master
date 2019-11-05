import admin from 'firebase-admin'
import {
  collectionResolver
} from '../../utils/firestore'

const fStore = admin.firestore()

export default async (orgId, customFields) => {
  try {
    const dealResolver = async dealDoc => {
      const existingIds = (dealDoc.data().customFields || []).map(customField => customField.id)
      const newCustomFields = customFields.map(customField => {
        if (existingIds.includes(customField.id)) {
          return {
            id: customField.id,
            fieldValue: dealDoc
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

      await dealDoc.ref.update({
        customFields: newCustomFields
      })
    }
    await collectionResolver(
      fStore.collection('deals').where('orgId', '==', orgId),
      dealResolver
    )
  } catch (error) {
    throw error
  }
}
