import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

  try {
    // @ts-ignore: listModels exists internally
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" +
        process.env.NEXT_PUBLIC_GEMINI_API_KEY
    );
    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Error listing models:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
