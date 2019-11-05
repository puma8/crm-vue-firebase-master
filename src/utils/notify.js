import { Notify } from 'quasar'

export const notifySuccess = message => {
  Notify.create({
    classes: 'text-weight-bold text-center',
    color: 'positive',
    message
  })
}

export const notifyFailure = message => {
  Notify.create({
    classes: 'text-weight-bold text-center',
    color: 'negative',
    message
  })
}
