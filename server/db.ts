import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  addresses,
  cartItems,
  carts,
  categories,
  chatConversations,
  chatMessages,
  discountCodes,
  InsertCategory,
  InsertOrder,
  InsertProduct,
  InsertUser,
  orderItems,
  orders,
  products,
  settings,
  users,
  type SafeUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (_db) return _db;
  if (!ENV.databaseUrl) {
    console.warn("[DB] DATABASE_URL is not set. The server will run in degraded mode.");
    return null;
  }
  _client = postgres(ENV.databaseUrl, {
    max: 8,
    prepare: false,
    ssl: ENV.databaseUrl.includes("localhost") ? false : "require",
  });
  _db = drizzle(_client);
  return _db;
}

const SAFE_USER_FIELDS = {
  id: users.id,
  email: users.email,
  role: users.role,
  firstName: users.firstName,
  lastName: users.lastName,
  phone: users.phone,
  newsletterSubscribed: users.newsletterSubscribed,
  stripeCustomerId: users.stripeCustomerId,
  emailVerified: users.emailVerified,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
  lastSignedIn: users.lastSignedIn,
};

// ---------- USERS ----------
export async function getUserByEmail(email: string) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<SafeUser | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select(SAFE_USER_FIELDS).from(users).where(eq(users.id, id)).limit(1);
  return (rows[0] as SafeUser) ?? null;
}

export async function createUser(data: InsertUser): Promise<SafeUser> {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db
    .insert(users)
    .values({ ...data, email: data.email.toLowerCase() })
    .returning(SAFE_USER_FIELDS);
  return rows[0] as SafeUser;
}

export async function updateUser(id: number, patch: Partial<InsertUser>): Promise<SafeUser | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .update(users)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning(SAFE_USER_FIELDS);
  return (rows[0] as SafeUser) ?? null;
}

export async function listAdmins(): Promise<SafeUser[]> {
  const db = getDb();
  if (!db) return [];
  return db.select(SAFE_USER_FIELDS).from(users).where(eq(users.role, "admin")) as Promise<SafeUser[]>;
}

export async function listCustomers(): Promise<SafeUser[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select(SAFE_USER_FIELDS)
    .from(users)
    .orderBy(desc(users.createdAt)) as Promise<SafeUser[]>;
}

export async function setUserRole(id: number, role: "customer" | "admin") {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning(SAFE_USER_FIELDS);
  return (rows[0] as SafeUser) ?? null;
}

export async function recordSignIn(id: number) {
  const db = getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ lastSignedIn: new Date(), updatedAt: new Date() })
    .where(eq(users.id, id));
}

// ---------- CATEGORIES ----------
export async function listCategories() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryById(id: number) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createCategory(data: InsertCategory) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.insert(categories).values(data).returning();
  return rows[0];
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
  return rows[0] ?? null;
}

export async function deleteCategory(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true } as const;
}

// ---------- PRODUCTS ----------
export type ProductFilters = {
  category?: string;
  search?: string;
  featured?: boolean;
  includeInactive?: boolean;
};

export async function listProducts(filters: ProductFilters = {}) {
  const db = getDb();
  if (!db) return [];

  const conditions = [];
  if (!filters.includeInactive) conditions.push(eq(products.active, true));
  if (filters.featured) conditions.push(eq(products.featured, true));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(or(ilike(products.name, q), ilike(products.description, q))!);
  }
  if (filters.category && filters.category !== "all") {
    const cat = await getCategoryBySlug(filters.category);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  return db
    .select()
    .from(products)
    .where(where as any)
    .orderBy(desc(products.featured), asc(products.name));
}

export async function getProductBySlug(slug: string) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getProductById(id: number) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createProduct(data: InsertProduct) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.insert(products).values(data).returning();
  return rows[0];
}

export async function bulkCreateProducts(items: InsertProduct[]) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  if (items.length === 0) return [];
  const rows = await db.insert(products).values(items).returning();
  return rows;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deactivateProduct(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ active: false, updatedAt: new Date() }).where(eq(products.id, id));
  return { success: true } as const;
}

