import * as functions from 'firebase-functions'
import handleError from '../utils/handleError'
import { getInboxByTag } from '../thirdParty/frontapp'

export default functions.https.onCall(async data => {
  const { tagId } = data

  try {
    const response = await getInboxByTag(tagId)
    const threads = response._results
    return threads.map(({ subject, last_message: { body } }) => ({
      subject,
      body
    }))
  } catch (error) {
    console.log('getInbox error', error)
    handleError(error)
  }
})
