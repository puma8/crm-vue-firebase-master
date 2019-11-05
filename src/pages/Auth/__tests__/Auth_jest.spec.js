/* eslint-disable */
/**
 * @jest-environment jsdom
 */

import {
  mount,
  createLocalVue,
  shallowMount
} from '@vue/test-utils'
import Auth from '../Auth.vue'
import * as All from 'quasar'
// import langEn from 'quasar/lang/en-us' // change to any language you wish! => this breaks wallaby :(
const {
  Quasar,
  QInput,
  QIcon,
  QBtn,
  QSpinnerGears
} = All

describe('Mount LoginPage', () => {
  const localVue = createLocalVue()
  localVue.use(Quasar, {
    components: {
      QInput,
      QIcon,
      QBtn,
      QSpinnerGears
    }
  })

  const $route = {
    name: 'Login'
  }
  const $v = {
    orgName: {},
    firstName: {},
    lastName: {},
    email: {},
    password: {},
    passwordMatch: {}
  }
  const wrapper = mount(Auth, {
    localVue,
    propsData: {},
    mocks: {
      $route,
      $v
    }
  })

  it('passes the sanity check and creates a wrapper', () => {
    expect(wrapper.isVueInstance()).toBe(true)
  })
})
