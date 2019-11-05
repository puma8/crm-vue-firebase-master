import admin from 'firebase-admin'
import _ from 'lodash'
import handleError from '../../utils/handleError'
import {
  arrayResolver
} from '../../utils/array'

const fAuth = admin.auth()
const fStore = admin.firestore()

export default async (data, context) => {
  const { users } = data
  const callerId = context.auth.uid

  try {
    const userResolver = async id => {
      await fStore.doc(`users/${id}`).update({
        deleted: true
      })
      await fAuth.deleteUser(id)
    }
    await arrayResolver(users, userResolver)

    const caller = await fStore.doc(`users/${callerId}`).get()
    const orgId = caller.get('orgId')

    const deals = await fStore.collection('deals').where('orgId', '==', orgId).get()
    const dealResolver = dealDoc => resolve => dealDoc.ref.update({
      members: _.difference(dealDoc.data().members, users)
    }).then(resolve)
    const dealsPromises = deals.docs.map(dealDoc => new Promise(dealResolver(dealDoc)))
    await Promise.all(dealsPromises)

    const projects = await fStore.collection('projects').where('orgId', '==', orgId).get()
    const projectResolver = projectDoc => resolve => projectDoc.ref.update({
      members: _.difference(projectDoc.data().members, users)
    }).then(resolve)
    const projectsPromises = projects.docs.map(projectDoc => new Promise(projectResolver(projectDoc)))
    await Promise.all(projectsPromises)

    return {
      success: true
    }
  } catch (error) {
    console.log('deleteUser error', error)
    handleError(error)
  }
}
