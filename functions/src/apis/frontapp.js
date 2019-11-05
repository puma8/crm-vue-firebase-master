import * as functions from 'firebase-functions'
import {
  getFrontUsers
} from '../app'

export default functions.https.onCall((data, context) => {
  const {
    action
  } = data

  switch (action) {
    case 'getUsers':
      return getFrontUsers(data, context)
  }
})
