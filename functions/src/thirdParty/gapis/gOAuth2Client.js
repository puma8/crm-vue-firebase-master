import { google } from 'googleapis'
import moment from 'moment'
import config from '../../utils/config'
import getAccessToken from './getAccessToken'

const { oauth2 } = config

const oAuth2Client = new google.auth.OAuth2(
  oauth2.client_id,
  oauth2.client_secret,
  'postmessage'
)

export const refreshOAuth2Client = async ({
  accessToken,
  expiresAt,
  refreshToken,
  asis = false
}) => {
  if (!asis) {
    const expired = moment(expiresAt).isBefore(moment())
    const token = expired ? (await getAccessToken(refreshToken)).access_token : accessToken

    oAuth2Client.setCredentials({ access_token: token })
  } else {
    oAuth2Client.setCredentials({ access_token: accessToken })
  }
}

export default oAuth2Client
