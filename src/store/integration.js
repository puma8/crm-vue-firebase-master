import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'

const initialState = {
  gDrive: {},
  slack: {},
  nylas: {}
}

export default {
  namespaced: true,

  state: initialState,

  getters: {
    gDrive (state) {
      return state.gDrive
    },
    slack (state) {
      return state.slack
    },
    nylas (state) {
      return state.nylas
    }
  },

  mutations: {
    ...vuexfireMutations
  },

  actions: {
    bind: firestoreAction(({ rootGetters, bindFirestoreRef }) => {
      const $db = firebase.firestore()
      const currentUser = rootGetters['auth/user']

      bindFirestoreRef(
        'gDrive',
        $db.doc(`integration/gDrive/users/${currentUser.id}`)
      )
      bindFirestoreRef(
        'slack',
        $db.doc(`integration/slack/public/${currentUser.id}`)
      )
      bindFirestoreRef(
        'nylas',
        $db.doc(`integration/nylas/public/${currentUser.id}`)
      )
    })
  }
}
