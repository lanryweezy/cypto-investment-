import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default async (req: Request) => {
  if (!ai) {
    return new Response(JSON.stringify({ error: "AI service is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { prompt, model: modelName = 'gemini-1.5-flash', json = false } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const model = ai.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: json ? "application/json" : "text/plain",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (json) {
      const jsonResponse = JSON.parse(text);
      return new Response(JSON.stringify(jsonResponse), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
