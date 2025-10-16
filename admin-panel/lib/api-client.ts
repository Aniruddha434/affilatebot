/**
 * API Client for Admin Panel
 * Handles all API requests with HMAC authentication
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const ADMIN_API_SECRET = process.env.NEXT_PUBLIC_ADMIN_API_SECRET || '';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }

    // Add request interceptor for HMAC signing
    this.client.interceptors.request.use((config) => {
      if (config.url && !config.url.includes('/admin/auth/login')) {
        this.addHmacHeaders(config);
      }
      return config;
    });
  }

  /**
   * Generate HMAC signature for admin API requests
   */
  private addHmacHeaders(config: AxiosRequestConfig): void {
    if (!ADMIN_API_SECRET) {
      console.error('ADMIN_API_SECRET not configured');
      return;
    }

    const method = config.method?.toUpperCase() || 'GET';
    const path = config.url || '';
    const timestamp = new Date().toISOString();
    
    // Calculate body SHA256
    const bodyString = config.data ? JSON.stringify(config.data) : '{}';
    const bodySha256 = CryptoJS.SHA256(bodyString).toString();

    // Create base string
    const baseString = `${method}\n${path}\n${timestamp}\n${bodySha256}`;
    
    // Generate HMAC signature
    const signature = CryptoJS.HmacSHA256(baseString, ADMIN_API_SECRET).toString();

    // Add headers
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['x-admin-timestamp'] = timestamp;
    config.headers['x-admin-signature'] = signature;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  async login(username: string, password: string) {
    const response = await this.client.post('/admin/auth/login', {
      username,
      password,
    });
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // ============================================
  // BOT CONTROL ENDPOINTS
  // ============================================

  async getBotStatus() {
    const response = await this.client.get('/admin/bot/status');
    return response.data;
  }

  async startBot() {
    const response = await this.client.post('/admin/bot/start');
    return response.data;
  }

  async stopBot() {
    const response = await this.client.post('/admin/bot/stop');
    return response.data;
  }

  async triggerJob() {
    const response = await this.client.post('/admin/trigger');
    return response.data;
  }

  // ============================================
  // CONFIGURATION ENDPOINTS
  // ============================================

  async getConfig() {
    const response = await this.client.get('/admin/config');
    return response.data;
  }

  async updateConfig(config: Record<string, any>) {
    const response = await this.client.put('/admin/config', config);
    return response.data;
  }

  // ============================================
  // STATS & ANALYTICS ENDPOINTS
  // ============================================

  async getStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  async getAnalytics(days: number = 30) {
    const response = await this.client.get('/admin/analytics', {
      params: { days },
    });
    return response.data;
  }

  // ============================================
  // DEALS ENDPOINTS
  // ============================================

  async getDeals(limit: number = 50) {
    const response = await this.client.get('/admin/deals', {
      params: { limit },
    });
    return response.data;
  }

  async deleteDeal(id: number) {
    const response = await this.client.delete(`/admin/deals/${id}`);
    return response.data;
  }

  // ============================================
  // LOGS ENDPOINTS
  // ============================================

  async getLogs(limit: number = 100, offset: number = 0, level?: string) {
    const response = await this.client.get('/admin/logs', {
      params: { limit, offset, level },
    });
    return response.data;
  }

  // ============================================
  // PLATFORM MANAGEMENT ENDPOINTS
  // ============================================

  async getPlatforms() {
    const response = await this.client.get('/admin/platforms');
    return response.data;
  }

  async getPlatformSettings(platform: string) {
    const response = await this.client.get(`/admin/platforms/${platform}`);
    return response.data;
  }

  async updatePlatformSettings(platform: string, settings: Record<string, any>) {
    const response = await this.client.put(`/admin/platforms/${platform}`, settings);
    return response.data;
  }

  async togglePlatform(platform: string, enabled: boolean) {
    const response = await this.client.post(`/admin/platforms/${platform}/toggle`, { enabled });
    return response.data;
  }

  async bulkUpdatePlatforms(platforms: Array<{ platform: string; settings: Record<string, any> }>) {
    const response = await this.client.put('/admin/platforms', { platforms });
    return response.data;
  }

  async getPlatformStats() {
    const response = await this.client.get('/admin/platforms/stats/summary');
    return response.data;
  }

  async getPlatformDeals(platform: string, limit: number = 10) {
    const response = await this.client.get(`/admin/platforms/${platform}/deals`, {
      params: { limit },
    });
    return response.data;
  }

  async triggerPlatformJob(platform: string) {
    const response = await this.client.post(`/admin/platforms/${platform}/trigger`);
    return response.data;
  }

  // ============================================
  // IMAGE MANAGEMENT ENDPOINTS
  // ============================================

  async getImageStats() {
    const response = await this.client.get('/admin/images/stats');
    return response.data;
  }

  async clearImageCache() {
    const response = await this.client.post('/admin/images/clear-cache');
    return response.data;
  }

  async validateImageUrl(url: string) {
    const response = await this.client.post('/api/images/validate', { url });
    return response.data;
  }

  getImageProxyUrl(imageUrl: string): string {
    return `${API_BASE_URL}/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
  }

  // ============================================
  // MANUAL POSTING ENDPOINT
  // ============================================

  async postManualDeal(product: any) {
    const response = await this.client.post('/admin/deals/manual', product);
    return response.data;
  }

  // ============================================
  // KEYWORD MANAGEMENT ENDPOINTS
  // ============================================

  async getKeywords() {
    const response = await this.client.get('/admin/keywords');
    return response.data;
  }

  async addKeyword(keyword: string, platform?: string) {
    const response = await this.client.post('/admin/keywords', { keyword, platform });
    return response.data;
  }

  async deleteKeyword(id: number) {
    const response = await this.client.delete(`/admin/keywords/${id}`);
    return response.data;
  }

  // ============================================
  // REAL-TIME LOGS ENDPOINT
  // ============================================

  async getRealtimeLogs(limit: number = 100, level?: string) {
    const response = await this.client.get('/admin/logs/realtime', {
      params: { limit, level },
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!localStorage.getItem('admin_token');
}
