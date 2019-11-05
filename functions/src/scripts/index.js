const admin = require('firebase-admin')
const env = 'production'
let serviceAccount, databaseURL

if (env === 'development') {
  process.env.NODE_ENV = 'development'
} else if (env === 'staging') {
  serviceAccount = require('../../../../staging-crm-firebase-service-account.json')
  databaseURL = 'https://mavrik-crm-9c6b2.firebaseio.com'
  process.env.NODE_ENV = 'staging'
} else if (env === 'production') {
  serviceAccount = require('../../../../crm-firebase-service-account.json')
  databaseURL = 'https://mavrik-crm-prod.firebaseio.com'
  process.env.NODE_ENV = 'production'
}

process.env.MAINTENANCE_SCRIPT = true

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL
})

require('dotenv').config()

// const script1 = require('./2019_09_20_google_drive_links').default
// const script2 = require('./2019_09_20_create_google_folder_for_missing_deals_projects').default
// const script3 = require('./2019_09_22_sync_slack_channels').default
// const script4 = require('./2019_09_24_delete_users_staging').default
// const script5 = require('./2019_10_09_delete_deal_project_folder_ref').default

const run = async () => {
  // await script1()
  // await script2()
  // await script3()
  // await script4()
  // await script5()
}

run()
