import handleError from '../../utils/handleError'
import {
  getUsers
} from '../../thirdParty/frontapp'

export default async () => {
  try {
    const response = await getUsers()
    return response._results
      .filter(u => u.is_available || !u.is_blocked)
      .map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        firstName: u.first_name,
        lastName: u.last_name,
        name: `${u.first_name} ${u.last_name}`
      }))
  } catch (error) {
    console.log('getFrontUsers error', error)
    handleError(error)
  }
}
