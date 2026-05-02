import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse } from "cookie";
import type { SafeUser } from "../../drizzle/schema";
import { getUserById } from "../db";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: SafeUser | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: SafeUser | null = null;

  try {
    const cookieHeader = opts.req.headers.cookie ?? "";
    const cookies = parse(cookieHeader);
    const token = cookies[SESSION_COOKIE];
    if (token) {
      const payload = await verifySessionToken(token);
      if (payload) {
        user = await getUserById(payload.userId);
      }
    }
  } catch {
    user = null;
  }

  return { req: opts.req, res: opts.res, user };
}
