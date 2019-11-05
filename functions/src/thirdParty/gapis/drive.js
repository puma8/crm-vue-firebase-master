import { google } from 'googleapis'
import moment from 'moment'
import gOAuth2Client, { refreshOAuth2Client } from './gOAuth2Client'
import config from '../../utils/config'

const getDriveClient = async integration => {
  await refreshOAuth2Client({
    ...integration,
    expiresAt: integration.expiresAt.toDate(),
    asis: integration.test
  })

  return google.drive({
    version: 'v3',
    auth: gOAuth2Client
  })
}

export const getDriveChangesStartPageToken = async (integration, driveId) => {
  try {
    const drive = await getDriveClient(integration)
    const params = {}
    if (driveId) {
      params.driveId = driveId
    }
    const response = await drive.changes.getStartPageToken(params)
    return response.data.startPageToken
  } catch (error) {
    console.log('get drive changes start page token error', error)
  }
}

export const watchDriveChanges = async (
  integration,
  driveId,
  startPageToken,
  channelId
) => {
  try {
    const drive = await getDriveClient(integration)
    const params = {}
    params.pageToken = startPageToken
    if (driveId) {
      params.driveId = driveId
    }

    return drive.changes.watch({
      ...params,
      requestBody: {
        kind: 'api#channel',
        type: 'web_hook',
        id: channelId,
        address: `${config.mavrik.base_url}/api/helloGoogleDrive`,
        expiration: moment()
          .add(7, 'd')
          .valueOf()
      }
    })
  } catch (error) {
    console.log('watch drive error', error)
  }
}

export const watchFileChanges = async (integration, fileId, channelId) => {
  try {
    const drive = await getDriveClient(integration)

    return drive.files.watch({
      fileId,
      requestBody: {
        kind: 'api#channel',
        type: 'web_hook',
        id: channelId,
        address: `${config.mavrik.base_url}/api/helloGoogleDrive`,
        expiration: moment()
          .add(7, 'd')
          .valueOf()
      }
    })
  } catch (error) {
    console.log('watch folder error', error)
  }
}

export const stopChange = async (integration, channelId, resourceId) => {
  try {
    const drive = await getDriveClient(integration)

    return drive.channels.stop({
      requestBody: {
        id: channelId,
        resourceId
      }
    })
  } catch (error) {}
}

export const shareGoogleFile = async (integration, fileId, email, role) => {
  try {
    const drive = await getDriveClient(integration)

    return drive.permissions.create({
      fileId,
      emailMessage: "You're invited to a google folder for organization",
      sendNotificationEmail: true,
      fields: 'id',
      resource: {
        role,
        type: 'user',
        emailAddress: email
      }
    })
  } catch (error) {
    console.log('add member to gdrive', error)
  }
}

export const createGoogleFile = async (
  integration,
  parents,
  name,
  mimeType = 'application/vnd.google-apps.folder'
) => {
  const drive = await getDriveClient(integration)

  return drive.files.create({
    // supportsAllDrives: true,
    // supportsTeamDrives: true,
    requestBody: {
      mimeType,
      name,
      parents
    },
    fields: 'id,name,teamDriveId,driveId,webViewLink'
  })
}

export const listDriveActivity = async (integration, params) => {
  const drive = await getDriveClient(integration)

  return drive.changes.list({
    ...params,
    fields: '*'
  })
}
