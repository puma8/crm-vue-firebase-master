import nylas from 'nylas'
import config from '../../utils/config'

const getNylas = () => {
  nylas.config({
    clientId: config.nylas.client_id,
    clientSecret: config.nylas.client_secret
  })

  return nylas
}

export const exchangeForToken = code => getNylas().exchangeCodeForToken(code)

export const getAccount = token =>
  getNylas()
    .with(token)
    .account.get()

export const getThreads = (integration, options) =>
  getNylas()
    .with(integration.accessToken)
    .threads.list(options)
