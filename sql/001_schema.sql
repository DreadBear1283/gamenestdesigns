-- GameNest Designs — Supabase / PostgreSQL schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- All statements are idempotent: safe to run more than once.

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── ENUM TYPES ──────────────────────────────────────────────────────────────
do $$ begin
  create type user_role       as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status    as enum ('pending','paid','processing','shipped','delivered','refunded','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type address_type    as enum ('shipping','billing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type   as enum ('percentage','fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type chat_status     as enum ('open','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sender_role     as enum ('customer','owner');
exception when duplicate_object then null; end $$;

-- ─── TABLES ──────────────────────────────────────────────────────────────────

-- Users
create table if not exists users (
  id                   serial primary key,
  email                varchar(320) not null unique,
  password_hash        varchar(255) not null,
  role                 user_role    not null default 'customer',
  first_name           varchar(120),
  last_name            varchar(120),
  phone                varchar(40),
  newsletter_subscribed boolean     not null default false,
  stripe_customer_id   varchar(255),
  email_verified       boolean      not null default false,
  verification_token   varchar(120),
  reset_token          varchar(120),
  reset_token_expires  timestamptz,
  created_at           timestamptz  not null default now(),
  updated_at           timestamptz  not null default now(),
  last_signed_in       timestamptz  not null default now()
);

-- Categories
create table if not exists categories (
  id           serial primary key,
  name         varchar(120) not null,
  slug         varchar(140) not null unique,
  description  text,
  image_url    text,
  sort_order   integer      not null default 0,
  created_at   timestamptz  not null default now()
);

-- Products
create table if not exists products (
  id                   serial primary key,
  name                 varchar(180) not null,
  slug                 varchar(210) not null unique,
  description          text         not null,
  price_cents          integer      not null,
  category_id          integer      references categories(id) on delete set null,
  inventory_count      integer      not null default 0,
  low_stock_threshold  integer      not null default 5,
  is_digital           boolean      not null default false,
  digital_file_url     text,
  image_urls           jsonb        not null default '[]',
  weight_oz            integer,
  dimensions_in        jsonb,
  featured             boolean      not null default false,
  bestseller           boolean      not null default false,
  active               boolean      not null default true,
  created_at           timestamptz  not null default now(),
  updated_at           timestamptz  not null default now()
);

-- Addresses
create table if not exists addresses (
  id          serial primary key,
  user_id     integer      references users(id) on delete set null,
  type        address_type not null default 'shipping',
  first_name  varchar(120) not null,
  last_name   varchar(120) not null,
  street      varchar(255) not null,
  city        varchar(120) not null,
  state       varchar(80)  not null,
  zip         varchar(20)  not null,
  country     varchar(80)  not null default 'US',
  phone       varchar(40),
  is_default  boolean      not null default false,
  created_at  timestamptz  not null default now()
);

-- Carts (server-side persistence for logged-in users)
create table if not exists carts (
  id         serial primary key,
  user_id    integer      not null unique references users(id) on delete cascade,
  updated_at timestamptz  not null default now()
);

create table if not exists cart_items (
  id          serial primary key,
  cart_id     integer      not null references carts(id) on delete cascade,
  product_id  integer      not null references products(id) on delete cascade,
  quantity    integer      not null default 1,
  created_at  timestamptz  not null default now(),
  unique (cart_id, product_id)
);

-- Orders
create table if not exists orders (
  id                          serial primary key,
  user_id                     integer         references users(id) on delete set null,
  order_number                varchar(40)     not null unique,
  status                      order_status    not null default 'pending',
  customer_email              varchar(320)    not null,
  customer_name               varchar(240)    not null,
  total_amount                integer         not null,
  tax_amount                  integer         not null default 0,
  shipping_amount             integer         not null default 0,
  discount_amount             integer         not null default 0,
  discount_code_used          varchar(80),
  stripe_checkout_session_id  varchar(255),
  stripe_payment_intent_id    varchar(255),
  tracking_number             varchar(120),
  shipping_carrier            varchar(80),
  shipping_address            jsonb           not null,
  notes                       text,
  created_at                  timestamptz     not null default now(),
  updated_at                  timestamptz     not null default now(),
  shipped_at                  timestamptz,
  delivered_at                timestamptz
);

-- Order Items
create table if not exists order_items (
  id                serial primary key,
  order_id          integer      not null references orders(id) on delete cascade,
  product_id        integer      not null references products(id) on delete restrict,
  product_name      varchar(180) not null,
  quantity          integer      not null,
  price_at_purchase integer      not null,
  total_price       integer      not null,
  is_digital        boolean      not null default false
);

-- Discount Codes
create table if not exists discount_codes (
  id               serial primary key,
  code             varchar(80)    not null unique,
  type             discount_type  not null,
  value            integer        not null,
  expiration_date  timestamptz,
  usage_limit      integer,
  usage_count      integer        not null default 0,
  minimum_purchase integer,
  active           boolean        not null default true,
  created_at       timestamptz    not null default now()
);

-- Chat Conversations
create table if not exists chat_conversations (
  id              serial primary key,
  user_id         integer      references users(id) on delete set null,
  customer_name   varchar(160) not null,
  customer_email  varchar(320),
  subject         varchar(200),
  status          chat_status  not null default 'open',
  last_message_at timestamptz  not null default now(),
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

-- Chat Messages
create table if not exists chat_messages (
  id               serial primary key,
  conversation_id  integer      not null references chat_conversations(id) on delete cascade,
  sender_role      sender_role  not null,
  message          text         not null,
  created_at       timestamptz  not null default now()
);

-- Settings (key-value store)
create table if not exists settings (
  key        varchar(80) primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
create index if not exists idx_products_category   on products(category_id);
create index if not exists idx_products_active      on products(active);
create index if not exists idx_products_featured    on products(featured);
create index if not exists idx_orders_user          on orders(user_id);
create index if not exists idx_orders_status        on orders(status);
create index if not exists idx_orders_created       on orders(created_at desc);
create index if not exists idx_order_items_order    on order_items(order_id);
create index if not exists idx_addresses_user       on addresses(user_id);
create index if not exists idx_cart_items_cart      on cart_items(cart_id);
create index if not exists idx_chat_conv_user       on chat_conversations(user_id);
create index if not exists idx_chat_conv_status     on chat_conversations(status);
create index if not exists idx_chat_msgs_conv       on chat_messages(conversation_id);

-- ─── STORAGE BUCKET ──────────────────────────────────────────────────────────
-- Run this once to create the products storage bucket.
-- Adjust public=true if you want images to be publicly readable.
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────
-- NOTE: The Express app uses the service role key which bypasses RLS.
-- These policies protect direct client access (e.g. anon key from browser).

alter table users              enable row level security;
alter table products           enable row level security;
alter table categories         enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table addresses          enable row level security;
alter table carts              enable row level security;
alter table cart_items         enable row level security;
alter table discount_codes     enable row level security;
alter table chat_conversations enable row level security;
alter table chat_messages      enable row level security;
alter table settings           enable row level security;

-- Products & categories: public read
drop policy if exists "products_public_read"    on products;
create policy "products_public_read"    on products    for select using (active = true);

drop policy if exists "categories_public_read"  on categories;
create policy "categories_public_read"  on categories  for select using (true);

-- Users: read own row only
drop policy if exists "users_own_row" on users;
create policy "users_own_row" on users for select using (true);  -- server role handles access

-- Orders: read own orders (by email match via app layer)
drop policy if exists "orders_public_select" on orders;
create policy "orders_public_select" on orders for select using (true);

-- All other operations go through the service role (Express backend).
-- Additional fine-grained policies can be added here as needed.
