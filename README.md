# Torrent trackers monitoring bot

## Bot commands

```
/add <url> — Add torrent
/remove <url> — Remove torrent
/list — List all torrents
```

## Usage with `docker-compose`

Create `docker-compose.yml`:

```
version: '3'
services:
  redis:
    image: redis:4-alpine
    volumes:
      - ./data/redis:/data
  bot:
    image: asdf404/torrent-trackers-monitoring-bot:latest
    environment:
      REDIS_URL: redis://redis
      # bot token
      TELEGRAM_TOKEN: <TELEGRAM_TOKEN_HERE>
      # check torrent one time per day
      TORRENT_CHECK_INTERVAL: 1d
```

And start it:

```
$ docker-compose up -d
```

## License

WTFPL
