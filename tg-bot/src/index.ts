import { Telegraf } from 'telegraf';
import express from 'express';
import dotenv from 'dotenv';
import { Location } from './models/location';
import { setupBot } from './controllers/bot';
import { setupLocationApi } from './controllers/location-api';
import { MyContext } from './types';

// Load environment variables
dotenv.config();

// Get bot token from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not set in .env file');
  process.exit(1);
}

// Initialize bot
const bot = new Telegraf<MyContext>(BOT_TOKEN);

// Configure Express server
const app = express();
app.use(express.json());

// Set up bot handlers
setupBot(bot);

// Set up API endpoints
setupLocationApi(app);

// Start web server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

// Launch bot
bot.launch().then(() => {
  console.log('Bot started');
}).catch((err) => {
  console.error('Error starting bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));