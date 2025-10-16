/**
 * TypeScript type definitions for Admin Panel
 */

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface BotStatus {
  is_running: boolean;
  uptime_seconds: number;
  cron_schedule: string;
  next_run: string | null;
  posted_deals_total: number;
  channel: string | null;
  min_discount: number;
  max_products_per_run: number;
  amazon_region: string;
  node_version: string;
  memory_usage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

export interface BotConfig {
  min_discount_percentage: number;
  cron_schedule: string;
  max_products_per_run: number;
  default_region: string;
  source: string;
  supabase_mode: string;
}

export interface BotStats {
  posted_deals_total: number;
  is_running: boolean;
  cron_schedule: string;
  channel: string | null;
  min_discount_percentage: number;
}

export interface Deal {
  id: number;
  asin: string;
  title: string;
  discount_percentage: number;
  posted_at: string;
  created_at: string;
}

export interface DealsResponse {
  items: Deal[];
  limit: number;
}

export interface LogEntry {
  id: number;
  level: string;
  message: string;
  metadata: any;
  timestamp: string;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface AnalyticsSummary {
  total_deals_posted: number;
  total_deals_found: number;
  total_api_calls: number;
  total_api_errors: number;
  total_telegram_posts: number;
  total_telegram_errors: number;
  avg_deals_per_day: number;
  success_rate: number;
  days_analyzed: number;
}

export interface DailyAnalytics {
  id: number;
  date: string;
  deals_posted: number;
  deals_found: number;
  api_calls: number;
  api_errors: number;
  telegram_posts: number;
  telegram_errors: number;
  uptime_seconds: number;
  created_at: string;
}

