const boardGuard = to => {
  return ['proposal', 'job', 'service'].includes(to.query.board) ? null : {
    query: { board: 'proposal' }
  }
}

const viewModeGuard = to => {
  return ['kanban', 'list'].includes(to.query.viewMode) ? null : {
    query: { viewMode: 'list' }
  }
}

export default (to, from, next) => {
  let query = {}
  let pass = true

  if (boardGuard(to)) {
    query = { ...query, ...boardGuard(to).query }
    pass = false
  }
  if (viewModeGuard(to)) {
    query = { ...query, ...viewModeGuard(to).query }
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
