import { injectGApis } from 'src/utils'
import oAuth2 from './oauth2'
import client from './client'
import picker from './picker'
import moment from 'moment'

const fresh = ({ Vue, store }) => () =>
  new Promise(resolve => {
    const { accessToken, expiresAt } = store.getters['integration/gDrive']
    const expired = moment(expiresAt.toDate()).isBefore(moment())

    if (expired) {
      Vue.prototype.$firebase
        .cfApi('googleDrive')({
          action: 'getFreshToken'
        })
        .then(result => {
          window.gapi.client.setToken({ access_token: result.data.accessToken })
        })
    } else {
      window.gapi.client.setToken({ access_token: accessToken })
      resolve()
    }
  })

const gapi = async context => {
  await injectGApis()
  oAuth2(context)
  client({ fresh: fresh(context), ...context })
  picker({ fresh: fresh(context), ...context })
}

export default gapi
