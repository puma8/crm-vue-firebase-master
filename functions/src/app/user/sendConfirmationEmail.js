import admin from 'firebase-admin'
import crypto from 'crypto'
import moment from 'moment'
import {
  sendConfirmationEmail
} from '../../thirdParty/sendgrid'
import config from '../../utils/config'

const fStore = admin.firestore()

export default async ({
  userId,
  email
}) => {
  try {
    const user = await fStore.doc(`users/${userId}`).get()

    if (!user.exists) throw new Error('')

    let _email = email
    const token = crypto.randomBytes(16).toString('hex')
    const expiresAt = moment().add(30, 'minute').valueOf()

    if (!_email) {
      _email = user.data().email
    }

    await fStore.doc(`confirmation/${userId}`).set({
      token,
      expiresAt
    })
    await sendConfirmationEmail(_email, `${config.mavrik.base_url}${config.mavrik.confirmation_path}?confirmation_token=${token}`)
  } catch (error) {
    console.log('sendConfirmationEmail', error)
  }
}
