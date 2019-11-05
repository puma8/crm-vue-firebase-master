import _ from 'lodash'
import * as ROLES from '../constants/roles'

let resolvers = {}

const isGrantedPermission = p => p === 1
const isDeniedPermission = p => p === 0

const isOwner = store => () => {
  const activeUser = store.getters['auth/user']

  return activeUser.roleId === ROLES.OWNER
}

const compareRole = store => roleId => {
  const activeUser = store.getters['auth/user']

  if (activeUser.roleId === roleId) {
    return 0
  }

  if (activeUser.roleId === ROLES.OWNER) {
    return 1
  }

  if (activeUser.roleId === ROLES.USER) {
    return -1
  }

  return roleId === ROLES.OWNER ? -1 : 1
}

const isNotHigherThan = store => (target, entity) => {
  if (entity === 'user') {
    return compareRole(store)(target.roleId) !== -1
  } else if (entity === 'role') {
    return compareRole(store)(target) !== -1
  }
}

const canAccessAdmin = store => () => {
  const activeUser = store.getters['auth/user']

  return [ROLES.OWNER, ROLES.ADMIN].includes(activeUser.roleId)
}

const hasPermission = store => (action, target, ...args) => {
  const activeUser = store.getters['auth/user']
  const permissions = store.getters['settings/permissions']
  const permission = _.get(permissions, `${action}.${activeUser.roleId}`, false)

  if (isGrantedPermission(permission) || isGrantedPermission(permission[target])) {
    return true
  }
  if (isDeniedPermission(permission) || isDeniedPermission(permission[target])) {
    return false
  }
  return typeof resolvers[permission[target]] === 'function'
    ? resolvers[permission[target]](...args)
    : isGrantedPermission(permission.otherwise)
}

const canViewUser = store => user => {
  return hasPermission(store)('read', 'users', user, 'user')
}

const isMemberOf = store => container => {
  const activeUser = store.getters['auth/user']
  return container.teamLeadId === activeUser.id || (container.members || []).includes(activeUser.id)
}

export default ({
  app,
  router,
  Vue,
  store
}) => {
  resolvers = {
    isOwner: isOwner(store),
    isNotHigherThan: isNotHigherThan(store),
    canAccessAdmin: canAccessAdmin(store),
    hasPermission: hasPermission(store),
    canViewUser: canViewUser(store),
    isMemberOf: isMemberOf(store)
  }
  Vue.prototype.$permissionResolver = resolvers
}
