import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";
import {
  SESSION_COOKIE,
  createSessionToken,
  hashPassword,
  sessionCookieOptions,
  verifyPassword,
} from "./_core/auth";
import { ENV } from "./_core/env";
import { notifyOwner, sendEmail } from "./_core/notification";
import { sendOrderNotificationSMS } from "./_core/sms";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { toStripeProductData } from "./products";
import { storagePut } from "./storage";

const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().default("US"),
  phone: z.string().optional().default(""),
});

const productInputSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  priceCents: z.number().int().min(50),
  categoryId: z.number().int().nullable().optional(),
  inventoryCount: z.number().int().default(0),
  lowStockThreshold: z.number().int().default(5),
  isDigital: z.boolean().default(false),
  digitalFileUrl: z.string().nullable().optional(),
  imageUrls: z.array(z.string()).default([]),
  weightOz: z.number().int().nullable().optional(),
  dimensionsIn: z
    .object({ length: z.number(), width: z.number(), height: z.number() })
    .nullable()
    .optional(),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  active: z.boolean().default(true),
});

const checkoutItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
});

const categoryInputSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  sortOrder: z.number().int().default(0),
});

const discountInputSchema = z.object({
  code: z.string().min(2).max(80),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().int().min(1),
  expirationDate: z.string().optional().nullable(),
  usageLimit: z.number().int().nullable().optional(),
  minimumPurchase: z.number().int().nullable().optional(),
  active: z.boolean().default(true),
});

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function getOrigin(req: { headers: Record<string, unknown> }) {
  const origin = req.headers.origin;
  return typeof origin === "string" && origin.length > 0 ? origin : ENV.appUrl;
}

function getStripe(): Stripe | null {
  if (!ENV.stripeSecret || ENV.stripeSecret.includes("replace")) return null;
  return new Stripe(ENV.stripeSecret);
}

function genOrderNumber() {
  return `GND-${Date.now().toString().slice(-7)}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
}

async function applyDiscount(code: string | undefined, subtotal: number) {
  if (!code) return { discount: null as null | { id: number; code: string }, discountAmount: 0 };
  const record = await db.getDiscountByCode(code.trim());
  if (!record || !record.active) throw new TRPCError({ code: "BAD_REQUEST", message: "Discount code is not valid." });
  if (record.expirationDate && new Date(record.expirationDate) < new Date()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "This discount code has expired." });
  }
  if (record.usageLimit && record.usageCount >= record.usageLimit) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "This discount code has reached its limit." });
  }
  if (record.minimumPurchase && subtotal < record.minimumPurchase) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Minimum purchase of ${money(record.minimumPurchase)} required.`,
    });
  }
  let discountAmount = 0;
  if (record.type === "percentage") {
    discountAmount = Math.round((subtotal * record.value) / 100);
  } else {
    discountAmount = Math.min(record.value, subtotal);
  }
  return { discount: { id: record.id, code: record.code }, discountAmount };
}

async function buildOrder(input: {
  items: Array<{ productId: number; quantity: number }>;
  customerEmail: string;
  customerName: string;
  shippingAddress: Record<string, string>;
  userId?: number | null;
  discountCode?: string;
}) {
  const enriched = await Promise.all(
    input.items.map(async item => {
      const product = await db.getProductById(item.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: `Product ${item.productId} could not be found.` });
      if (product.inventoryCount >= 0 && product.inventoryCount < item.quantity) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `${product.name} does not have enough inventory.` });
      }
      return { product, quantity: item.quantity, totalPrice: product.priceCents * item.quantity };
    })
  );
  const subtotal = enriched.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingAmount = enriched.some(item => !item.product.isDigital) ? 895 : 0;
  const { discount, discountAmount } = await applyDiscount(input.discountCode, subtotal);
  const totalAmount = Math.max(0, subtotal + shippingAmount - discountAmount);
  const orderNumber = genOrderNumber();
  const order = await db.createOrderWithItems(
    {
      userId: input.userId ?? null,
      orderNumber,
      status: "pending",
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      totalAmount,
      taxAmount: 0,
      shippingAmount,
      discountAmount,
      discountCodeUsed: discount?.code ?? null,
      shippingAddress: input.shippingAddress,
    },
    enriched.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      priceAtPurchase: item.product.priceCents,
      totalPrice: item.totalPrice,
      isDigital: item.product.isDigital,
    }))
  );
  if (discount) await db.incrementDiscountUsage(discount.id);
  return { order, enriched, subtotal, shippingAmount, discountAmount, totalAmount, orderNumber };
}

