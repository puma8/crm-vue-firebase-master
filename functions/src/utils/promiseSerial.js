const promiseSerial = funcs => {
  return funcs.reduce((promise, func) => {
    return promise.then(result => {
      return func().then(() => {
        return Array.prototype.concat.bind(result)
      })
    })
  }, Promise.resolve([]))
}

export default promiseSerial
