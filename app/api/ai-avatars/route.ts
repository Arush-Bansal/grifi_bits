import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const avatarsDir = path.join(process.cwd(), "public", "ai-avatars");

        if (!fs.existsSync(avatarsDir)) {
            return NextResponse.json({ avatars: [] });
        }

        const files = fs.readdirSync(avatarsDir);
        const avatars = files.filter(file => /\.(png|jpe?g|webp|gif)$/i.test(file));

        return NextResponse.json({ avatars });
    } catch (error) {
        console.error("Error reading AI avatars directory:", error);
        return NextResponse.json({ error: "Failed to load avatars" }, { status: 500 });
    }
}