export async function deleteProduct(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
  return { success: true } as const;
}

export async function decrementInventory(productId: number, quantity: number) {
  const db = getDb();
  if (!db) return;
  await db
    .update(products)
    .set({ inventoryCount: sql`${products.inventoryCount} - ${quantity}`, updatedAt: new Date() })
    .where(and(eq(products.id, productId), sql`${products.inventoryCount} >= 0`));
}

// ---------- ORDERS ----------
export async function createOrderWithItems(
  order: InsertOrder,
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    totalPrice: number;
    isDigital: boolean;
  }>
) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const orderRows = await db.insert(orders).values(order).returning();
  const created = orderRows[0];
  if (!created) throw new Error("Failed to create order");
  await db.insert(orderItems).values(items.map(item => ({ ...item, orderId: created.id })));
  return getOrderByNumber(created.orderNumber);
}

export async function getOrderByNumber(orderNumber: string) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function getOrderById(id: number) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function listOrdersForUser(userId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function listAllOrders() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(
  id: number,
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "refunded" | "cancelled",
  extras: { trackingNumber?: string; shippingCarrier?: string; notes?: string } = {}
) {
  const db = getDb();
  if (!db) return { success: false } as const;
  const patch: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === "shipped") patch.shippedAt = new Date();
  if (status === "delivered") patch.deliveredAt = new Date();
  if (extras.trackingNumber) patch.trackingNumber = extras.trackingNumber;
  if (extras.shippingCarrier) patch.shippingCarrier = extras.shippingCarrier;
  if (extras.notes) patch.notes = extras.notes;
  await db.update(orders).set(patch).where(eq(orders.id, id));
  return { success: true } as const;
}

export async function markOrderPaidByNumber(
  orderNumber: string,
  identifiers: { stripeCheckoutSessionId: string; stripePaymentIntentId: string | null }
) {
  const db = getDb();
  if (!db) return;
  await db
    .update(orders)
    .set({
      status: "paid",
      stripeCheckoutSessionId: identifiers.stripeCheckoutSessionId,
      stripePaymentIntentId: identifiers.stripePaymentIntentId,
      updatedAt: new Date(),
    })
    .where(eq(orders.orderNumber, orderNumber));

  const order = await getOrderByNumber(orderNumber);
  if (order) {
    for (const item of order.items) {
      if (!item.isDigital) await decrementInventory(item.productId, item.quantity);
    }
  }
}

// ---------- ADDRESSES ----------
export async function saveAddress(input: typeof addresses.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.insert(addresses).values(input).returning();
  return rows[0];
}

export async function listAddresses(userId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.createdAt));
}

export async function deleteAddress(id: number, userId: number) {
  const db = getDb();
  if (!db) return { success: false } as const;
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  return { success: true } as const;
}

// ---------- CART (server-side persistence for logged-in users) ----------
async function ensureCart(userId: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  const rows = await db.insert(carts).values({ userId }).returning();
  return rows[0]!;
}

export async function getCart(userId: number) {
  const db = getDb();
  if (!db) return { items: [] as Array<{ productId: number; quantity: number }> };
  const cart = await ensureCart(userId);
  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
  return { items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) };
}

export async function setCart(userId: number, items: Array<{ productId: number; quantity: number }>) {
  const db = getDb();
  if (!db) return;
  const cart = await ensureCart(userId);
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  if (items.length) {
    await db.insert(cartItems).values(items.map(i => ({ cartId: cart.id, productId: i.productId, quantity: i.quantity })));
  }
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));
}

// ---------- DISCOUNTS ----------
export async function getDiscountByCode(code: string) {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.code, code.toUpperCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function listDiscounts() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
}

export async function createDiscount(data: typeof discountCodes.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.insert(discountCodes).values({ ...data, code: data.code.toUpperCase() }).returning();
  return rows[0];
}

