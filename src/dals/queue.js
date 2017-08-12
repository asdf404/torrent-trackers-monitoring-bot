const { redis } = require('../db')

function queue ({ redis }) {
  /**
   * Get next item from queue
   * @param {String} queue Queue name
   * @return {String}
   */
  async function get (queue) {
    const val = await redis.spop(`queue:${queue}`)
    return val
  }

  /**
   * Add one or more values to queue
   * @param {String} queue Queue name
   * @param {String|String[]} value One or array of values
   */
  async function add (queue, value) {
    const values = Array.isArray(value) ? value : [ value ]
    await values.reduce(
      (pipeline, val) => pipeline.sadd(`queue:${queue}`, val),
      redis.pipeline()
    ).exec()
  }

  return { add, get }
}

module.exports = queue({ redis })
