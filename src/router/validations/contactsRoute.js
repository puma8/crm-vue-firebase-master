const typeGuard = to => {
  return ['people', 'company'].includes(to.query.type) ? null : {
    query: { type: 'people' }
  }
}

export default (to, from, next) => {
  if (typeGuard(to)) {
    next({
      ...to,
      query: {
        ...to.query,
        ...typeGuard(to).query
      }
    })
  } else {
    next()
  }
}
