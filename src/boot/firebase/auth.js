export default ({
  Vue
}) => {
  const { $firebase } = Vue.prototype
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      $firebase.auth.signInWithEmailAndPassword(email, password)
        .then(resolve)
        .catch(reject)
    })
  }
  const signUp = ({
    orgName,
    firstName,
    lastName,
    email,
    password
  }) => {
    return new Promise((resolve, reject) => {
      const { $firebase } = Vue.prototype

      $firebase.cfApi('user')({
        orgName,
        firstName,
        lastName,
        email,
        password,
        action: 'register'
      })
        .then(() => {
          login(email, password)
            .then(resolve)
            .catch(reject)
        })
        .catch(reject)
    })
  }
  const signOut = () => {
    const { $firebase } = Vue.prototype
    return $firebase.auth.signOut()
  }

  Vue.prototype.$firebase.login = login
  Vue.prototype.$firebase.signUp = signUp
  Vue.prototype.$firebase.signOut = signOut
}
