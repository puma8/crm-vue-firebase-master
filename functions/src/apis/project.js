import * as functions from 'firebase-functions'
import {
  archiveProject,
  deleteProject
} from '../app'

export default functions.https.onCall((data, context) => {
  const {
    action
  } = data

  switch (action) {
    case 'archive':
      return archiveProject(data, context)
    case 'delete':
      return deleteProject(data, context)
  }
})
