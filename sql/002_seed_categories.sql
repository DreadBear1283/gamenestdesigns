-- Seed default categories for GameNest Designs.
-- Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.

insert into categories (name, slug, description, sort_order) values
  ('Inserts',           'inserts',           'Precision organizers that keep every token, card, and miniature ready for play.',                1),
  ('Component Upgrades','component-upgrades','Premium trays, holders, and table-ready upgrades for elevated sessions.',                       2),
  ('Stickers',          'stickers',          'Tasteful labels and finishing details for game-night clarity.',                                  3),
  ('Digital Files',     'digital-files',     'Instant STL and 3MF downloads for makers who prefer to print at home.',                         4)
on conflict (slug) do nothing;
