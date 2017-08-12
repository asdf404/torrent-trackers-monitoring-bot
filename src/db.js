const url = require('url')
const { REDIS_URL } = process.env

const Redis = require('ioredis')
const opts = url.parse(REDIS_URL)
const redis = new Redis({
  port: opts.port || 6379,
  host: opts.host || 'redis',
  retryStrategy: times => Math.min(times * 50, 2000)
})

module.exports = { redis }
