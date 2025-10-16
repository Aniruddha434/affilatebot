-- ============================================
-- Supabase Database Setup for Amazon Affiliate Bot
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================

-- Create the posted_deals table
CREATE TABLE IF NOT EXISTS posted_deals (
  id SERIAL PRIMARY KEY,
  asin VARCHAR(20) UNIQUE NOT NULL,
  title TEXT,
  discount_percentage INTEGER,
  posted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_asin ON posted_deals(asin);
CREATE INDEX IF NOT EXISTS idx_posted_at ON posted_deals(posted_at);
CREATE INDEX IF NOT EXISTS idx_discount ON posted_deals(discount_percentage);

-- Add comments for documentation
COMMENT ON TABLE posted_deals IS 'Tracks all Amazon deals posted to Telegram to prevent duplicates';
COMMENT ON COLUMN posted_deals.asin IS 'Amazon Standard Identification Number (unique product ID)';
COMMENT ON COLUMN posted_deals.title IS 'Product title at time of posting';
COMMENT ON COLUMN posted_deals.discount_percentage IS 'Discount percentage when posted';
COMMENT ON COLUMN posted_deals.posted_at IS 'Timestamp when deal was posted to Telegram';
COMMENT ON COLUMN posted_deals.created_at IS 'Timestamp when record was created in database';

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE posted_deals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access" ON posted_deals
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create policy to allow anon key to read and insert (needed for bot)
CREATE POLICY "Allow bot operations" ON posted_deals
  FOR ALL
  USING (true);

-- ============================================
-- Verification Queries
-- ============================================

-- Check if table was created successfully
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_name = 'posted_deals';

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posted_deals'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'posted_deals';

-- ============================================
-- Sample Queries (for testing)
-- ============================================

-- View all posted deals
-- SELECT * FROM posted_deals ORDER BY posted_at DESC LIMIT 10;

-- Count total posted deals
-- SELECT COUNT(*) as total_deals FROM posted_deals;

-- View deals by discount percentage
-- SELECT * FROM posted_deals WHERE discount_percentage >= 70 ORDER BY posted_at DESC;

-- Delete old deals (older than 30 days)
-- DELETE FROM posted_deals WHERE posted_at < NOW() - INTERVAL '30 days';

-- Clear all data (use with caution!)
-- TRUNCATE TABLE posted_deals;

-- ============================================
-- Success Message
-- ============================================
SELECT '✅ Database setup complete! Your bot is ready to use.' as status;

