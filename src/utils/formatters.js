import moment from 'moment'

export const stringifiedDate = (date, format = 'YYYY/MM/DD') => {
  if (!date) {
    return moment().format(format)
  } else if (typeof date === 'string') {
    return date
  }
  if (typeof date === 'number') {
    return moment(date).format(format)
  } else if (typeof date.toDate === 'function') {
    return moment(date.toDate()).format(format)
  } else {
    return moment(date).format(format)
  }
}

export const toDate = date => {
  if (!date) {
    return new Date()
  } else if (typeof date === 'string') {
    return moment(date).toDate()
  } else {
    return new Date()
  }
}

export const padTime = (hr = 0, min = 0, sec = 0, format = 'HH:mm:ss') => {
  return moment()
    .hours(hr || 0)
    .minutes(min || 0)
    .seconds(sec || 0)
    .format(format)
}
