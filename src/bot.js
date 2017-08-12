const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: true
})
const handlers = require('./handlers')

bot.onText(/\/start/, handlers.help(bot))
bot.onText(/\/help/, handlers.help(bot))
bot.onText(/\/add (.*)/, handlers.add(bot))
bot.onText(/\/remove (.*)/, handlers.remove(bot))
bot.onText(/\/list/, handlers.list(bot))

module.exports = bot
