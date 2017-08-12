const { TRACKERS } = require('../constants')

module.exports = {
  [ TRACKERS.RUTRACKER ]: require('./rutracker')
}
