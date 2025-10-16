-- ============================================
-- Multi-Platform Enhancement Database Schema
-- ============================================
-- This SQL extends the existing database schema to support
-- multiple e-commerce platforms (Amazon, Flipkart, Myntra)
-- 
-- Run this in your Supabase SQL Editor AFTER the initial setup
-- ============================================

-- ============================================
-- 1. EXTEND POSTED_DEALS TABLE
-- ============================================
-- Add platform column to track which platform each deal is from
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posted_deals' AND column_name = 'platform'
  ) THEN
    ALTER TABLE posted_deals ADD COLUMN platform VARCHAR(20) DEFAULT 'amazon';
    CREATE INDEX IF NOT EXISTS idx_posted_deals_platform ON posted_deals(platform);
    COMMENT ON COLUMN posted_deals.platform IS 'E-commerce platform: amazon, flipkart, myntra';
  END IF;
END $$;

-- Add product_url column for direct links
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posted_deals' AND column_name = 'product_url'
  ) THEN
    ALTER TABLE posted_deals ADD COLUMN product_url TEXT;
    COMMENT ON COLUMN posted_deals.product_url IS 'Direct product URL';
  END IF;
END $$;

-- Add category column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posted_deals' AND column_name = 'category'
  ) THEN
    ALTER TABLE posted_deals ADD COLUMN category VARCHAR(100);
    CREATE INDEX IF NOT EXISTS idx_posted_deals_category ON posted_deals(category);
    COMMENT ON COLUMN posted_deals.category IS 'Product category';
  END IF;
END $$;

-- Add brand column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posted_deals' AND column_name = 'brand'
  ) THEN
    ALTER TABLE posted_deals ADD COLUMN brand VARCHAR(100);
    COMMENT ON COLUMN posted_deals.brand IS 'Product brand';
  END IF;
END $$;

-- ============================================
-- 2. CREATE PLATFORM_SETTINGS TABLE
-- ============================================
-- Stores configuration for each platform
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(20) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  posting_ratio INTEGER DEFAULT 33,
  min_discount INTEGER DEFAULT 50,
  keywords_include TEXT[] DEFAULT '{}',
  keywords_exclude TEXT[] DEFAULT '{}',
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  categories TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(50) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_settings_platform ON platform_settings(platform);
CREATE INDEX IF NOT EXISTS idx_platform_settings_enabled ON platform_settings(enabled);

-- Add comments
COMMENT ON TABLE platform_settings IS 'Configuration settings for each e-commerce platform';
COMMENT ON COLUMN platform_settings.platform IS 'Platform identifier: amazon, flipkart, myntra';
COMMENT ON COLUMN platform_settings.enabled IS 'Whether this platform is active';
COMMENT ON COLUMN platform_settings.priority IS 'Platform priority (lower = higher priority)';
COMMENT ON COLUMN platform_settings.posting_ratio IS 'Percentage of posts from this platform';
COMMENT ON COLUMN platform_settings.min_discount IS 'Minimum discount percentage for this platform';
COMMENT ON COLUMN platform_settings.keywords_include IS 'Keywords that must be present in products';
COMMENT ON COLUMN platform_settings.keywords_exclude IS 'Keywords to exclude from products';
COMMENT ON COLUMN platform_settings.price_min IS 'Minimum price filter';
COMMENT ON COLUMN platform_settings.price_max IS 'Maximum price filter';
COMMENT ON COLUMN platform_settings.categories IS 'Allowed product categories';

-- ============================================
-- 3. EXTEND BOT_ANALYTICS TABLE
-- ============================================
-- Add platform-specific metrics
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bot_analytics' AND column_name = 'platform'
  ) THEN
    ALTER TABLE bot_analytics ADD COLUMN platform VARCHAR(20);
    CREATE INDEX IF NOT EXISTS idx_bot_analytics_platform ON bot_analytics(platform);
    COMMENT ON COLUMN bot_analytics.platform IS 'Platform for these metrics (null = aggregate)';
  END IF;
END $$;

-- Add platform_metrics JSONB column for detailed stats
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bot_analytics' AND column_name = 'platform_metrics'
  ) THEN
    ALTER TABLE bot_analytics ADD COLUMN platform_metrics JSONB DEFAULT '{}';
    COMMENT ON COLUMN bot_analytics.platform_metrics IS 'Detailed platform-specific metrics in JSON format';
  END IF;
END $$;

