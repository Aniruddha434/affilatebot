/**
 * Amazon Product Advertising API Module
 * Handles fetching and filtering products from Amazon PA-API
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { calculateDiscount } = require('../utils/helpers');

class AmazonAPI {
  constructor() {
    this.accessKey = process.env.AMAZON_ACCESS_KEY;
    this.secretKey = process.env.AMAZON_SECRET_KEY;
    this.partnerTag = process.env.AMAZON_PARTNER_TAG;
    this.region = process.env.AMAZON_REGION || 'IN';
    this.host = this.getHostForRegion(this.region);
    this.endpoint = `https://${this.host}/paapi5/searchitems`;
    this.minDiscount = parseInt(process.env.MIN_DISCOUNT_PERCENTAGE) || 50;
  }

  /**
   * Get API host based on region
   */
  getHostForRegion(region) {
    const hosts = {
      'US': 'webservices.amazon.com',
      'UK': 'webservices.amazon.co.uk',
      'DE': 'webservices.amazon.de',
      'FR': 'webservices.amazon.fr',
      'JP': 'webservices.amazon.co.jp',
      'CA': 'webservices.amazon.ca',
      'IN': 'webservices.amazon.in',
      'IT': 'webservices.amazon.it',
      'ES': 'webservices.amazon.es',
      'BR': 'webservices.amazon.com.br',
      'MX': 'webservices.amazon.com.mx',
      'AU': 'webservices.amazon.com.au'
    };
    return hosts[region] || hosts['IN'];
  }

  /**
   * Generate AWS Signature Version 4
   */
  generateSignature(method, path, queryString, headers, payload) {
    const dateStamp = headers['X-Amz-Date'].substring(0, 8);
    const credentialScope = `${dateStamp}/${this.region.toLowerCase()}/ProductAdvertisingAPI/aws4_request`;

    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
      .join('');
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalRequest = [
      method,
      path,
      queryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    // Create string to sign
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      headers['X-Amz-Date'],
      credentialScope,
      canonicalRequestHash
    ].join('\n');

    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.region.toLowerCase()).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    return `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  /**
   * Make signed request to Amazon PA-API
   */
  async makeRequest(payload) {
    try {
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
      
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Amz-Date': amzDate,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        'Content-Encoding': 'amz-1.0',
        'Host': this.host
      };

      const payloadString = JSON.stringify(payload);
      const authorization = this.generateSignature('POST', '/paapi5/searchitems', '', headers, payloadString);
      headers['Authorization'] = authorization;

      const response = await axios.post(this.endpoint, payloadString, { headers });
      return response.data;
    } catch (error) {
      logger.error('Amazon API request failed', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Search for products with high discounts
   */
  async searchDiscountedProducts(keywords = 'deals', maxResults = 10) {
    try {
      logger.info(`Searching for products with keyword: "${keywords}"`);

      const payload = {
        PartnerTag: this.partnerTag,
        PartnerType: 'Associates',
        Keywords: keywords,
        SearchIndex: 'All',
        ItemCount: maxResults,
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Offers.Listings.SavingBasis',
          'Offers.Listings.Availability.Message',
          'Offers.Listings.Condition'
        ]
      };

      const data = await this.makeRequest(payload);
      
      if (!data.SearchResult || !data.SearchResult.Items) {
        logger.warn('No products found in search results');
        return [];
      }

      return this.filterHighDiscountProducts(data.SearchResult.Items);
    } catch (error) {
      logger.error('Error searching for products', error);
      return [];
    }
  }

  /**
   * Filter products with high discounts
   */
  filterHighDiscountProducts(items) {
    const filteredProducts = [];

    for (const item of items) {
      try {
        const offer = item.Offers?.Listings?.[0];
        if (!offer) continue;

        // Check if in stock
        const availability = offer.Availability?.Message;
        if (!availability || !availability.toLowerCase().includes('in stock')) {
          continue;
        }

        // Get prices
        const currentPrice = offer.Price?.Amount;
        const originalPrice = offer.SavingBasis?.Amount;

        if (!currentPrice || !originalPrice) continue;

        // Calculate discount
        const discountPercentage = calculateDiscount(originalPrice, currentPrice);

        // Filter by minimum discount
        if (discountPercentage >= this.minDiscount) {
          const product = {
            asin: item.ASIN,
            title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
            currentPrice: currentPrice,
            originalPrice: originalPrice,
            discountPercentage: discountPercentage,
            imageUrl: item.Images?.Primary?.Large?.URL,
            detailPageURL: item.DetailPageURL
          };

          filteredProducts.push(product);
          logger.success(`Found deal: ${product.title} - ${discountPercentage}% OFF`);
        }
      } catch (error) {
        logger.error('Error processing item', error);
      }
    }

    logger.info(`Filtered ${filteredProducts.length} products with ${this.minDiscount}%+ discount`);
    return filteredProducts;
  }

  /**
   * Get affiliate link for product
   */
  getAffiliateLink(asin) {
    const baseUrl = this.region === 'IN' ? 'https://www.amazon.in' : 'https://www.amazon.com';
    return `${baseUrl}/dp/${asin}?tag=${this.partnerTag}`;
  }
}

module.exports = new AmazonAPI();

