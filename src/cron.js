const { torrents, queue } = require('./dals')
const fetchers = require('./fetchers')
const bot = require('./bot')
const notify = require('./handlers').notify(bot)

setInterval(async () => {
  try {
    const ids = await torrents.outdated()
    await queue.add('outdated', ids)
  } catch (e) {
    console.log('cron:outdated error', e)
  }
}, 10000)

setInterval(async () => {
  try {
    const now = Date.now()
    const id = await queue.get('outdated')
    const torrent = await torrents.get(id)
    if (!torrent) return
    console.log('cron:fetch update', id)

    const data = await fetchers[torrent.tracker].fetch(torrent.torrent)

    const isUpdated = data.magnet !== torrent.magnet
    const updated = isUpdated ? now : torrent.updated
    await torrents.update(id, {
      ...torrent,
      ...data,
      updated,
      checked: now
    })

    if (isUpdated) {
      await queue.add('updated', torrent.id)
    }
  } catch (e) {
    console.log('cron:fetch error', e)
  }
}, 10000)

setInterval(async () => {
  try {
    const id = await queue.get('updated')
    const torrent = await torrents.get(id)
    if (!torrent) return
    console.log('cron:notify update', id)
    const subscribers = await torrents.subscribers({ torrent: id })
    for (let user of subscribers) {
      await notify(user.telegram, torrent)
    }
  } catch (e) {
    console.log('cron:notify error', e)
  }
}, 10000)
