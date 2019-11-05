import * as functions from 'firebase-functions'
import {
  connectGoogleDrive,
  getFreshToken,
  setOrgDrive
} from '../app'

export default functions.https.onCall((data, context) => {
  const {
    action
  } = data

  switch (action) {
    case 'connect':
      return connectGoogleDrive(data, context)
    case 'getFreshToken':
      return getFreshToken(data, context)
    case 'setOrgDrive':
      return setOrgDrive(data, context)
  }
})
