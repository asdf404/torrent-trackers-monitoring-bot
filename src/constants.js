function toEnum (arr) {
  arr.forEach(v => {
    Object.defineProperty(arr, v, {
      enumerable: false,
      get () {
        return v
      }
    })
  })

  return arr
}

const TRACKERS = toEnum([
  'UNKNOWN',
  'RUTRACKER'
])

module.exports = {
  TRACKERS
}
