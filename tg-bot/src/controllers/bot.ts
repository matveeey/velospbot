import { Telegraf } from 'telegraf';
import { Location, LocationData } from '../models/location';
import { MyContext } from '../types';

// Type for location message interface
interface LocationMessage {
  location: {
    latitude: number;
    longitude: number;
    heading?: number;
    live_period?: number;
  }
}

export function setupBot(bot: Telegraf<MyContext>) {
  // Welcome message handler
  bot.start((ctx) => {
    ctx.reply(
      'Привет! Я бот для отслеживания геолокации.\n\n' +
      'Чтобы воспользоваться приложением, пожалуйста, отправьте мне вашу Live Location (Живую геопозицию):\n\n' +
      '1. Нажмите на скрепку (📎) внизу слева\n' +
      '2. Выберите "Геопозиция" (📍)\n' +
      '3. Установите максимальное время и нажмите "Отправить геопозицию"\n\n' +
      'После этого вы можете открыть мини-приложение и видеть себя на карте.'
    );
  });

  // Handle incoming location
  bot.on('location', (ctx) => {
    const userId = ctx.from?.id.toString() || '';
    const message = ctx.message as unknown as LocationMessage;
    const location = message.location;
    
    const locationData: LocationData = {
      userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: undefined,
      altitude: undefined,
      speed: undefined,
      timestamp: Date.now()
    };

    // Save location to store
    Location.addLocation(locationData);

    // Different responses for regular vs live location
    if (!location.live_period) {
      ctx.reply(
        '✅ Геолокация получена (одноразово).\n\n' +
        '❗️ Рекомендуется использовать Live Location (Живую геопозицию) для автоматического обновления:\n' +
        '1. Нажмите на скрепку (📎)\n' +
        '2. Выберите "Геопозиция" (📍)\n' +
        '3. Включите "LIVE на ХХ:ХХ" внизу справа\n' +
        '4. Нажмите "Отправить геопозицию"'
      );
    } else {
      ctx.reply(
        '✅ Live Location активирована!\n\n' +
        '🔄 Ваша геопозиция будет обновляться автоматически.\n\n' +
        '📱 Теперь вы можете открыть мини-приложение для просмотра на карте.'
      );
    }
  });

  // Handle live location updates
  bot.on('edited_message', (ctx) => {
    if (ctx.editedMessage && 'location' in ctx.editedMessage) {
      const userId = ctx.from?.id.toString() || '';
      const location = ctx.editedMessage.location;
      
      const locationData: LocationData = {
        userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: undefined,
        altitude: undefined,
        speed: undefined,
        timestamp: Date.now()
      };
      
      Location.addLocation(locationData);
    }
  });

  // Help command
  bot.help((ctx) => {
    ctx.reply(
      'Как пользоваться ботом:\n\n' +
      '1. Отправьте мне вашу Live Location (Живую геопозицию)\n' +
      '2. Откройте мини-приложение, чтобы увидеть вашу позицию на карте\n\n' +
      'Команды:\n' +
      '/help - Показать эту помощь\n' +
      '/status - Проверить статус отслеживания\n' +
      '/clear - Очистить историю локаций\n\n' +
      '📍 Для точного отслеживания используйте Live Location (Живую геопозицию)'
    );
  });

  // Status command
  bot.command('status', (ctx) => {
    const userId = ctx.from?.id.toString() || '';
    const lastLocation = Location.getLastLocation(userId);

    if (lastLocation) {
      const date = new Date(lastLocation.timestamp);
      const timeSince = Math.floor((Date.now() - lastLocation.timestamp) / 1000 / 60);
      
      let message = '📍 Статус геолокации\n\n';
      message += `Последняя геопозиция получена: ${date.toLocaleString()}\n`;
      message += `(${timeSince} мин. назад)\n\n`;
      message += `Координаты: ${lastLocation.latitude}, ${lastLocation.longitude}`;
      
      ctx.reply(message);
    } else {
      ctx.reply(
        '❌ У вас еще нет сохраненной геопозиции.\n\n' +
        'Пожалуйста, отправьте Live Location (Живую геопозицию), чтобы начать отслеживание.'
      );
    }
  });

  // Clear location history command
  bot.command('clear', (ctx) => {
    const userId = ctx.from?.id.toString() || '';
    Location.clearLocationHistory(userId);
    ctx.reply('✅ История геолокаций очищена.');
  });

  // Error handler
  bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
    ctx.reply('❌ Произошла ошибка при обработке запроса.');
  });
}