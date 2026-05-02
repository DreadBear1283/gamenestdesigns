import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { createServer } from "http";
import Stripe from "stripe";
import * as db from "../db";
import { appRouter } from "../routers";
import { bootstrapAdmin } from "./bootstrap";
import { createContext } from "./context";
import { ENV, envSummary } from "./env";
import { notifyOwner } from "./notification";
import { serveStatic, setupVite } from "./vite";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

async function notifyPaidOrder(orderNumber: string) {
  const order = await db.getOrderByNumber(orderNumber);
  if (!order) return;
  const address = order.shippingAddress ?? {};
  const content = [
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customerName} <${order.customerEmail}>`,
    `Total: ${formatCurrency(Number(order.totalAmount ?? 0))}`,
    `Ship to: ${address.street ?? ""}, ${address.city ?? ""}, ${address.state ?? ""} ${address.zip ?? ""}`,
    "",
    "Items:",
    ...(order.items ?? []).map(
      item => `  ${item.quantity} × ${item.productName} (${formatCurrency(Number(item.totalPrice ?? 0))})`
    ),
  ].join("\n");
  await notifyOwner({ title: `Paid order ${order.orderNumber}`, content }).catch(error => {
    console.warn("[Stripe] Owner notify after paid order:", error);
  });
}

function registerStripeWebhook(app: express.Express) {
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    if (!ENV.stripeSecret || !ENV.stripeWebhookSecret) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const stripe = new Stripe(ENV.stripeSecret);
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      return res.status(400).json({ error: "Missing Stripe signature" });
    }
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, ENV.stripeWebhookSecret);
    } catch (error) {
      console.error("[Stripe] Webhook signature failed:", error);
      return res.status(400).json({ error: "Invalid signature" });
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.order_number;
      if (orderNumber) {
        await db.markOrderPaidByNumber(orderNumber, {
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        });
        await notifyPaidOrder(orderNumber);
      }
    }
    return res.json({ received: true });
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", true);
  registerStripeWebhook(app);
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  app.get("/api/health", (_req, res) => res.json({ ok: true, env: envSummary() }));

  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  await bootstrapAdmin();

  const port = ENV.port || 3000;
  server.listen(port, () => {
    console.log(`GameNest Designs server listening on http://localhost:${port}`);
    console.log("[env]", envSummary());
  });
}

startServer().catch(error => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
