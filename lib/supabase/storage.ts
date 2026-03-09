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

export async function uploadImageFromBase64(base64: string, bucket = "orbit-assets"): Promise<string | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  // Remove data:image/xxx;base64, prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');
  
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.png`;
  const filePath = `generated/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: 'image/png'
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
