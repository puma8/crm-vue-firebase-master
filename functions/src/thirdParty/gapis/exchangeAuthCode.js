import axios from 'axios'
import querystring from 'qs'
import config from '../../utils/config'

export default async authCode => {
  let response = await axios.post(
    'https://www.googleapis.com/oauth2/v4/token',
    querystring.stringify({
      code: authCode,
      client_id: config.oauth2.client_id,
      client_secret: config.oauth2.client_secret,
      grant_type: 'authorization_code',
      redirect_uri: 'postmessage'
    })
  )
  const {
    access_token: accessToken,
    expires_in: expiresIn,
    refresh_token: refreshToken,
    id_token: idToken
  } = response.data

  response = await axios.get(
    'https://www.googleapis.com/oauth2/v3/tokeninfo',
    {
      params: {
        id_token: idToken
      }
    }
  )

  return {
    accessToken,
    expiresIn,
    refreshToken,
    idToken,
    email: response.data.email
  }
}
