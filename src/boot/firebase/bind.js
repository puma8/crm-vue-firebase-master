export default ({ store, Vue }) => {
  const { $firebase } = Vue.prototype

  $firebase.auth.onAuthStateChanged(async () => {
    const currentUser = $firebase.auth.currentUser

    if (currentUser) {
      const { uid } = currentUser

      store.dispatch('auth/bindUser', uid)

      const userDoc = await $firebase.db.doc(`users/${uid}`).get()
      const orgId = userDoc.data().orgId

      store.dispatch('organization/bind', orgId)
      store.dispatch('users/bind', orgId)
      store.dispatch('companies/bind', orgId)
      // store.dispatch('people/bind', orgId)
      store.dispatch('settings/bind', orgId)
      store.dispatch('deals/bind', orgId)
      store.dispatch('projects/bind', orgId)
      store.dispatch('integration/bind')

      $firebase.db.doc(`metadata/${uid}`).onSnapshot(() => {
        currentUser.getIdToken(true)
      })
    }
  })
}
