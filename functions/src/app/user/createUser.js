import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import {
  newUserAlert
} from '../../thirdParty/sendgrid'
import linkWithExternalUser from './linkWithExternalUser'
import config from '../../utils/config'

const fAuth = admin.auth()
const fStore = admin.firestore()

export default async (data, context) => {
  const {
    name,
    email,
    password,
    roleId,
    meta = {}
  } = data
  const callerUID = context.auth.uid

  try {
    const caller = await fStore.doc(`users/${callerUID}`).get()
    const orgId = caller.get('orgId')
    const organization = await fStore.doc(`organizations/${orgId}`).get()

    // Create a new firebase user
    const newUser = await fAuth.createUser({
      email,
      emailVerified: true,
      password,
      displayName: name,
      photoURL: 'http://www.example.com/12345678/photo.png',
      disabled: false
    })

    // Set custom claims for the user.
    await admin.auth().setCustomUserClaims(newUser.uid, {
      orgId,
      roleId
    })

    // Store the user info to the database
    await fStore.doc(`users/${newUser.uid}`).set({
      id: newUser.uid,
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId,
      roleId
    })

    if (meta.slackUserId) {
      await linkWithExternalUser({
        id: newUser.uid,
        externalType: 'slack',
        externalUserId: meta.slackUserId
      })
    }

    if (meta.frontUserId) {
      await linkWithExternalUser({
        id: newUser.uid,
        externalType: 'front',
        externalUserId: meta.frontUserId
      })
    }

    await newUserAlert(email, caller.get('name'), organization.get('name'), password, `${config.mavrik.base_url}/login`)
    return newUser.uid
  } catch (error) {
    console.log('createUser error', error)
    handleError(error)
  }
}
