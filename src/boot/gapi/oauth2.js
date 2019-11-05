import { gOAuth2 } from 'src/utils'
import config from '../../config'

function installGoogleAuthPlugin (Vue, options) {
  const GoogleAuthDefaultConfig = { scope: 'profile email', discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'] }
  let GoogleAuthConfig = null
  let prompt = 'select_account'
  if (typeof options === 'object') {
    GoogleAuthConfig = Object.assign(GoogleAuthDefaultConfig, options)
    if (options.scope) GoogleAuthConfig.scope = options.scope
    if (options.prompt) prompt = options.prompt
  }

  Vue.prototype.$gAuth = gOAuth2
  gOAuth2.load(GoogleAuthConfig, prompt)
}

export default ({
  Vue
}) => {
  const {
    G_OAUTH2_CLIENT_ID
  } = config()

  Vue.use(installGoogleAuthPlugin, {
    clientId: G_OAUTH2_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive',
    prompt: 'consent',
    fetch_basic_profile: true
  })
}
