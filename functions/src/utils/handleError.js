import * as functions from 'firebase-functions'

export const composeError = (code, message) => {
  const error = new Error()

  error.errorInfo = {
    code,
    message
  }
  return error
}

const handleError = error => {
  if (!error.errorInfo) {
    throw new functions.https.HttpsError('unknown', '', error)
  }

  const { code, message } = error.errorInfo

  switch (code) {
    case 'auth/email-already-exists':
      throw new functions.https.HttpsError('already-exists', message, error.errorInfo)
    default:
      throw new functions.https.HttpsError('unknown', message, error.errorInfo)
  }
}

export default handleError
