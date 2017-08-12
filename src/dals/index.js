/*
  DB Schema:

  List of all users:
    'SET users:all' if ID
    'HASH users:user.<id>' if key => value

  List of all torrents:
    'ZSET torrents:all' of ID => updated
    'HASH torrents:torrent.<id>' of key => value
  Fetch: SORT torrents BY torrent:torrent.*->updated LIMIT <offset> 10
          GET torrents:torrent.*->id      # internal ID
          GET torrents:torrent.*->title   # title
          GET torrents:torrent.*->url     # URL of torrent file
          GET torrents:torrent.*->tracker # Tracker ID
          GET torrents:torrent.*->torrent # Torrent ID on tracker
          GET torrents:torrent.*->magnet  # magnet link (if present)
          GET torrents:torrent.*->updated # updated time
          GET torrents:torrent.*->checked # last check time
          DESC

  List of torrents by user:
    'SET users:user.<id>:subscriptions' of ID
  Fetch: same as list of all torrents but DESC sort by title

  List of users subscribed to torrent:
    'SET torrents:torrent.<id>:subscribers' of ID
  Fetch: SORT torrents:torrent.<id>:subscribers BY no_sort
          GET users:user.*->id
          GET users:user.*->telegram  # Telegram ID
*/

module.exports = {
  users: require('./users'),
  torrents: require('./torrents'),
  queue: require('./queue')
}
