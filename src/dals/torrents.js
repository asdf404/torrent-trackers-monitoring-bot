const R = require('ramda')
const ms = require('ms')
const { redis } = require('../db')
const { TRACKERS } = require('../constants')
const { FIELDS: USER_FIELDS } = require('./users')

const CHECK_INTERVAL = ms(process.env.TORRENT_CHECK_INTERVAL)

const TORRENT_FIELDS = [
  'id', 'title', 'url', 'tracker', 'torrent', 'magnet', 'updated', 'checked'
]

function torrents ({ redis }) {
  /**
   * Load torrent info
   * @param {String} id Torrent ID
   * @return {Object} Torrent info
   */
  async function get (id) {
    const torrent = await redis.hgetall(`torrents:torrent.${id}`)
    if (Object.keys(torrent).length) {
      const data = R.pick(TORRENT_FIELDS, torrent)
      return {
        ...data,
        updated: parseInt(data.updated, 10) || 0,
        checked: parseInt(data.checked, 10) || 0
      }
    }
    return null
  }

  /**
   * Add new torrent
   * @param {Object} torrent
   * @param {String} torrent.tracker Tracker ENUM
   * @param {String} torrent.torrent Torrent ID
   * @return {String} Inserted ID
   */
  async function create ({
    tracker, torrent, title = '', url, magnet = null
  }) {
    if (!TRACKERS.includes(tracker)) {
      throw new Error('Unknown tracker')
    }

    const id = `${tracker}_${torrent}`
    await redis
      .pipeline()
      .hmset(`torrents:torrent.${id}`, {
        id,
        title,
        tracker,
        torrent,
        url,
        magnet,
        updated: 0,
        checked: 0
      })
      .zadd('torrents:all', 0, id)
      .exec()

    return id
  }

  /**
   * Update torrent info
   * @param {String} id Torrent ID
   * @param {Object} data New torrent data
   * @return {true}
   */
  async function update (id, data) {
    await redis.pipeline()
      .del(`torrents:torrent.${id}`)
      .hmset(`torrents:torrent.${id}`, data)
      .zadd('torrents:all', data.checked, id)
      .exec()
    return true
  }

  async function remove () {
    throw new Error('Method torrents#remove is not implemented')
  }

  /**
   * List of all torrents [by user]
   * @param {Object} options
   * @param {Number} options.offset Offset
   * @param {Number} options.limit Limit
   * @param {String} options.user User ID
   * @param {String} options.sort Sort field
   * @param {String} options.order Ordering `ASC` or `DESC`
   * @return {Object[]} List of torrents
   */
  async function list ({
    offset = 0, limit = 1000, user = null, sort = 'updated', order = 'DESC'
  } = {}) {
    const key = user ? `users:user.${user}:subscriptions` : 'torrents:all'

    const torrents = R.splitEvery(
      TORRENT_FIELDS.length,
      await redis.sort(
        key,
        'BY', `torrents:torrent.*->${sort}`,
        'LIMIT', offset, limit,
        // add `GET torrent.*->field` expressions
        ...R.flatten(
          TORRENT_FIELDS.map(f => [ 'GET', `torrents:torrent.*->${f}` ])
        ),
        order
      )
    )
      .filter(res => res.length === TORRENT_FIELDS.length)
      .map(R.zipObj(TORRENT_FIELDS))
      .map(t => ({
        ...t,
        updated: parseInt(t.updated, 10) || 0,
        checked: parseInt(t.checked, 10) || 0
      }))

    return torrents
  }

  /**
   * List of outdated torrents
   * @param {Object} options
   * @param {Number} options.offset Offset
   * @param {Number} options.limit Limit
   * @param {Number} options.since Timestamp
   * @return {Object[]} List of torrents
   */
  async function outdated ({
    limit = 1000, offset = 0, since = Date.now() - CHECK_INTERVAL
  } = {}) {
    const torrents = await redis.zrangebyscore(
      'torrents:all',
      0, since,
      'LIMIT', offset, limit
    )

    return torrents
  }

  /**
   * List of torrent subscribers
   * @param {Object} options
   * @param {String} options.torrent Torrent ID
   * @param {Number} options.offset Offset
   * @param {Number} options.limit Limit
   * @param {String} options.order Ordering `ASC` or `DESC`
   * @return {Object[]} List of users
   */
  async function subscribers ({
    torrent, limit = 1000, offset = 0, order = 'DESC'
  } = {}) {
    const users = R.splitEvery(
      USER_FIELDS.length,
      await redis.sort(
        `torrents:torrent.${torrent}:subscribers`,
        'BY', 'no_sort', 'LIMIT', offset, limit,
        // add `GET user.*->field` expressions
        ...R.flatten(
          USER_FIELDS.map(f => [ 'GET', `users:user.*->${f}` ])
        ),
        order
      )
    )
      .filter(res => res.length === USER_FIELDS.length)
      .map(R.zipObj(USER_FIELDS))

    return users
  }

  return { get, create, update, remove, list, outdated, subscribers }
}

module.exports = torrents({ redis })
module.exports.FIELDS = TORRENT_FIELDS
