import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { createUser, getDb, getUserByEmail, setUserRole } from "../db";
import { hashPassword } from "./auth";
import { ENV } from "./env";

export async function bootstrapAdmin(): Promise<void> {
  if (!ENV.initialAdminEmail || !ENV.initialAdminPassword) {
    console.warn("[Bootstrap] No INITIAL_ADMIN_EMAIL/PASSWORD set; skipping admin seed.");
    return;
  }
  const db = getDb();
  if (!db) {
    console.warn("[Bootstrap] DB not available; skipping admin seed.");
    return;
  }

  try {
    const email = ENV.initialAdminEmail.toLowerCase();
    const existing = await getUserByEmail(email);
    if (existing) {
      if (existing.role !== "admin") {
        await setUserRole(existing.id, "admin");
        console.log(`[Bootstrap] Promoted ${email} to admin.`);
      }
      return;
    }
    const passwordHash = await hashPassword(ENV.initialAdminPassword);
    await createUser({
      email,
      passwordHash,
      role: "admin",
      firstName: "Site",
      lastName: "Admin",
      emailVerified: true,
    });
    console.log(`[Bootstrap] Created admin user ${email}.`);
  } catch (error) {
    console.warn("[Bootstrap] Admin seed failed:", error);
  }
}
