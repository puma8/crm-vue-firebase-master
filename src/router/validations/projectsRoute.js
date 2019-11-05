const viewModeGuard = to => {
  return ['kanban', 'list'].includes(to.query.viewMode) ? null : {
    query: {
      viewMode: 'list'
    }
  }
}

export default (to, from, next) => {
  let query = {}
  let pass = true

  if (viewModeGuard(to)) {
    query = {
      ...query,
      ...viewModeGuard(to).query
    }
    pass = false
  }

  if (pass) {
    next()
  } else {
    next({
      ...to,
      query: {
        ...to.query,
        ...query
      }
    })
  }
}
