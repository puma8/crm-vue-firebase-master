/* eslint-disable */
/**
 * @jest-environment jsdom
 */

import {
  mount,
  createLocalVue,
  shallowMount
} from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import DealsList from '../DealsList.vue'
import createStore from '../../../../store/createStore'
import createRouter from '../src/router/createRouter'
import * as All from 'quasar'
// import langEn from 'quasar/lang/en-us' // change to any language you wish! => this breaks wallaby :(
const {
  Quasar
} = All

const components = Object.keys(All).reduce((object, key) => {
  const val = All[key]
  if (val && val.component && val.component.name != null) {
    object[key] = val
  }
  return object
}, {})

describe('Mount DealsListPage', () => {
  const localVue = createLocalVue()
  localVue.use(Quasar, {
    components
  })
  localVue.use(Vuex)
  localVue.use(VueRouter)

  const wrapper = mount(DealsList, {
    localVue,
    store: createStore(),
    router: createRouter()
  })

  it('passes the sanity check and creates a wrapper', () => {
    expect(wrapper.isVueInstance()).toBe(true)
  })
})