async function notifyNewOrder(order: NonNullable<Awaited<ReturnType<typeof db.getOrderByNumber>>>) {
  const address = order.shippingAddress ?? {};
  const content = [
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customerName} <${order.customerEmail}>`,
    `Total: ${money(order.totalAmount)}`,
    `Ship to: ${address.street ?? ""}, ${address.city ?? ""}, ${address.state ?? ""} ${address.zip ?? ""}`,
    "",
    "Items:",
    ...order.items.map(item => `  ${item.quantity} × ${item.productName} (${money(item.totalPrice)})`),
  ].join("\n");
  await notifyOwner({ title: `New GameNestDesigns order ${order.orderNumber}`, content });
  await sendOrderNotificationSMS(order.orderNumber, order.customerName, order.items);

  if (order.customerEmail) {
    await sendEmail({
      to: order.customerEmail,
      subject: `Order received — ${order.orderNumber}`,
      html: `<h2>Thanks for your order!</h2>
        <p>We're getting <strong>${order.orderNumber}</strong> ready. You'll get another note when it ships.</p>
        <p><strong>Total:</strong> ${money(order.totalAmount)}</p>`,
    });
  }
}

// ====== AUTH ROUTER ======
const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8).max(200),
        firstName: z.string().optional().default(""),
        lastName: z.string().optional().default(""),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.getUserByEmail(input.email);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "An account already uses that email." });
      const passwordHash = await hashPassword(input.password);
      const user = await db.createUser({
        email: input.email,
        passwordHash,
        role: "customer",
        firstName: input.firstName,
        lastName: input.lastName,
        emailVerified: false,
      });
      await db.recordSignIn(user.id);
      const token = await createSessionToken(user.id, user.role);
      ctx.res.cookie(SESSION_COOKIE, token, sessionCookieOptions(ctx.req.protocol === "https"));
      sendEmail({
        to: input.email,
        subject: "Welcome to GameNest Designs",
        html: `<p>Welcome, ${input.firstName || "friend"}!</p><p>Your account is ready. You can sign in any time at <a href="${ENV.appUrl}/login">${ENV.appUrl}/login</a>.</p>`,
      }).catch(() => undefined);
      return { user };
    }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
      const ok = await verifyPassword(input.password, user.passwordHash);
      if (!ok) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
      await db.recordSignIn(user.id);
      const token = await createSessionToken(user.id, user.role);
      ctx.res.cookie(SESSION_COOKIE, token, sessionCookieOptions(ctx.req.protocol === "https"));
      const safe = await db.getUserById(user.id);
      return { user: safe };
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(SESSION_COOKIE, { path: "/" });
    return { success: true } as const;
  }),
  changePassword: protectedProcedure
    .input(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const full = await db.getUserByEmail(ctx.user.email);
      if (!full) throw new TRPCError({ code: "NOT_FOUND" });
      const ok = await verifyPassword(input.currentPassword, full.passwordHash);
      if (!ok) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password incorrect." });
      const passwordHash = await hashPassword(input.newPassword);
      await db.updateUser(ctx.user.id, { passwordHash });
      return { success: true } as const;
    }),
});

// ====== STOREFRONT ROUTER ======
const shopRouter = router({
  categories: publicProcedure.query(() => db.listCategories()),
  products: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          search: z.string().optional(),
          featured: z.boolean().optional(),
        })
        .optional()
    )
    .query(({ input }) => db.listProducts(input ?? {})),
  product: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const product = await db.getProductBySlug(input.slug);
    if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
    return product;
  }),
  validateDiscount: publicProcedure
    .input(z.object({ code: z.string().min(1), subtotal: z.number().int().min(0) }))
    .mutation(async ({ input }) => {
      const { discount, discountAmount } = await applyDiscount(input.code, input.subtotal);
      return { code: discount?.code ?? null, discountAmount };
    }),
  order: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(({ input }) => db.getOrderByNumber(input.orderNumber)),
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        items: z.array(checkoutItemSchema).min(1),
        customerEmail: z.string().email(),
        customerName: z.string().min(2),
        shippingAddress: addressSchema,
        discountCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const built = await buildOrder({ ...input, userId: ctx.user?.id ?? null });
      const order = built.order;
      if (!order) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const stripe = getStripe();
      if (!stripe) {
        await db.markOrderPaidByNumber(order.orderNumber, {
          stripeCheckoutSessionId: "demo",
          stripePaymentIntentId: null,
        });
        const final = await db.getOrderByNumber(order.orderNumber);
        if (final) await notifyNewOrder(final);
        return {
          checkoutUrl: `/order-confirmation/${order.orderNumber}?demo=1`,
          orderNumber: order.orderNumber,
          mode: "demo" as const,
        };
      }

      const origin = getOrigin(ctx.req);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        allow_promotion_codes: false,
        customer_email: input.customerEmail,
        client_reference_id: ctx.user?.id?.toString(),
        metadata: {
          order_number: order.orderNumber,
          user_id: ctx.user?.id?.toString() ?? "guest",
          customer_email: input.customerEmail,
          customer_name: input.customerName,
        },
        line_items: built.enriched.map(item => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.product.priceCents,
            product_data: toStripeProductData(item.product),
          },
        })),
        shipping_address_collection: { allowed_countries: ["US"] },
        success_url: `${origin}/order-confirmation/${order.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?cancelled=1`,
      });

      return {
        checkoutUrl: session.url ?? `/order-confirmation/${order.orderNumber}`,
        orderNumber: order.orderNumber,
        mode: "stripe" as const,
      };
    }),
});

// ====== CART (DB-persisted) ======
const cartRouter = router({
  get: protectedProcedure.query(({ ctx }) => db.getCart(ctx.user.id)),
  set: protectedProcedure
    .input(z.object({ items: z.array(checkoutItemSchema) }))
    .mutation(async ({ ctx, input }) => {
      await db.setCart(ctx.user.id, input.items);
      return db.getCart(ctx.user.id);
    }),
});

// ====== ACCOUNT ROUTER ======
const accountRouter = router({
  profile: protectedProcedure.query(({ ctx }) => ctx.user),
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        newsletterSubscribed: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.updateUser(ctx.user.id, input);
      return db.getUserById(ctx.user.id);
    }),
  orders: protectedProcedure.query(({ ctx }) => db.listOrdersForUser(ctx.user.id)),
  addresses: protectedProcedure.query(({ ctx }) => db.listAddresses(ctx.user.id)),
  saveAddress: protectedProcedure
    .input(addressSchema.extend({ type: z.enum(["shipping", "billing"]).default("shipping") }))
    .mutation(({ ctx, input }) => db.saveAddress({ ...input, userId: ctx.user.id })),
  deleteAddress: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => db.deleteAddress(input.id, ctx.user.id)),

  // Customer messaging
  startChat: protectedProcedure
    .input(z.object({ subject: z.string().max(200).optional(), message: z.string().min(2).max(4000) }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await db.createChatConversation({
        userId: ctx.user.id,
        customerName: `${ctx.user.firstName ?? ""} ${ctx.user.lastName ?? ""}`.trim() || ctx.user.email,
        customerEmail: ctx.user.email,
        subject: input.subject ?? null,
        message: input.message,
      });
      notifyOwner({
        title: `New chat from ${ctx.user.email}`,
        content: [`Subject: ${input.subject ?? "(none)"}`, "", input.message].join("\n"),
      }).catch(() => undefined);
      return conversation;
    }),
  sendChatMessage: protectedProcedure
    .input(z.object({ conversationId: z.number().int().positive(), message: z.string().min(1).max(4000) }))
    .mutation(async ({ ctx, input }) => {
      const thread = await db.getChatConversation(input.conversationId);
      if (!thread) throw new TRPCError({ code: "NOT_FOUND" });
      if (thread.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      await db.addChatMessage({
        conversationId: input.conversationId,
        senderRole: "customer",
        message: input.message,
      });
      return db.getChatConversation(input.conversationId);
    }),
  myChats: protectedProcedure.query(({ ctx }) => db.listChatConversations(ctx.user.id)),
  chatThread: protectedProcedure
    .input(z.object({ conversationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const thread = await db.getChatConversation(input.conversationId);
      if (!thread) throw new TRPCError({ code: "NOT_FOUND" });
      if (thread.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      return thread;
    }),
});

// ====== ADMIN ROUTER ======
const adminRouter = router({
  stats: adminProcedure.query(() => db.getAdminStats()),

  customers: adminProcedure.query(() => db.listCustomers()),
  promoteToAdmin: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => db.setUserRole(input.id, "admin")),
  demoteAdmin: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => db.setUserRole(input.id, "customer")),
  inviteAdmin: adminProcedure
    .input(z.object({ email: z.string().email(), tempPassword: z.string().min(8) }))
    .mutation(async ({ input }) => {
      const existing = await db.getUserByEmail(input.email);
      if (existing) {
        if (existing.role !== "admin") await db.setUserRole(existing.id, "admin");
        return db.getUserById(existing.id);
      }
      const passwordHash = await hashPassword(input.tempPassword);
      const user = await db.createUser({
        email: input.email,
        passwordHash,
        role: "admin",
        emailVerified: true,
      });
      sendEmail({
        to: input.email,
        subject: "You've been invited as a GameNest admin",
        html: `<p>You now have admin access at <a href="${ENV.appUrl}/admin">${ENV.appUrl}/admin</a>.</p>
          <p>Temporary password: <code>${input.tempPassword}</code> — please change it after signing in.</p>`,
      }).catch(() => undefined);
      return user;
    }),

  // Categories
  categories: adminProcedure.query(() => db.listCategories()),
  createCategory: adminProcedure.input(categoryInputSchema).mutation(({ input }) => db.createCategory(input)),
  updateCategory: adminProcedure
    .input(categoryInputSchema.partial().extend({ id: z.number().int() }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateCategory(id, data);
    }),
  deleteCategory: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(({ input }) => db.deleteCategory(input.id)),

  // Products
  products: adminProcedure.query(() => db.listProducts({ includeInactive: true })),
  createProduct: adminProcedure.input(productInputSchema).mutation(({ input }) => db.createProduct(input)),
  updateProduct: adminProcedure
    .input(productInputSchema.partial().extend({ id: z.number().int() }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateProduct(id, data);
    }),
  deactivateProduct: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(({ input }) => db.deactivateProduct(input.id)),
  deleteProduct: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(({ input }) => db.deleteProduct(input.id)),
  uploadProductImage: adminProcedure
    .input(z.object({ fileName: z.string().min(1), mimeType: z.string().min(3), dataBase64: z.string().min(10) }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.dataBase64.replace(/^data:.*;base64,/, ""), "base64");
      return storagePut(`products/${Date.now()}-${input.fileName}`, buffer, input.mimeType);
    }),

  bulkImportProducts: adminProcedure
    .input(z.array(z.object({
      name: z.string().min(1),
      description: z.string(),
      priceCents: z.number().int().min(1),
      categoryId: z.number().int().positive(),
      inventoryCount: z.number().int().min(0),
      imageUrls: z.array(z.string().url()).default([]),
      variants: z.array(z.object({
        name: z.string(),
        priceCents: z.number().int().min(1),
      })).default([]),
    })))
    .mutation(async ({ input }) => {
      const products = input.map(item => ({
        ...item,
        slug: item.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
        categoryId: item.categoryId,
        isDigital: false,
        featured: false,
        bestseller: false,
        active: true,
      }));
      return db.bulkCreateProducts(products);
    }),

  // Orders
  orders: adminProcedure.query(() => db.listAllOrders()),
  order: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .query(({ input }) => db.getOrderById(input.id)),
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "refunded", "cancelled"]),
        trackingNumber: z.string().optional(),
        shippingCarrier: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, status, ...extras } = input;
      const result = await db.updateOrderStatus(id, status, extras);
      if (status === "shipped") {
        const order = await db.getOrderById(id);
        if (order && order.customerEmail) {
          await sendEmail({
            to: order.customerEmail,
            subject: `Your order ${order.orderNumber} has shipped`,
            html: `<p>Tracking: <strong>${extras.trackingNumber ?? "—"}</strong> via ${extras.shippingCarrier ?? "carrier"}.</p>`,
          });
        }
      }
      return result;
    }),

  // Discounts
  discounts: adminProcedure.query(() => db.listDiscounts()),
  createDiscount: adminProcedure.input(discountInputSchema).mutation(({ input }) =>
    db.createDiscount({
      ...input,
      expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
    })
  ),
  updateDiscount: adminProcedure
    .input(discountInputSchema.partial().extend({ id: z.number().int() }))
    .mutation(({ input }) => {
      const { id, expirationDate, ...rest } = input;
      return db.updateDiscount(id, {
        ...rest,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      });
    }),
  deleteDiscount: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(({ input }) => db.deleteDiscount(input.id)),

  // Chats
  chats: adminProcedure.query(() => db.listChatConversations(undefined, true)),
  chatThread: adminProcedure
    .input(z.object({ conversationId: z.number().int() }))
    .query(({ input }) => db.getChatConversation(input.conversationId)),
  replyToChat: adminProcedure
    .input(z.object({ conversationId: z.number().int(), message: z.string().min(1).max(4000) }))
    .mutation(async ({ input }) => {
      await db.addChatMessage({
        conversationId: input.conversationId,
        senderRole: "owner",
        message: input.message,
      });
      const thread = await db.getChatConversation(input.conversationId);
      if (thread?.customerEmail) {
        await sendEmail({
          to: thread.customerEmail,
          subject: `Reply from GameNest Designs support`,
          html: `<p>${input.message.replace(/\n/g, "<br/>")}</p><p>You can continue the conversation in your account.</p>`,
        });
      }
      return thread;
    }),
  closeChat: adminProcedure
    .input(z.object({ conversationId: z.number().int() }))
    .mutation(({ input }) => db.closeChatConversation(input.conversationId)),
});

export const appRouter = router({
  auth: authRouter,
  shop: shopRouter,
  cart: cartRouter,
  account: accountRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
