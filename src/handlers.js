const R = require('ramda')
const { users, torrents } = require('./dals')
const { detectTracker } = require('./utils')
const { TRACKERS } = require('./constants')

const MANUAL = `Torrent trackers monitoring bot.

  Usage:
  /help — this help.
  /add <link> — to start watching.
  /remove <link> — to stop watching.
  /list — to show all watching torrents.

  Supported trackers:
  • rutracker.org (and mirrors);
`.split('\n').map(s => s.trim()).join('\n')

/**
 * Show help
 */
async function help (bot, data) {
  const { id: telegram, username: nickname } = data.from
  await users.create({
    telegram, nickname
  })

  bot.sendMessage(data.from.id, MANUAL)
}

/**
 * Add new torrent
 */
async function add (bot, data, matches) {
  const url = matches[1]
  const { tracker, torrent } = detectTracker(url)
  if (tracker === TRACKERS.UNKNOWN) {
    bot.sendMessage(data.from.id, 'I don\'t know this tracker. Sorry :(')
    return
  }

  const exists = await torrents.get(`${tracker}_${torrent}`)
  if (!exists) {
    await torrents.create({ tracker, torrent, url })
  }

  await users.follow(`TELEGRAM_${data.from.id}`, `${tracker}_${torrent}`)
  bot.sendMessage(data.from.id, 'Added')
}

/**
 * Remove torrent
 */
async function remove (bot, data, matches) {
  const url = matches[1]
  const { tracker, torrent } = detectTracker(url)
  if (tracker === TRACKERS.UNKNOWN) {
    bot.sendMessage(data.from.id, 'I don\'t know this tracker. Sorry :(')
    return
  }

  await users.unfollow(`TELEGRAM_${data.from.id}`, `${tracker}_${torrent}`)
  bot.sendMessage(data.from.id, 'Removed')
}

/**
 * Show all user's torrents
 */
async function list (bot, data, { offset = 0 } = {}) {
  const { id: user } = data.from
  const result = await torrents.list({ user: `TELEGRAM_${user}`, offset })
  if (!result.length) {
    bot.sendMessage(user, 'You have no torrents')
    return
  }

  const torrentsList = result.map(torrent =>
    `• <a href="${torrent.url}">${torrent.title || torrent.url}</a>`).join('\n')

  bot.sendMessage(
    user,
    'Your torrents:\n' + torrentsList,
    {
      parse_mode: 'html',
      disable_web_page_preview: true
    }
  )
}

/**
 * Send notification to user about updated torrent
 */
async function notify (bot, user, torrent) {
  const html = `<a href="${torrent.url}">${torrent.title || torrent.url}</a>`

  bot.sendMessage(
    user,
    'Torrent updated:\n' + html,
    {
      parse_mode: 'html',
      disable_web_page_preview: true
    }
  )
}

module.exports = {
  help: R.curry(help),
  add: R.curry(add),
  remove: R.curry(remove),
  list: R.curry(list),
  notify: R.curry(notify)
}
