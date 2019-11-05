import * as functions from 'firebase-functions'
import {
  archiveDeal,
  deleteDeal
} from '../app'

export default functions.https.onCall((data, context) => {
  const {
    action
  } = data

  switch (action) {
    case 'archive':
      return archiveDeal(data, context)
    case 'delete':
      return deleteDeal(data, context)
  }
})
