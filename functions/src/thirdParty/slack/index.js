import {
  WebClient
} from '@slack/web-api'
import config from '../../utils/config'

export const exchangeForToken = code => {
  return (new WebClient()).oauth.access({
    client_id: config.slack.client_id,
    client_secret: config.slack.client_secret,
    code,
    redirect_uri: config.slack.oauth_redirect
  })
}

export const usersInfo = (token, payload) => {
  return (new WebClient(token)).users.info(payload)
}

export const usersLookupByEmail = (token, payload) => {
  return (new WebClient(token)).users.lookupByEmail(payload)
}

export const usersList = token => {
  return (new WebClient(token)).users.list()
}

export const userInfo = (token, payload) => {
  return (new WebClient(token)).users.info(payload)
}

export const conversationsList = (token, payload) => {
  return (new WebClient(token)).conversations.list(payload)
}

export const channelsCreate = (token, name) => {
  return (new WebClient(token)).channels.create({
    name
  })
}

export const channelsArchive = (token, payload) => {
  return (new WebClient(token)).channels.archive(payload)
}

export const channelsUnarchive = (token, payload) => {
  return (new WebClient(token)).channels.unarchive(payload)
}

export const channelsRename = (token, payload) => {
  return (new WebClient(token)).channels.rename(payload)
}

export const channelInfo = (token, payload) => {
  return (new WebClient(token)).channels.info(payload)
}

export const inviteToChannel = (token, payload) => {
  return (new WebClient(token)).channels.invite(payload)
}

export const channelsKick = (token, payload) => {
  return (new WebClient(token)).channels.kick(payload)
}

export const chatPostMessage = (token, payload) => {
  return (new WebClient(token)).chat.postMessage(payload)
}

export const chatPostEphemeral = (token, payload) => {
  return (new WebClient(token)).chat.postEphemeral(payload)
}

export const chatUpdate = (token, payload) => {
  return (new WebClient(token)).chat.update(payload)
}

export const dialogOpen = (token, payload) => {
  return (new WebClient(token)).dialog.open(payload)
}
