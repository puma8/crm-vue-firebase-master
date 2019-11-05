import admin from 'firebase-admin'
import {
  arrayResolver
} from '../utils/array'

export default async () => {
  try {
    const response = await admin.auth().listUsers()
    const userResolver = async user => {
      await admin.auth().deleteUser(user.uid)
    }
    await arrayResolver(response.users, userResolver)
    console.log('Done')
  } catch (error) {
    console.log('error', error)
  }
}
