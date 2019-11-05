import firebase from 'firebase/app'
require('firebase/auth')
import config from '../config'

export default ({
  router
}) => {
  if (config().FIREBASE_API_KEY) {
    router.beforeEach((to, from, next) => {
      firebase.auth().onAuthStateChanged(() => {
        const currentUser = firebase.auth().currentUser
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

        if (requiresAuth && !currentUser) {
          next({
            name: 'login',
            query: {
              redirect: to.fullPath
            }
          })
        } else if (currentUser && !currentUser.emailVerified && to.path !== '/confirm-email') next({ name: 'confirm-email' })
        else if (to.path === '/login' && (!requiresAuth && currentUser)) next({ name: 'deals' })
        else if (to.path === '/register' && (!requiresAuth && currentUser)) next({ name: 'deals' })
        else next()
      })
    })
  }
}
