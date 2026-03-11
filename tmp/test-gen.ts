import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: ["A cinematic portrait of a robotic cat."],
      config: {
        responseModalities: ["IMAGE"],
        // @ts-ignore
        outputConfig: { // wait, python had image_config, let's try raw object if ts complains
            imageConfig: { aspectRatio: "9:16" }
        }
      }
    });

    // @ts-ignore
    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    console.log("Success! Base64 starts with:", base64?.substring(0, 50));
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
