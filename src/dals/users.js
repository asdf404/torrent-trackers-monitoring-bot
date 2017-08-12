const R = require('ramda')
const { redis } = require('../db')

const USER_FIELDS = [
  'id', 'telegram', 'nickname'
]

function users ({ redis }) {
  /**
   * Return user data
   * @param {String} id User ID
   * @return {Object} User data
   */
  async function get (id) {
    const user = await redis.hgetall(`users:user.${id}`)
    return R.pick(USER_FIELDS, user)
  }

  /**
   * Create new user
   * @param {Object} user
   * @return {String} Inserted ID
   */
  async function create ({
    telegram, nickname
  }) {
    const id = `TELEGRAM_${telegram}`
    await redis
      .pipeline()
      .hmset(`users:user.${id}`, {
        id,
        telegram,
        nickname
      })
      .sadd('users:all', id)
      .exec()

    return id
  }

  /**
   * Subscribe user to torrent updates
   * @param {String} user User's ID
   * @param {String} torrent Torrent's ID
   */
  async function follow (user, torrent) {
    await redis.pipeline()
      .sadd(`users:user.${user}:subscriptions`, torrent)
      .sadd(`torrents:torrent.${torrent}:subscribers`, user)
      .exec()
  }

  /**
   * Unsubscribe user from torrent updates
   * @param {String} user User's ID
   * @param {String} torrent Torrent's ID
   */
  async function unfollow (user, torrent) {
    await redis.pipeline()
      .srem(`users:user.${user}:subscriptions`, torrent)
      .srem(`torrents:torrent.${torrent}:subscribers`, user)
      .exec()
  }

  return { create, get, follow, unfollow }
}

module.exports = users({ redis })
module.exports.FIELDS = USER_FIELDS
