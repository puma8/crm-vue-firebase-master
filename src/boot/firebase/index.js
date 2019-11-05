import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/database'
require('firebase/auth')
require('firebase/functions')
import bind from './bind'
import auth from './auth'
import deal from './deal'
import project from './project'
import task from './task'
import company from './company'
import people from './people'
import setting from './setting'
import organization from './organization'
import event from './event'
import config from '../../config'

export default context => {
  const { Vue } = context
  const {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID
  } = config()

  if (FIREBASE_API_KEY) {
    firebase.initializeApp({
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_AUTH_DOMAIN,
      databaseURL: FIREBASE_DATABASE_URL,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
      appId: FIREBASE_APP_ID
    })

    // cloud firestore's cache isn't automatically cleared between sessions
    // consequently, if the app handles sensitive information,
    // make sure to ask the user if they're on a trusted device
    // before enabling persistence.
    firebase
      .firestore()
      .enablePersistence({ synchronizeTabs: true })
      .catch(error => {
        if (error.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab
          // at a time.
        } else if (error.code === 'unimplemented') {
          // The current browser does not support all of the features
          // required to enable persistence.
        }
      })

    Vue.prototype.$firebase = {
      self: firebase,
      auth: firebase.auth(),
      db: firebase.firestore(),
      operator: {
        arrayUnion: firebase.firestore.FieldValue.arrayUnion
      },
      serverTimestamp: firebase.firestore.FieldValue.serverTimestamp,
      Timestamp: firebase.firestore.Timestamp,
      serverTimestampFromDate: firebase.firestore.Timestamp.fromDate,
      cfApi: api => firebase.functions().httpsCallable(api)
    }

    // -- Deprecated ---
    Vue.prototype.$fb = firebase
    Vue.prototype.$db = firebase.firestore()

    bind(context)
    auth(context)
    deal(context)
    project(context)
    task(context)
    event(context)
    company(context)
    people(context)
    setting(context)
    organization(context)
  }
}
