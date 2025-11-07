// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // ✅ Validate input
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // ✅ Load API key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing Gemini API key in environment");
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    // ✅ Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ Use the latest, stable and supported model
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    // ✅ Generate response
    const result = await model.generateContent(prompt);

    // Gemini SDK responses sometimes vary — ensure text extraction is safe
    const text =
      result?.response?.text?.() ||
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Empty response from Gemini.";

    return NextResponse.json({ text: text.trim() });
  } catch (err: any) {
    console.error("⚠️ Gemini API Error:", err);

    return NextResponse.json(
      { error: err.message || "Error generating AI response." },
      { status: 500 }
    );
  }
}
