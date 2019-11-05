import qs from 'qs'
import axios from 'axios'

export const request = ({
  url,
  method = 'get',
  params = {},
  headers = {},
  body = {},
  type = 'application/json',
  stringify = false,
  timeout = 20000
}) => {
  if (!url) return Promise.reject(new Error('Request URL is undefined'))
  const urlParams = {
    ...params
  }
  const reqHeaders = {
    Accept: 'application/json',
    'Content-Type': type,
    ...headers
  }
  const formattedBody = stringify
    ? Object.keys(body).reduce((acc, key) => {
      acc[key] =
        typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key]
      return acc
    }, {})
    : body
  return axios({
    method,
    url,
    data: stringify ? qs.stringify(formattedBody) : formattedBody,
    params: urlParams,
    headers: reqHeaders,
    timeout
  })
}

export const getStatic = ({ url }) =>
  axios({
    method: 'get',
    url,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  })
    .then(res => res.data)
    .catch(err => {
      throw err
    })
