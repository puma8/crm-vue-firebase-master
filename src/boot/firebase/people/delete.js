import handleError from './error'

export default context => {
  return {
    delete: deleteContact(context)
  }
}

export const deleteContact = context => async id => {
  const {
    Vue
  } = context
  const {
    $firebase
  } = Vue.prototype

  try {
    await $firebase.db.doc(`people/${id}`).delete()
  } catch (error) {
    handleError(error)
  }
}
