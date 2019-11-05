import * as functions from 'firebase-functions'
import {
  createUser,
  updateUser,
  deleteUser,
  registerUser,
  confirmEmail,
  sendConfirmationEmail,
  linkWithExternalUser,
  unlinkWithExternalUser
} from '../app'

export default functions.https.onCall((data, context) => {
  const {
    action
  } = data

  switch (action) {
    case 'add':
      return createUser(data, context)
    case 'delete':
      return deleteUser(data, context)
    case 'update':
      return updateUser(data)
    case 'register':
      return registerUser(data)
    case 'confirmEmail':
      return confirmEmail(data)
    case 'resendConfirmation':
      return sendConfirmationEmail(data)
    case 'link':
      return linkWithExternalUser(data)
    case 'unlink':
      return unlinkWithExternalUser(data)
  }
})
