-- Add variants column to products table for storing multiple price options
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]';

-- Example structure for variants:
-- [
--   { "name": "Standard", "priceCents": 2999 },
--   { "name": "With Kit", "priceCents": 3999 }
-- ]
