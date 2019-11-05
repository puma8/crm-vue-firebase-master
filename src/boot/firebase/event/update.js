import handleError from './error'

export default context => {
  return {
    update: update(context)
  }
}

export const update = context => async data => {
  const { Vue } = context
  const { $firebase } = Vue.prototype

  try {
    await $firebase.db.doc(`events/${data.id}`).update(data)
  } catch (error) {
    handleError(error)
  }
}
