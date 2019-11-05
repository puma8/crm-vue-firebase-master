import merge from 'deepmerge'
import update from './update'

export default context => {
  const { Vue } = context

  Vue.prototype.$firebase.organization = merge.all([
    update(context)
  ])
}
