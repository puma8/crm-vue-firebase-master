import asyncPool from 'tiny-async-pool'
import runPromiseSerial from './promiseSerial'

export const collectionResolver = async (
  collectionRef,
  docResolver,
  poolLimit = 0
) => {
  const _docResolver = doc => resolve => docResolver(doc).then(resolve)
  const collection = await collectionRef.get()
  if (poolLimit === 0) {
    let promises = collection.docs.map(doc => new Promise(_docResolver(doc)))
    return Promise.all(promises)
  } else {
    return asyncPool(
      poolLimit,
      collection.docs,
      doc => new Promise(_docResolver(doc))
    )
  }
}

export const collectionSeriesResolver = async (collectionRef, itemResolver) => {
  const _docResolver = doc => () => itemResolver(doc)
  const collection = await collectionRef.get()
  const promiseSerial = collection.docs.map(doc => _docResolver(doc))
  return runPromiseSerial(promiseSerial)
}
