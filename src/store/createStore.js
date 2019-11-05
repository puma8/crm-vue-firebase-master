import Vuex from 'vuex'
import {
  vuexfireMutations
} from 'vuexfire'

import auth from './auth'
import organization from './organization'
import users from './users'
import companies from './companies'
import people from './people'
import settings from './settings'
import deals from './deals'
import projects from './projects'
import integration from './integration'

export default () => {
  const Store = new Vuex.Store({
    modules: {
      auth,
      organization,
      users,
      deals,
      projects,
      companies,
      people,
      settings,
      integration
    },

    mutations: {
      ...vuexfireMutations
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
