import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'

const initialState = {
  data: {}
}

export default {
  namespaced: true,

  state: initialState,

  getters: {
    data: state => state.data
  },

  mutations: {
    ...vuexfireMutations
  },

  actions: {
    bind: firestoreAction(({ bindFirestoreRef }, orgId) => {
      const $db = firebase.firestore()

      bindFirestoreRef('data', $db.doc(`organizations/${orgId}`))
    })
  }
}
