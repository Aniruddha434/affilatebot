-- ============================================
-- Admin Panel Database Setup for Amazon Affiliate Bot
-- ============================================
-- This SQL file creates all necessary tables for the admin panel
-- Run this in your Supabase SQL Editor if you need to recreate the schema
-- ============================================

-- ============================================
-- 1. ADMIN USERS TABLE
-- ============================================
-- Stores admin user accounts for the management panel
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

COMMENT ON TABLE admin_users IS 'Admin users for bot management panel';
COMMENT ON COLUMN admin_users.username IS 'Unique username for admin login';
COMMENT ON COLUMN admin_users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN admin_users.email IS 'Admin email address';
COMMENT ON COLUMN admin_users.is_active IS 'Whether the admin account is active';

-- ============================================
-- 2. BOT LOGS TABLE
-- ============================================
-- Persistent storage for application logs
CREATE TABLE IF NOT EXISTS bot_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_level ON bot_logs(level);
CREATE INDEX IF NOT EXISTS idx_log_timestamp ON bot_logs(timestamp DESC);

COMMENT ON TABLE bot_logs IS 'Persistent storage for bot application logs';
COMMENT ON COLUMN bot_logs.level IS 'Log level: info, success, error, warn, debug';
COMMENT ON COLUMN bot_logs.message IS 'Log message content';
COMMENT ON COLUMN bot_logs.metadata IS 'Additional structured data in JSON format';

-- ============================================
-- 3. BOT CONFIG TABLE
-- ============================================
-- Dynamic configuration stored in database (alternative to .env)
CREATE TABLE IF NOT EXISTS bot_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_sensitive BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_config_key ON bot_config(config_key);
CREATE INDEX IF NOT EXISTS idx_config_category ON bot_config(category);

COMMENT ON TABLE bot_config IS 'Dynamic bot configuration stored in database';
COMMENT ON COLUMN bot_config.config_key IS 'Configuration key (e.g., MIN_DISCOUNT_PERCENTAGE)';
COMMENT ON COLUMN bot_config.config_value IS 'Configuration value as string';
COMMENT ON COLUMN bot_config.category IS 'Configuration category for grouping';
COMMENT ON COLUMN bot_config.is_sensitive IS 'Whether this config contains sensitive data';

-- ============================================
-- 4. BOT ANALYTICS TABLE
-- ============================================
-- Daily analytics and performance metrics
CREATE TABLE IF NOT EXISTS bot_analytics (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  deals_posted INTEGER DEFAULT 0,
  deals_found INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  api_errors INTEGER DEFAULT 0,
  telegram_posts INTEGER DEFAULT 0,
  telegram_errors INTEGER DEFAULT 0,
  uptime_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON bot_analytics(date DESC);

COMMENT ON TABLE bot_analytics IS 'Daily analytics and performance metrics for the bot';
COMMENT ON COLUMN bot_analytics.deals_posted IS 'Number of deals successfully posted';
COMMENT ON COLUMN bot_analytics.deals_found IS 'Number of deals found from Amazon API';
COMMENT ON COLUMN bot_analytics.api_calls IS 'Total Amazon API calls made';
COMMENT ON COLUMN bot_analytics.api_errors IS 'Number of API errors encountered';

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================
-- Allow service role full access to all tables
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Allow all operations') THEN 
    CREATE POLICY "Allow all operations" ON admin_users FOR ALL USING (true); 
  END IF; 
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bot_logs' AND policyname = 'Allow all operations') THEN 
    CREATE POLICY "Allow all operations" ON bot_logs FOR ALL USING (true); 
  END IF; 
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bot_config' AND policyname = 'Allow all operations') THEN 
    CREATE POLICY "Allow all operations" ON bot_config FOR ALL USING (true); 
  END IF; 
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bot_analytics' AND policyname = 'Allow all operations') THEN 
    CREATE POLICY "Allow all operations" ON bot_analytics FOR ALL USING (true); 
  END IF; 
END $$;

-- ============================================
-- 7. INSERT DEFAULT CONFIGURATION
-- ============================================
INSERT INTO bot_config (config_key, config_value, description, category, is_sensitive) VALUES
  ('MIN_DISCOUNT_PERCENTAGE', '50', 'Minimum discount percentage to post deals', 'bot_behavior', false),
  ('CRON_SCHEDULE', '0 */2 * * *', 'Cron schedule for automated job execution', 'scheduling', false),
  ('MAX_PRODUCTS_PER_RUN', '10', 'Maximum number of products to post per run', 'bot_behavior', false),
  ('AMAZON_REGION', 'IN', 'Amazon marketplace region', 'amazon', false),
  ('TELEGRAM_CHANNEL_ID', '', 'Telegram channel ID for posting deals', 'telegram', false),
  ('BOT_ENABLED', 'true', 'Whether the bot is enabled to run scheduled jobs', 'bot_control', false)
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================
-- Check if all tables were created successfully
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_name IN ('admin_users', 'bot_logs', 'bot_config', 'bot_analytics', 'posted_deals')
ORDER BY table_name;

-- Check table structures
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('admin_users', 'bot_logs', 'bot_config', 'bot_analytics')
ORDER BY table_name, ordinal_position;

-- Check indexes
SELECT 
  tablename,
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename IN ('admin_users', 'bot_logs', 'bot_config', 'bot_analytics')
ORDER BY tablename;

-- ============================================
-- 9. SAMPLE QUERIES (for testing)
-- ============================================
-- View all configuration
-- SELECT * FROM bot_config ORDER BY category, config_key;

-- View recent logs
-- SELECT * FROM bot_logs ORDER BY timestamp DESC LIMIT 50;

-- View analytics for last 7 days
-- SELECT * FROM bot_analytics WHERE date >= CURRENT_DATE - INTERVAL '7 days' ORDER BY date DESC;

-- Count admin users
-- SELECT COUNT(*) as total_admins FROM admin_users WHERE is_active = true;

-- ============================================
-- Success Message
-- ============================================
SELECT '✅ Admin panel database setup complete!' as status;

