import moment from 'moment'
import {
  stringifiedDate
} from './formatters'

export const stringifyDate = function (timestamp) {
  return stringifiedDate(timestamp)
}

export const due = function (date) {
  if (!date) return ''
  const dateString = date.toDate()
  if (moment(dateString).isBefore(moment())) {
    if (moment().diff(moment(dateString), 'd') === 0) {
      return 'Due today'
    }
    return `Due ${moment().from(dateString, true)}`
  } else {
    return `Due in ${moment(dateString).fromNow(true)}`
  }
}

export const fromNow = date => {
  return moment(stringifiedDate(date, 'YYYY/MM/DD HH:mm:ss')).fromNow()
}
