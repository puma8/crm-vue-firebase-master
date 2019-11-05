import {
  vuexfireMutations,
  firestoreAction
} from 'vuexfire'
import firebase from 'firebase/app'

const HIDE_ARCHIVED_DEALS = 'HIDE_ARCHIVED_DEALS'

export default {
  namespaced: true,

  state: {
    list: [],
    shouldHideArchived: true
  },

  getters: {
    list (state) {
      return state.list || []
    },
    dealById: state => dealId => {
      return state.list.find(({
        id
      }) => id === dealId) || {}
    },
    teamLeadById: (state, getters, rootState, rootGetters) => dealId => {
      const users = rootGetters['users/list']
      const deal = getters.dealById(dealId)
      const user = users.find(({
        id
      }) => id === deal.teamLeadId) || {}
      return user
    },
    shouldHideArchived (state) {
      return state.shouldHideArchived
    }
  },

  mutations: {
    ...vuexfireMutations,
    [HIDE_ARCHIVED_DEALS] (state) {
      state.shouldHideArchived = !state.shouldHideArchived
    }
  },

  actions: {
    bind: firestoreAction(({
      bindFirestoreRef
    }, orgId) => {
      const $db = firebase.firestore()

      return bindFirestoreRef('list', $db.collection('deals').where('orgId', '==', orgId))
    }),
    hideArchived ({
      commit
    }) {
      commit(HIDE_ARCHIVED_DEALS)
    }
  }
}
