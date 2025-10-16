/**
 * Telegram Bot Module
 * Handles sending formatted deal messages to Telegram channel
 */

const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');
const { formatPrice } = require('../utils/helpers');

class TelegramBotHandler {
  constructor() {
    this.bot = null;
    this.channelId = process.env.TELEGRAM_CHANNEL_ID;
  }

  /**
   * Initialize Telegram bot
   */
  initialize() {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!token) {
        throw new Error('Telegram bot token not found in environment variables');
      }

      if (!this.channelId) {
        throw new Error('Telegram channel ID not found in environment variables');
      }

      this.bot = new TelegramBot(token, { polling: false });
      logger.info('Telegram bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Telegram bot', error);
      throw error;
    }
  }

  /**
   * Format product message for Telegram
   */
  formatDealMessage(product, affiliateLink) {
    const message = `
🔥 *HUGE DISCOUNT ALERT* 🔥

🛍 *${this.escapeMarkdown(product.title)}*

💸 Original: ${formatPrice(product.originalPrice)}
🏷️ Discounted: ${formatPrice(product.currentPrice)} (*${product.discountPercentage}% OFF*)

🛒 [Buy Now](${affiliateLink})

⚡ Limited time offer! Grab it before it's gone!
    `.trim();

    return message;
  }

  /**
   * Escape special characters for Telegram Markdown
   */
  escapeMarkdown(text) {
    if (!text) return '';
    // Escape special characters for Telegram Markdown
    return text
      .replace(/\*/g, '')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`')
      .replace(/>/g, '\\>')
      .replace(/#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/-/g, '\\-')
      .replace(/=/g, '\\=')
      .replace(/\|/g, '\\|')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\./g, '\\.')
      .replace(/!/g, '\\!');
  }

  /**
   * Send deal to Telegram channel
   */
  async sendDeal(product, affiliateLink) {
    try {
      if (!this.bot) {
        throw new Error('Telegram bot not initialized');
      }

      const message = this.formatDealMessage(product, affiliateLink);

      // Send message with image if available
      if (product.imageUrl) {
        await this.bot.sendPhoto(this.channelId, product.imageUrl, {
          caption: message,
          parse_mode: 'Markdown'
        });
      } else {
        await this.bot.sendMessage(this.channelId, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        });
      }

      logger.success(`Deal posted to Telegram: ${product.title}`);
      return true;
    } catch (error) {
      logger.error('Failed to send deal to Telegram', error);
      return false;
    }
  }

  /**
   * Send multiple deals with delay to avoid rate limits
   */
  async sendMultipleDeals(products, affiliateLinks) {
    let successCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const affiliateLink = affiliateLinks[i];

      const success = await this.sendDeal(product, affiliateLink);
      if (success) {
        successCount++;
      }

      // Add delay between messages to avoid rate limits (1 message per second)
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    logger.info(`Posted ${successCount}/${products.length} deals to Telegram`);
    return successCount;
  }

  /**
   * Send multiple platform deals (products already have affiliate links)
   */
  async sendMultiplePlatformDeals(products) {
    let successCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      const success = await this.sendPlatformDeal(product);
      if (success) {
        successCount++;
      }

      // Add delay between messages to avoid rate limits (1 message per second)
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    logger.info(`Posted ${successCount}/${products.length} platform deals to Telegram`);
    return successCount;
  }

  /**
   * Send platform deal to Telegram channel (normalized product format)
   */
  async sendPlatformDeal(product) {
    try {
      if (!this.bot) {
        throw new Error('Telegram bot not initialized');
      }

      const message = this.formatPlatformDealMessage(product);

      // Send message with image if available
      if (product.imageUrl) {
        await this.bot.sendPhoto(this.channelId, product.imageUrl, {
          caption: message,
          parse_mode: 'Markdown'
        });
      } else {
        await this.bot.sendMessage(this.channelId, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        });
      }

      logger.success(`Deal posted to Telegram: ${product.title} from ${product.platform}`);
      return true;
    } catch (error) {
      logger.error('Failed to send platform deal to Telegram', error);
      return false;
    }
  }

  /**
   * Format platform deal message for Telegram
   */
  formatPlatformDealMessage(product) {
    const originalPrice = product.originalPrice.toLocaleString('en-IN');
    const currentPrice = product.currentPrice.toLocaleString('en-IN');
    const savings = (product.originalPrice - product.currentPrice).toLocaleString('en-IN');
    const discount = product.discountPercentage;

    const message = `
🔥 *HUGE DISCOUNT ALERT* 🔥

📱 *Product:* ${this.escapeMarkdown(product.title)}

💰 *PRICING DETAILS:*
   Original Price: ₹${originalPrice}
   Current Price: ₹${currentPrice}
   You Save: ₹${savings}

🎯 *DISCOUNT:* ${discount}% OFF

${product.category ? `📂 *Category:* ${this.escapeMarkdown(product.category)}\n` : ''}${product.brand ? `🏷️ *Brand:* ${this.escapeMarkdown(product.brand)}\n` : ''}
🔗 *Buy Now:* [Click Here](${product.affiliateLink})

⚡ *Limited Time Offer!* Grab it before it's gone!
    `.trim();

    return message;
  }

  /**
   * Send error notification to channel (optional)
   */
  async sendErrorNotification(errorMessage) {
    try {
      if (!this.bot) return;

      const message = `
⚠️ *Bot Error Notification*

An error occurred while fetching deals:
\`${this.escapeMarkdown(errorMessage)}\`

The bot will retry on the next scheduled run.
      `.trim();

      await this.bot.sendMessage(this.channelId, message, {
        parse_mode: 'Markdown'
      });
    } catch (error) {
      logger.error('Failed to send error notification', error);
    }
  }

  /**
   * Send startup notification
   */
  async sendStartupNotification() {
    try {
      if (!this.bot) {
        logger.warn('⚠️  Telegram bot not initialized, cannot send startup notification');
        return false;
      }

      if (!this.channelId) {
        logger.warn('⚠️  Telegram channel ID not set, cannot send startup notification');
        return false;
      }

      const message = `
🤖 *Amazon Deals Bot Started*

✅ Bot is now running and will check for deals every 2 hours.
📊 Minimum discount: ${process.env.MIN_DISCOUNT_PERCENTAGE || 50}%

Stay tuned for amazing deals! 🎉
      `.trim();

      await this.bot.sendMessage(this.channelId, message, {
        parse_mode: 'Markdown'
      });

      logger.success('✅ Startup notification sent to Telegram');
      return true;
    } catch (error) {
      logger.error('Failed to send startup notification', error);
      return false;
    }
  }
}

module.exports = new TelegramBotHandler();

