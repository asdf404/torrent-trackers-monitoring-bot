const url = require('url')
const R = require('ramda')
const request = require('request')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')

function fetch (id) {
  return new Promise((resolve, reject) => {
    request({
      url: `http://rutracker.net/forum/viewtopic.php?t=${id}`,
      encoding: null
    }, (err, resp, body) => {
      if (err) { return reject(err) }
      const $ = cheerio.load(iconv.decode(body, 'win1251'))
      const title = $('#topic-title').text()
      const link = $('.magnet-link').attr('href')
      if (!title || !link) {
        return reject(new Error('Tracker is down'))
      }
      const parsed = url.parse(link, true)
      const magnet = url.format({
        protocol: parsed.protocol,
        query: R.omit([ 'tr' ], parsed.query)
      })

      resolve({ title, magnet })
    })
  })
}

module.exports = { fetch }
