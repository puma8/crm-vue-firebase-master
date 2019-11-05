const googleAuth = (function () {
  function initClient (config) {
    return new Promise((resolve) => {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init(config)
          .then(() => {
            resolve(window.gapi)
          })
      })
    })
  }

  function Auth () {
    if (!(this instanceof Auth)) {
      return new Auth()
    }
    this.GoogleAuth = null /* window.gapi.auth2.getAuthInstance() */
    this.isAuthorized = false
    this.isInit = false
    this.prompt = null
    this.isLoaded = function () {
      return !!this.GoogleAuth
    }

    this.load = (config, prompt) => {
      initClient(config)
        .then((gapi) => {
          this.GoogleAuth = gapi.auth2.getAuthInstance()
          this.isInit = true
          this.prompt = prompt
          this.isAuthorized = this.GoogleAuth.isSignedIn.get()
        })
    }

    this.signIn = (successCallback, errorCallback) => {
      return new Promise((resolve, reject) => {
        if (!this.GoogleAuth) {
          if (typeof errorCallback === 'function') errorCallback(false)
          reject(false)
          return
        }
        this.GoogleAuth.signIn()
          .then(googleUser => {
            if (typeof successCallback === 'function') successCallback(googleUser)
            this.isAuthorized = this.GoogleAuth.isSignedIn.get()
            resolve(googleUser)
          })
          .catch(error => {
            if (typeof errorCallback === 'function') errorCallback(error)
            reject(error)
          })
      })
    }

    this.getAuthCode = (successCallback, errorCallback) => {
      return new Promise((resolve, reject) => {
        if (!this.GoogleAuth) {
          if (typeof errorCallback === 'function') errorCallback(false)
          reject(false)
          return
        }
        this.GoogleAuth.grantOfflineAccess({ prompt: this.prompt })
          .then(function (resp) {
            if (typeof successCallback === 'function') successCallback(resp.code)
            resolve(resp.code)
          })
          .catch(function (error) {
            if (typeof errorCallback === 'function') errorCallback(error)
            reject(error)
          })
      })
    }

    this.signOut = (successCallback, errorCallback) => {
      return new Promise((resolve, reject) => {
        if (!this.GoogleAuth) {
          if (typeof errorCallback === 'function') errorCallback(false)
          reject(false)
          return
        }
        this.GoogleAuth.signOut()
          .then(() => {
            if (typeof successCallback === 'function') successCallback()
            this.isAuthorized = false
            resolve(true)
          })
          .catch(error => {
            if (typeof errorCallback === 'function') errorCallback(error)
            reject(error)
          })
      })
    }
  }

  return new Auth()
})()

export default googleAuth
