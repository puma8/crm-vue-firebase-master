import Vue from 'vue'
import VueRouter from 'vue-router'

import createRouter from './createRouter'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  return createRouter()
}
