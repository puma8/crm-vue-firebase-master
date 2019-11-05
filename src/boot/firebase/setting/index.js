import merge from 'deepmerge'
import _create from './create'
import _update from './update'
import _delete from './delete'

export default context => {
  const { Vue } = context

  Vue.prototype.$firebase.setting = merge.all([
    _create(context),
    _update(context),
    _delete(context)
  ])
}
