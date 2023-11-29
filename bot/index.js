require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Replace 'YourTelegramBotToken' with the token from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Store user configs
const userConfigs = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "🤖 If you want to create a prize for communities, send the list of communities that you own and that should participate in the form of a list where each community should start with @.");
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text.startsWith('@')) {
        const communities = msg.text.split(' ');
        if (communities.length < 1) {
            bot.sendMessage(chatId, "⚠️ Send at least 1 community that you own.");
        } else {
            userConfigs[chatId] = { communities };
            bot.sendMessage(chatId, "🚀 To start the fair giveaway, send some amount of TESTNET Optimism Sepolia ETH to the address: 0x980F5aC0Fe183479B87f78E7892f8002fB9D5401.");
        }
    } else if (msg.text.toLowerCase() === 'done') {
        bot.sendMessage(chatId, "🎉 The giveaway has ended. All coins distributed to users.");
    }
});

console.log('Bot started...');
