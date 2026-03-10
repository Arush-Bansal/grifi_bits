import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/supabase/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadPromises = files.map((file) => uploadImage(file));
    const urls = await Promise.all(uploadPromises);
    
    const successfulUrls = urls.filter((url): url is string => url !== null);

    return NextResponse.json({ urls: successfulUrls });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload images" }, { status: 500 });
  }
}
