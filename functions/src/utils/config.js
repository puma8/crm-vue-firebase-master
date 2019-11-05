import * as functions from 'firebase-functions'

let config = functions.config()

if (process.env.MAINTENANCE_SCRIPT) {
  let prefix = ''
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    prefix = 'DEV_'
  } else if (process.env.NODE_ENV === 'staging') {
    prefix = 'STAGING_'
  }

  config = {
    ...config,
    mavrik: {
      base_url: process.env[`${prefix}MAVRIK_CRM_BASE_URL`],
      confirmation_path: process.env[`${prefix}MAVRIK_CRM_CONFIRMATION_PATH`]
    },
    oauth2: {
      client_id: process.env[`${prefix}G_OAUTH2_CLIENT_ID`],
      client_secret: process.env[`${prefix}G_OAUTH2_CLIENT_SECRET`]
    },
    frontapp: {
      token: process.env[`${prefix}FRONTAPP_TOKEN`]
    },
    slack: {
      client_id: process.env[`${prefix}SLACK_CLIENT_ID`],
      client_secret: process.env[`${prefix}SLACK_CLIENT_SECRET`],
      oauth_redirect: process.env[`${prefix}SLACK_OAUTH_REDIRECT_URI`],
      verification_token: process.env[`${prefix}SLACK_VERIFICATION_TOKEN`]
    },
    sendgrid: {
      api_key: process.env[`${prefix}SENDGRID_API_KEY`]
    },
    cloudfunction: {
      base_url: process.env[`${prefix}CLOUD_FUNCTION_BASE_URL`]
    },
    nylas: {
      client_id: process.env[`${prefix}NYLAS_CLIENT_ID`],
      client_secret: process.env[`${prefix}NYLAS_CLIENT_SECRET`]
    }
    // sa: {
    //   email: process.env.SERVICE_ACCOUNT_EMAIL,
    //   pkey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY
    // }
  }
}

export default config
