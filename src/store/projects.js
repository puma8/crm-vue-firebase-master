import {
  vuexfireMutations,
  firestoreAction
} from 'vuexfire'
import firebase from 'firebase/app'

const HIDE_ARCHIVED_PROJECTS = 'HIDE_ARCHIVED_PROJECTS'

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
    projectById: state => projectId => {
      return state.list.find(({
        id
      }) => id === projectId) || {}
    },
    teamLeadById: (state, getters, rootState, rootGetters) => projectId => {
      const users = rootGetters['users/list']
      const project = getters.projectById(projectId)
      const user = users.find(({
        id
      }) => id === project.teamLeadId) || {}
      return user
    },
    shouldHideArchived (state) {
      return state.shouldHideArchived
    }
  },

  mutations: {
    ...vuexfireMutations,
    [HIDE_ARCHIVED_PROJECTS] (state) {
      state.shouldHideArchived = !state.shouldHideArchived
    }
  },

  actions: {
    bind: firestoreAction(({
      bindFirestoreRef
    }, orgId) => {
      const $db = firebase.firestore()

      return bindFirestoreRef('list', $db.collection('projects').where('orgId', '==', orgId))
    }),
    hideArchived ({
      commit
    }) {
      commit(HIDE_ARCHIVED_PROJECTS)
    }
  }
}
