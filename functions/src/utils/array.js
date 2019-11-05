import _ from 'lodash'
import runPromiseSerial from './promiseSerial'

export const isEqual = (arr1, arr2) => {
  return _.difference(arr1, arr2).length === 0 && _.difference(arr2, arr1).length === 0
}

export const arrayResolver = async (arr = [], itemResolver) => {
  const _itemResolver = item => resolve => itemResolver(item).then(resolve)
  let promises = arr.map(item => new Promise(_itemResolver(item)))
  return Promise.all(promises)
}

export const arraySeriesResolver = async (arr = [], itemResolver) => {
  const _itemResolver = item => () => itemResolver(item)
  const promiseSerial = arr.map(item => _itemResolver(item))
  return runPromiseSerial(promiseSerial)
}
