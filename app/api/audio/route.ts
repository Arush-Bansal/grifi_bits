import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");
  console.log("[AudioAPI] Requested path:", filePath);

  if (!filePath) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  // Security check: only allow files from temp directory
  if (!filePath.includes("orbit-gen")) {
    console.warn("[AudioAPI] Access denied for path:", filePath);
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    console.log("[AudioAPI] Serving file, size:", fileBuffer.length);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("[AudioAPI] File read error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
