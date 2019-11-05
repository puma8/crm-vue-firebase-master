import * as functions from 'firebase-functions'
import { connectNylas, getThreads } from '../app'

export default functions.https.onCall((data, context) => {
  const { action } = data

  switch (action) {
    case 'connect':
      return connectNylas(data, context)
    case 'getThreads':
      return getThreads(data, context)
  }
})