-- ============================================
-- 4. INSERT DEFAULT PLATFORM SETTINGS
-- ============================================
-- Insert default configuration for all three platforms
INSERT INTO platform_settings (platform, enabled, priority, posting_ratio, min_discount, keywords_include, keywords_exclude, categories) VALUES
  ('amazon', true, 1, 40, 50, '{}', '{}', '{}'),
  ('flipkart', true, 2, 30, 50, '{}', '{}', '{}'),
  ('myntra', true, 3, 30, 50, '{}', '{}', '{}')
ON CONFLICT (platform) DO NOTHING;

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for platform_settings
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'Allow all operations') THEN 
    CREATE POLICY "Allow all operations" ON platform_settings FOR ALL USING (true); 
  END IF; 
END $$;

-- ============================================
-- 6. CREATE USEFUL VIEWS
-- ============================================

-- View: Platform statistics
CREATE OR REPLACE VIEW platform_stats AS
SELECT 
  p.platform,
  p.enabled,
  p.priority,
  p.posting_ratio,
  COUNT(pd.id) as total_deals_posted,
  AVG(pd.discount_percentage) as avg_discount,
  MAX(pd.posted_at) as last_posted_at
FROM platform_settings p
LEFT JOIN posted_deals pd ON p.platform = pd.platform
GROUP BY p.platform, p.enabled, p.priority, p.posting_ratio
ORDER BY p.priority;

COMMENT ON VIEW platform_stats IS 'Aggregated statistics for each platform';

-- View: Recent deals by platform
CREATE OR REPLACE VIEW recent_deals_by_platform AS
SELECT 
  platform,
  COUNT(*) as deal_count,
  AVG(discount_percentage) as avg_discount,
  MAX(posted_at) as latest_deal
FROM posted_deals
WHERE posted_at >= NOW() - INTERVAL '7 days'
GROUP BY platform
ORDER BY deal_count DESC;

COMMENT ON VIEW recent_deals_by_platform IS 'Deal statistics for the last 7 days by platform';

-- ============================================
-- 7. CREATE HELPER FUNCTIONS
-- ============================================

-- Function: Get enabled platforms
CREATE OR REPLACE FUNCTION get_enabled_platforms()
RETURNS TABLE(platform VARCHAR, priority INTEGER, posting_ratio INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT ps.platform, ps.priority, ps.posting_ratio
  FROM platform_settings ps
  WHERE ps.enabled = true
  ORDER BY ps.priority;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_enabled_platforms() IS 'Returns list of enabled platforms sorted by priority';

-- Function: Check if product already posted (platform-aware)
CREATE OR REPLACE FUNCTION is_product_posted(p_product_id VARCHAR, p_platform VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM posted_deals
  WHERE asin = p_product_id AND platform = p_platform;
  
  RETURN exists_count > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_product_posted(VARCHAR, VARCHAR) IS 'Check if a product from a specific platform has been posted';

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================

-- Check if all columns were added successfully
SELECT 
  table_name,
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('posted_deals', 'platform_settings', 'bot_analytics')
  AND column_name IN ('platform', 'product_url', 'category', 'brand', 'platform_metrics', 
                      'enabled', 'priority', 'posting_ratio', 'min_discount')
ORDER BY table_name, ordinal_position;

-- Check platform_settings table
SELECT * FROM platform_settings ORDER BY priority;

-- Check platform statistics view
SELECT * FROM platform_stats;

-- ============================================
-- 9. SAMPLE QUERIES (for testing)
-- ============================================

-- View all platform settings
-- SELECT * FROM platform_settings ORDER BY priority;

-- View deals by platform
-- SELECT platform, COUNT(*) as count FROM posted_deals GROUP BY platform;

-- View recent deals from specific platform
-- SELECT * FROM posted_deals WHERE platform = 'flipkart' ORDER BY posted_at DESC LIMIT 10;

-- Update platform settings
-- UPDATE platform_settings SET enabled = false WHERE platform = 'myntra';
-- UPDATE platform_settings SET posting_ratio = 50 WHERE platform = 'amazon';

-- Get enabled platforms
-- SELECT * FROM get_enabled_platforms();

-- Check if product is posted
-- SELECT is_product_posted('B08CFSZLQ4', 'amazon');

-- ============================================
-- Success Message
-- ============================================
SELECT '✅ Multi-platform database schema setup complete!' as status;
SELECT 'Platforms configured: Amazon, Flipkart, Myntra' as info;

