import { request } from '../../utils/http'
import config from '../../utils/config'

const frontAppHttp = req => request({
  ...req,
  url: req.fullUrl ? req.fullUrl : `https://api2.frontapp.com${req.url}`,
  headers: {
    ...(req.headers || {}),
    Authorization: `Bearer ${config.frontapp.token}`
  }
}).then(response => response.data)

export const getTag = id => frontAppHttp({
  url: `/tags/${id}`
})

export const createTag = ({ name, color }) => frontAppHttp({
  url: '/tags',
  method: 'post',
  body: {
    name,
    color: color || ['grey', 'pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'][parseInt(Math.random() * 8)]
  }
}).catch(error => {
  throw error
})

export const getInboxByTag = id => frontAppHttp({ url: `/tags/${id}/conversations` })

export const getUsers = () => frontAppHttp({
  url: '/teammates'
})

export const getConversation = id => frontAppHttp({
  url: `/conversations/${id}`
})

export const getMessage = id => frontAppHttp({
  url: `/messages/${id}`
})

export const getComment = id => frontAppHttp({
  url: `/comments/${id}`
})

export const getCommentMentions = id => frontAppHttp({
  url: `/comments/${id}/mentions`
})

export const createComment = (conversationId, authorId, body) => frontAppHttp({
  url: `/conversations/${conversationId}/comments`,
  method: 'post',
  body: {
    author_id: authorId,
    body
  }
})

export const getContacts = nextPage => !nextPage ? frontAppHttp({
  url: '/contacts?limit=100'
}) : frontAppHttp({
  fullUrl: nextPage
})
