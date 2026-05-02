-- Optional: seed a few sample products to populate the storefront.
-- Replace category IDs if your auto-increment differs — check categories table first.
-- Safe to skip if you prefer to add products through the admin dashboard.

insert into products (name, slug, description, price_cents, category_id, inventory_count, low_stock_threshold, is_digital, image_urls, weight_oz, featured, bestseller, active)
select
  'Citadel Token Vault',
  'citadel-token-vault',
  'A refined modular organizer for sprawling fantasy campaign boxes, designed with removable token trays and sleeved-card lanes.',
  4800,
  c.id,
  18,
  5,
  false,
  '["https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  22,
  true,
  true,
  true
from categories c where c.slug = 'inserts'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_cents, category_id, inventory_count, low_stock_threshold, is_digital, image_urls, weight_oz, featured, bestseller, active)
select
  'Euro Classics Insert Set',
  'euro-classics-insert-set',
  'A premium insert system for cube rails, cards, coins, and player boards — tidy setup and teardown in mind.',
  5600,
  c.id,
  7,
  6,
  false,
  '["https://images.unsplash.com/photo-1606503153255-59d8b8b82176?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  28,
  true,
  false,
  true
from categories c where c.slug = 'inserts'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_cents, category_id, inventory_count, low_stock_threshold, is_digital, image_urls, weight_oz, featured, bestseller, active)
select
  'Deluxe Card Caddy Pair',
  'deluxe-card-caddy-pair',
  'Low-profile card holders for sleeved decks, discard piles, and market rows during long strategy sessions.',
  2400,
  c.id,
  32,
  8,
  false,
  '["https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  8,
  true,
  true,
  true
from categories c where c.slug = 'component-upgrades'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_cents, category_id, inventory_count, low_stock_threshold, is_digital, digital_file_url, image_urls, weight_oz, featured, bestseller, active)
select
  'Maker STL Organizer Bundle',
  'maker-stl-organizer-bundle',
  'Instant digital files for a complete organizer system — STL and 3MF layouts ready for home printing.',
  1800,
  c.id,
  -1,
  0,
  true,
  '/downloads/maker-stl-organizer-bundle',
  '["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  null,
  false,
  true,
  true
from categories c where c.slug = 'digital-files'
on conflict (slug) do nothing;
