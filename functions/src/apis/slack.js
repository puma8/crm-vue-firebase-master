import * as functions from 'firebase-functions'
import {
  connectSlack,
  getSlackUsers,
  createSlackChannel,
  linkWithSlackChannel
} from '../app'

export default functions.https.onCall((data, context) => {
  const {
    action
  } = data

  switch (action) {
    case 'connect':
      return connectSlack(data, context)
    case 'getUsers':
      return getSlackUsers(context)
    case 'createChannel':
      return createSlackChannel(data, context)
    case 'linkWithSlackChannel':
      return linkWithSlackChannel(data)
  }
})
