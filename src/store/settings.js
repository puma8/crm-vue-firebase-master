import {
  vuexfireMutations,
  firestoreAction
} from 'vuexfire'
import firebase from 'firebase/app'

const initialState = {
  general: {},
  deal: {
    boards: [],
    stages: [],
    win: 'jobs',
    lost: [],
    customFields: []
  },
  project: {
    sections: [],
    customFields: []
  },
  person: {
    designations: [],
    roles: []
  },
  security: {
    roles: [],
    permissions: []
  }
}

export default {
  namespaced: true,

  state: initialState,

  getters: {
    general: state => state.general,
    emailTypeById: state => id => {
      const emailTypes = state.general.emailTypes || []
      return emailTypes.find(e => e.id === id) || {}
    },
    phoneTypeById: state => id => {
      const phoneTypes = state.general.phoneTypes || []
      return phoneTypes.find(e => e.id === id) || {}
    },
    deal: state => state.deal,
    boardById: state => id => {
      return state.deal.boards.find(board => board.id === id) || {}
    },
    stageById: state => id => {
      const stages = state.deal.stages || []
      return stages.find(stage => stage.id === id) || {}
    },
    stagesByBoardId: state => boardId => {
      const stages = state.deal.stages || []

      return stages
        .filter(stage => stage.boardId === boardId)
        .sort((a, b) => a.order - b.order)
    },
    dealStagePerc: (state, getters) => deal => {
      const filteredStages = getters.stagesByBoardId(deal.boardId)
      const index = filteredStages
        .sort((a, b) => a.order - b.order)
        .findIndex(e => e.id === deal.stageId)

      return (index + 1) / filteredStages.length
    },
    customFieldById: state => (id, entity = 'deal') => {
      return (state[entity].customFields || []).find(cf => cf.id === id)
    },
    project: state => state.project,
    sectionById: state => id => {
      const sections = state.project.sections || []
      return sections.find(section => section.id === id) || {}
    },
    person: state => state.person,
    designationById: state => id => {
      const designations = state.person.designations || []
      return designations.find(d => d.id === id) || {}
    },
    roleById: state => id => {
      const roles = state.person.roles || []
      return roles.find(d => d.id === id) || {}
    },
    security: state => state.security,
    userRoles: state => state.security.roles,
    permissions: state => state.security.permissions
  },

  mutations: {
    ...vuexfireMutations
  },

  actions: {
    bind: firestoreAction(({
      bindFirestoreRef
    }, orgId) => {
      const $db = firebase.firestore()

      bindFirestoreRef('general', $db.doc(`organizations/${orgId}/settings/general`))
      bindFirestoreRef('person', $db.doc(`organizations/${orgId}/settings/person`))
      bindFirestoreRef('deal', $db.doc(`organizations/${orgId}/settings/deal`))
      bindFirestoreRef('project', $db.doc(`organizations/${orgId}/settings/project`))
      bindFirestoreRef('security', $db.doc(`organizations/${orgId}/settings/security`))
    })
  }
}
