import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'

const SET_SLACK_USERS = 'SET_SLACK_USERS'
const SET_FRONT_USERS = 'SET_FRONT_USERS'

export default {
  namespaced: true,

  state: {
    list: [],
    slackUserList: [],
    frontUserList: []
  },

  getters: {
    list (state) {
      return state.list.filter(u => !u.deleted)
    },
    userById: (state, getters) => id => {
      return getters.list.find(user => user.id === id)
    },
    slackUsers (state) {
      return state.slackUserList
    },
    frontUsers (state) {
      return state.frontUserList
    }
  },

  mutations: {
    ...vuexfireMutations,
    [SET_SLACK_USERS] (state, users) {
      state.slackUserList = users || []
    },
    [SET_FRONT_USERS] (state, users) {
      state.frontUserList = users || []
    }
  },

  actions: {
    bind: firestoreAction(({ bindFirestoreRef }, orgId) => {
      const $db = firebase.firestore()

      return bindFirestoreRef('list', $db.collection('users')
        .where('orgId', '==', orgId))
    }),
    setSlackUsers ({
      commit
    }, users) {
      commit(SET_SLACK_USERS, users)
    },
    setFrontUsers ({
      commit
    }, users) {
      commit(SET_FRONT_USERS, users)
    }
  }
}
