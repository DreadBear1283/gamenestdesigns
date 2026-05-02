function required(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export const ENV = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),

  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseStorageBucket: required("SUPABASE_STORAGE_BUCKET", "products"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),

  stripeSecret: required("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: required("STRIPE_WEBHOOK_SECRET"),
  stripePublishableKey: required("STRIPE_PUBLISHABLE_KEY"),

  initialAdminEmail: required("INITIAL_ADMIN_EMAIL"),
  initialAdminPassword: required("INITIAL_ADMIN_PASSWORD"),

  ownerEmail: required("OWNER_NOTIFICATION_EMAIL"),
  emailFrom: required("EMAIL_FROM", "GameNest Designs <hello@example.com>"),
  resendApiKey: required("RESEND_API_KEY"),

  twilioAccountSid: required("TWILIO_ACCOUNT_SID"),
  twilioAuthToken: required("TWILIO_AUTH_TOKEN"),
  twilioPhoneNumber: required("TWILIO_PHONE_NUMBER"),
  ownerPhoneNumber: required("OWNER_PHONE_NUMBER"),

  etsyShopId: required("ETSY_SHOP_ID", ""),
  etsyApiKey: required("ETSY_API_KEY", ""),

  appUrl: required("APP_URL", "http://localhost:3000"),
  port: parseInt(required("PORT", "3000")),
  isProduction: process.env.NODE_ENV === "production",
};

export function envSummary() {
  return {
    db: !!ENV.databaseUrl,
    supabase: !!ENV.supabaseUrl && !!ENV.supabaseServiceKey,
    stripe: !!ENV.stripeSecret,
    resend: !!ENV.resendApiKey,
    initialAdmin: !!ENV.initialAdminEmail && !!ENV.initialAdminPassword,
  };
}
