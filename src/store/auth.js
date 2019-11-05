import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'

export default {
  namespaced: true,

  state: {
    user: {}
  },

  getters: {
    user (state) {
      return state.user
    },

    isAuthenticated (state) {
      return !!state.user
    }
  },

  mutations: {
    RESET_USER (state) {
      state.user = null
    },
    ...vuexfireMutations
  },

  actions: {
    bindUser: firestoreAction(({ bindFirestoreRef }, payload) => {
      const $db = firebase.firestore()

      return bindFirestoreRef('user', $db.doc(`users/${payload}`))
    }),

    signOut ({ commit }) {
      commit('RESET_USER')
    }
  }
}
