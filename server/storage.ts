import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (!ENV.supabaseUrl || !ENV.supabaseServiceKey) return null;
  _supabase = createClient(ENV.supabaseUrl, ENV.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabase;
}

function normalizeKey(relKey: string) {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const supabase = getSupabase();
  const key = appendHashSuffix(normalizeKey(relKey));

  if (!supabase) {
    const dataUrl = `data:${contentType};base64,${Buffer.isBuffer(data) ? data.toString("base64") : Buffer.from(data as Uint8Array).toString("base64")}`;
    return { key, url: dataUrl };
  }

  const buffer =
    typeof data === "string" ? Buffer.from(data) : Buffer.isBuffer(data) ? data : Buffer.from(data);

  const { error } = await supabase.storage.from(ENV.supabaseStorageBucket).upload(key, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: pub } = supabase.storage.from(ENV.supabaseStorageBucket).getPublicUrl(key);
  return { key, url: pub.publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const supabase = getSupabase();
  const key = normalizeKey(relKey);
  if (!supabase) return { key, url: `/${key}` };
  const { data } = supabase.storage.from(ENV.supabaseStorageBucket).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

export async function storageGetSignedUrl(relKey: string, expiresIn = 60 * 60 * 24 * 30) {
  const supabase = getSupabase();
  const key = normalizeKey(relKey);
  if (!supabase) return `/${key}`;
  const { data, error } = await supabase.storage
    .from(ENV.supabaseStorageBucket)
    .createSignedUrl(key, expiresIn);
  if (error || !data) throw new Error(`Signed URL failed: ${error?.message ?? "unknown"}`);
  return data.signedUrl;
}
