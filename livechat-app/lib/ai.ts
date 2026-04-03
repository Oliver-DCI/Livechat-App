// lib/ai.ts
export async function analyzeImage(imageUrl: string) {
  try {
    // Falls kein Token vorhanden ist, geben wir einen Standardwert zurück
    if (!process.env.HUGGINGFACE_API_KEY) return null;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
        method: "POST",
        body: JSON.stringify({ inputs: imageUrl }),
      }
    );

    const result = await response.json();
    // Das Modell gibt ein Array zurück: [{ generated_text: "..." }]
    return result[0]?.generated_text || null;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}