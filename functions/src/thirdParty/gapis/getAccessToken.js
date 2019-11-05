import axios from 'axios'
import querystring from 'qs'
import config from '../../utils/config'

export default async refreshToken => {
  const response = await axios.post(
    'https://www.googleapis.com/oauth2/v4/token',
    querystring.stringify({
      refresh_token: refreshToken,
      client_id: config.oauth2.client_id,
      client_secret: config.oauth2.client_secret,
      grant_type: 'refresh_token'
    })
  )

  return response.data
}
