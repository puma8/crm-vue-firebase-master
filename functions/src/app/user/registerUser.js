import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import sendConfirmationEmail from './sendConfirmationEmail'
import seedData from '../../constants/seed'
import {
  OWNER
} from '../../constants/roles'

const fAuth = admin.auth()
const fStore = admin.firestore()

const createTeam = async orgName => {
  const newOrg = await fStore.collection('organizations').doc()
  const {
    settings
  } = seedData

  await newOrg.set({
    id: newOrg.id,
    name: orgName,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
  await newOrg.collection('settings').doc('general').set(settings.general)
  await newOrg.collection('settings').doc('deal').set(settings.deal)
  await newOrg.collection('settings').doc('project').set(settings.project)
  await newOrg.collection('settings').doc('person').set(settings.person)
  await newOrg.collection('settings').doc('security').set(settings.security)

  return newOrg
}

export default async data => {
  const {
    orgName,
    firstName,
    lastName,
    email,
    password
  } = data

  try {
    // Add to firebase user pool
    const newUser = await fAuth.createUser({
      email,
      password,
      emailVerified: false,
      disabled: false
    })

    // Create a new team and then set custom user claims for firestore security rule.
    const newOrg = await createTeam(orgName)
    await admin.auth().setCustomUserClaims(newUser.uid, {
      orgId: newOrg.id,
      roleId: OWNER
    })

    // Store new user's profile.
    await fStore.doc(`users/${newUser.uid}`).set({
      id: newUser.uid,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      primary: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orgId: newOrg.id,
      roleId: OWNER
    })

    // Sync front contacts
    await fStore.doc(`sync/${newOrg.id}`).set({
      frontContacts: {
        status: 'start'
      }
    })

    // Email verification.
    await sendConfirmationEmail({
      userId: newUser.uid,
      email
    })

    return newUser.uid
  } catch (error) {
    console.log('registerUser error', error)
    handleError(error)
  }
}
