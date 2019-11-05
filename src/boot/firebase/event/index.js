import merge from 'deepmerge'
import _create from './create'
import _update from './update'

export default context => {
  const { Vue } = context

  Vue.prototype.$firebase.event = merge.all([
    _create(context),
    _update(context)
  ])
}
