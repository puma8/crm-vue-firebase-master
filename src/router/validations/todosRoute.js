const statusGuard = to => {
  return ['pending', 'done'].includes(to.query.status) ? null : {
    query: {
      status: 'pending'
    }
  }
}

export default (to, from, next) => {
  if (statusGuard(to)) {
    next({
      ...to,
      query: {
        ...to.query,
        ...statusGuard(to).query
      }
    })
  } else {
    next()
  }
}