export async function updateDiscount(id: number, data: Partial<typeof discountCodes.$inferInsert>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  if (data.code) data.code = data.code.toUpperCase();
  const rows = await db.update(discountCodes).set(data).where(eq(discountCodes.id, id)).returning();
  return rows[0] ?? null;
}

export async function deleteDiscount(id: number) {
  const db = getDb();
  if (!db) return { success: false } as const;
  await db.delete(discountCodes).where(eq(discountCodes.id, id));
  return { success: true } as const;
}

export async function incrementDiscountUsage(id: number) {
  const db = getDb();
  if (!db) return;
  await db
    .update(discountCodes)
    .set({ usageCount: sql`${discountCodes.usageCount} + 1` })
    .where(eq(discountCodes.id, id));
}

// ---------- CHAT ----------
export async function createChatConversation(input: {
  userId?: number | null;
  customerName: string;
  customerEmail?: string | null;
  subject?: string | null;
  message: string;
}) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db
    .insert(chatConversations)
    .values({
      userId: input.userId ?? null,
      customerName: input.customerName,
      customerEmail: input.customerEmail ?? null,
      subject: input.subject ?? null,
    })
    .returning();
  const conversation = rows[0]!;
  await db.insert(chatMessages).values({
    conversationId: conversation.id,
    senderRole: "customer",
    message: input.message,
  });
  return getChatConversation(conversation.id);
}

export async function addChatMessage(input: {
  conversationId: number;
  senderRole: "customer" | "owner";
  message: string;
}) {
  const db = getDb();
  if (!db) return;
  await db.insert(chatMessages).values(input);
  await db
    .update(chatConversations)
    .set({ lastMessageAt: new Date(), updatedAt: new Date(), status: "open" })
    .where(eq(chatConversations.id, input.conversationId));
}

export async function getChatConversation(conversationId: number) {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.id, conversationId))
    .limit(1);
  const conversation = rows[0];
  if (!conversation) return null;
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt));
  return { ...conversation, messages };
}

export async function listChatConversations(userId?: number, includeAll = false) {
  const db = getDb();
  if (!db) return [];
  if (includeAll) return db.select().from(chatConversations).orderBy(desc(chatConversations.lastMessageAt));
  if (!userId) return [];
  return db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.userId, userId))
    .orderBy(desc(chatConversations.lastMessageAt));
}

export async function closeChatConversation(conversationId: number) {
  const db = getDb();
  if (!db) return;
  await db
    .update(chatConversations)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(chatConversations.id, conversationId));
}

// ---------- ADMIN STATS ----------
export async function getAdminStats() {
  const db = getDb();
  if (!db) return { revenueCents: 0, orders: 0, customers: 0, lowStock: 0, openChats: 0 };
  const [orderStats] = await db
    .select({
      revenueCents: sql<number>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.status} not in ('cancelled', 'refunded')), 0)`,
      orders: sql<number>`count(*)`,
    })
    .from(orders);
  const [customerStats] = await db
    .select({ customers: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "customer"));
  const [lowStockStats] = await db
    .select({ lowStock: sql<number>`count(*)` })
    .from(products)
    .where(and(sql`${products.inventoryCount} >= 0`, sql`${products.inventoryCount} <= ${products.lowStockThreshold}`));
  const [chatStats] = await db
    .select({ openChats: sql<number>`count(*)` })
    .from(chatConversations)
    .where(eq(chatConversations.status, "open"));
  return {
    revenueCents: Number(orderStats?.revenueCents ?? 0),
    orders: Number(orderStats?.orders ?? 0),
    customers: Number(customerStats?.customers ?? 0),
    lowStock: Number(lowStockStats?.lowStock ?? 0),
    openChats: Number(chatStats?.openChats ?? 0),
  };
}

// ---------- SETTINGS ----------
export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return (rows[0]?.value as T) ?? null;
}

export async function setSetting(key: string, value: unknown) {
  const db = getDb();
  if (!db) return;
  await db
    .insert(settings)
    .values({ key, value: value as any })
    .onConflictDoUpdate({ target: settings.key, set: { value: value as any, updatedAt: new Date() } });
}
