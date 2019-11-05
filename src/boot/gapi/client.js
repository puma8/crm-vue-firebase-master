import drive from './drive'
import config from '../../config'

const initClient = () => {
  const {
    G_API_KEY
  } = config()

  return new Promise((resolve, reject) => {
    window.gapi.load('client', () => {
      window.gapi.client.setApiKey(G_API_KEY)
      window.gapi.client.load('https://content.googleapis.com/discovery/v1/apis/drive/v3/rest')
        .then(resolve)
        .catch(reject)
    })
  })
}

const client = async context => {
  await initClient()
  drive(context)
}

export default client
