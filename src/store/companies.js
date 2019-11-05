import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'

export default {
  namespaced: true,

  state: {
    list: []
  },

  getters: {
    list (state) {
      const list = state.list || []
      return list.filter(company => !company.mock)
    },
    companyById: state => companyId => {
      return state.list.find(({ id }) => id === companyId) || {}
    }
  },

  mutations: {
    ...vuexfireMutations
  },

  actions: {
    bind: firestoreAction(({ bindFirestoreRef }, orgId) => {
      const $db = firebase.firestore()

      return bindFirestoreRef('list', $db.collection('companies').where('orgId', '==', orgId))
    })
  }
}
