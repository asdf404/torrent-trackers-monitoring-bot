const url = require('url')
const R = require('ramda')
const { TRACKERS } = require('./constants')

const matchTracker = R.cond([
  [ // parse rutracker
    (v) => [
      'rutracker.org', 'rutracker.net', 'maintracker.org'
    ].includes(v),
    R.always(TRACKERS.RUTRACKER)
  ],
  [
    R.T, R.always(TRACKERS.UNKNOWN)
  ]
])

const parseId = {
  [ TRACKERS.UNKNOWN ]: R.always(null),
  [ TRACKERS.RUTRACKER ]: R.path([ 'query', 't' ])
}

function detectTracker (link) {
  const parsed = url.parse(link, true)
  const tracker = matchTracker(parsed.hostname)
  const torrent = parseId[tracker](parsed)

  return { tracker, torrent }
}

function makeLink ({ tracker, torrent }) {
  switch (tracker) {
    case TRACKERS.RUTRACKER:
      return `https://rutracker.net/forum/viewtopic.php?t=${torrent}`
    default: return null
  }
}

module.exports = { detectTracker, makeLink }
