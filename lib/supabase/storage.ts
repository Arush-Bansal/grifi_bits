import { createSupabaseAdmin } from "./server";

export async function uploadImage(file: File, bucket = "orbit-assets"): Promise<string | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadImageFromBase64(base64: string, bucket = "orbit-assets", contentType?: string): Promise<string | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  // 1. Extreme base64 validation
  if (!base64 || base64.length < 50) {
    console.error("[Storage] Invalid or too short base64 string provided.");
    return null;
  }

  // 2. Robustly extract the base64 data portion
  const parts = base64.split(',');
  const base64Data = parts.length > 1 ? parts[1] : parts[0];
  
  if (base64Data.length % 4 !== 0 || !/^[a-zA-Z0-9+/=]+$/.test(base64Data.slice(0, 100))) {
     // Basic sanity check on the first 100 chars
     console.warn("[Storage] Base64 data part might be corrupt or improperly stripped.");
  }

  const buffer = Buffer.from(base64Data, 'base64');
  
  // 3. Fail-safe Mime-type extraction & whitelisting
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  let mimeType = contentType?.split(';')[0]?.split(' ')[0]?.trim()?.toLowerCase();
  
  if (!mimeType) {
    const metaMatch = parts[0].match(/^data:([^;]+);base64/);
    mimeType = metaMatch ? metaMatch[1].toLowerCase() : 'image/png';
  }
  
  // Final whitelist check - if it's garbage or unsupported, default to png
  if (!allowedMimes.includes(mimeType)) {
    console.warn(`[Storage] Unsupported or invalid mime-type (${mimeType}). Falling back to image/png.`);
    mimeType = 'image/png';
  }
  
  const extension = mimeType.split('/')[1]?.split('+')[0] || 'png';
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${extension}`;
  const filePath = `generated/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}
