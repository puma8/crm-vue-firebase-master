import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'

export default {
  namespaced: true,

  state: {
    list: []
  },

  getters: {
    list (state) {
      return state.list
    },
    personById: state => personId => {
      return state.list.find(({ id }) => id === personId) || {}
    }
  },

  mutations: {
    ...vuexfireMutations
  },

  actions: {
    bind: firestoreAction(({ bindFirestoreRef }, orgId) => {
      const $db = firebase.firestore()

      return bindFirestoreRef('list', $db.collection('people').where('orgId', '==', orgId))
    })
  }
}
