import { createClient } from "@supabase/supabase-js";

export type UploadResult = {
  storageUrl: string;
  path: string;
};

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false }
  });
}

export async function uploadToSupabaseStorage(
  fileName: string,
  fileBuffer: Buffer
): Promise<UploadResult | null> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const client = getSupabaseClient();
  if (!bucket || !client) return null;

  const path = `${Date.now()}-${fileName}`.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const { error } = await client.storage.from(bucket).upload(path, fileBuffer, {
    cacheControl: "3600",
    upsert: false,
    contentType: "video/mp4"
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return { storageUrl: data.publicUrl, path };
}
