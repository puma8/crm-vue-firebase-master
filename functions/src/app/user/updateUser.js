import admin from 'firebase-admin'
import handleError from '../../utils/handleError'
import linkWithExternalUser from './linkWithExternalUser'
import unlinkWithExternalUser from './unlinkWithExternalUser'

const fAuth = admin.auth()
const fStore = admin.firestore()

export default async data => {
  const {
    id,
    name,
    email,
    password,
    roleId,
    meta = {}
  } = data

  try {
    const userDoc = await fStore.doc(`users/${id}`).get()
    const user = userDoc.data()
    const currentUserMeta = user.meta || {}

    const updateContent = {
      displayName: name,
      email
    }

    if (password) {
      updateContent.password = password
    }

    await fAuth.updateUser(id, updateContent)
    await admin.auth().setCustomUserClaims(id, {
      orgId: user.orgId,
      roleId
    })
    await fStore.doc(`metadata/${id}`).set({
      refreshTime: new Date().getTime()
    })
    await fStore.doc(`users/${id}`).update({
      name,
      email,
      roleId
    })

    if (currentUserMeta.slackUserId !== meta.slackUserId) {
      if (currentUserMeta.slackUserId) {
        await unlinkWithExternalUser({
          id,
          externalType: 'slack'
        })
      }
      await linkWithExternalUser({
        id,
        externalType: 'slack',
        externalUserId: meta.slackUserId
      })
    }

    if (currentUserMeta.frontUserId !== meta.frontUserId) {
      if (currentUserMeta.frontUserId) {
        await unlinkWithExternalUser({
          id,
          externalType: 'front'
        })
      }
      await linkWithExternalUser({
        id,
        externalType: 'front',
        externalUserId: meta.frontUserId
      })
    }

    return {
      success: true
    }
  } catch (error) {
    console.log('updateUser error', error)
    handleError(error)
  }
}
