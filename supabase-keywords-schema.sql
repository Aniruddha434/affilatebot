-- ============================================
-- KEYWORD MANAGEMENT SCHEMA
-- ============================================
-- This schema adds keyword management functionality
-- to the affiliate bot system

-- Create search_keywords table
CREATE TABLE IF NOT EXISTS search_keywords (
  id BIGSERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('amazon', 'flipkart', 'myntra')),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_keywords_platform ON search_keywords(platform);
CREATE INDEX IF NOT EXISTS idx_keywords_usage ON search_keywords(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_created ON search_keywords(created_at DESC);

-- Create unique constraint to prevent duplicate keywords per platform
CREATE UNIQUE INDEX IF NOT EXISTS idx_keywords_unique 
  ON search_keywords(keyword, COALESCE(platform, ''));

-- Function to increment keyword usage count
CREATE OR REPLACE FUNCTION increment_keyword_usage(keyword_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE search_keywords
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = keyword_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_keywords_updated_at
  BEFORE UPDATE ON search_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_keywords_updated_at();

-- Insert some default keywords
INSERT INTO search_keywords (keyword, platform) VALUES
  ('laptop', NULL),
  ('smartphone', NULL),
  ('headphones', NULL),
  ('smartwatch', NULL),
  ('tablet', NULL),
  ('camera', NULL),
  ('speaker', NULL),
  ('gaming', NULL),
  ('electronics', NULL),
  ('accessories', NULL)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON search_keywords TO authenticated;
-- GRANT USAGE, SELECT ON SEQUENCE search_keywords_id_seq TO authenticated;

COMMENT ON TABLE search_keywords IS 'Stores search keywords for product discovery across platforms';
COMMENT ON COLUMN search_keywords.keyword IS 'The search keyword text';
COMMENT ON COLUMN search_keywords.platform IS 'Platform-specific keyword (NULL for global keywords)';
COMMENT ON COLUMN search_keywords.usage_count IS 'Number of times this keyword has been used';

