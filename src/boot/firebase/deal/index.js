import merge from 'deepmerge'
import create from './create'
import update from './update'

export default context => {
  const { Vue } = context

  Vue.prototype.$firebase.deal = merge.all([
    create(context),
    update(context)
  ])
}
