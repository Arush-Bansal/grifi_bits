import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages,
    system: `
      You are an AI video editor for "Bits by Grifi".
      Your goal is to help users make minor modifications to their video ad projects.
      You can suggest changes to scene descriptions, background music, or the overall tone of the ad.
      Be concise, helpful, and creative.
      If the user asks for a change, acknowledge it and explain how it strengthens the ad.
    `,
  });

  return result.toTextStreamResponse();
}
