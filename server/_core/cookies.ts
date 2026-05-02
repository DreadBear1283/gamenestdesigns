import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const list = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return list.some(p => p.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: Request): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
