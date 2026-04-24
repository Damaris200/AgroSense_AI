import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function generateRecommendation(data: {
  cropType: string;
  location: string;
  weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
    description: string;
  };
  soil: {
    pH: number;
    moisture: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}): Promise<string> {

  // Use mock if API key is not set or quota is exhausted
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "mock") {
    return generateMockRecommendation(data);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const prompt = `
You are an expert agricultural advisor helping small-scale farmers in Africa.

A farmer has submitted the following data:
- Crop type: ${data.cropType}
- Location: ${data.location}
- Weather: temperature ${data.weather.temperature}°C, humidity ${data.weather.humidity}%, rainfall ${data.weather.rainfall}mm, conditions: ${data.weather.description}
- Soil: pH ${data.soil.pH}, moisture ${data.soil.moisture}%, nitrogen ${data.soil.nitrogen}mg/kg, phosphorus ${data.soil.phosphorus}mg/kg, potassium ${data.soil.potassium}mg/kg

Provide a concise practical farming recommendation (3-5 sentences) covering:
1. Whether current conditions are suitable for planting ${data.cropType}
2. One specific action the farmer should take now
3. One warning or risk to watch out for

Keep language simple and actionable.
`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    // Fall back to mock if quota exceeded
    if (err?.status === 429) {
      console.warn("[ai-service] Gemini quota exceeded, using mock recommendation");
      return generateMockRecommendation(data);
    }
    throw err;
  }
}

function generateMockRecommendation(data: {
  cropType: string;
  location: string;
  weather: { temperature: number; humidity: number; rainfall: number; description: string };
  soil: { pH: number; moisture: number; nitrogen: number; phosphorus: number; potassium: number };
}): string {
  const phStatus = data.soil.pH >= 5.5 && data.soil.pH <= 7.0 ? "suitable" : "needs adjustment";
  const weatherStatus = data.weather.temperature >= 20 && data.weather.temperature <= 35 ? "favorable" : "challenging";
  
  return `Current conditions in ${data.location} are ${weatherStatus} for growing ${data.cropType}. ` +
    `Temperature of ${data.weather.temperature}°C and humidity of ${data.weather.humidity}% provide ${weatherStatus} growing conditions. ` +
    `Your soil pH of ${data.soil.pH} is ${phStatus} for ${data.cropType} cultivation — ${phStatus === "suitable" ? "no amendments needed" : "consider adding lime to raise pH"}. ` +
    `With nitrogen levels at ${data.soil.nitrogen}mg/kg, ${data.soil.nitrogen < 100 ? "apply nitrogen-rich fertilizer before planting" : "your soil nutrients are adequate for this season"}. ` +
    `Watch for signs of waterlogging if rainfall exceeds 20mm in a single day given current soil moisture of ${data.soil.moisture}%.`;
}