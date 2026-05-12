import OpenAI from "openai";

const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const openAiKey   = process.env.OPENAI_API_KEY ?? "";

const client = openAiKey && openAiKey !== "mock" ? new OpenAI({ apiKey: openAiKey }) : null;

export function getOpenAiModel(): string {
  return openAiModel;
}

export interface RecommendationInput {
  cropType: string;
  location: string;
  weather: {
    temperature: number;
    humidity:    number;
    rainfall:    number;
    windSpeed?:  number;
    description: string;
  };
  soil: {
    pH:         number;
    moisture:   number;
    nitrogen:   number;
    phosphorus: number;
    potassium:  number;
  };
}

export async function generateRecommendation(data: RecommendationInput): Promise<string> {
  if (!client) {
    return generateMockRecommendation(data);
  }

  const windLine = data.weather.windSpeed !== undefined
    ? `, wind ${data.weather.windSpeed.toFixed(1)} m/s`
    : '';

  const prompt =
`You are an expert agricultural advisor helping small-scale farmers in Africa.

Farm data:
- Crop: ${data.cropType}
- Location: ${data.location}
- Weather: ${data.weather.temperature}°C, humidity ${data.weather.humidity}%, rainfall ${data.weather.rainfall} mm/h${windLine}, conditions: ${data.weather.description}
- Soil: pH ${data.soil.pH}, moisture ${data.soil.moisture}%, N ${data.soil.nitrogen} mg/kg, P ${data.soil.phosphorus} mg/kg, K ${data.soil.potassium} mg/kg

Give a concise practical recommendation (3-5 sentences):
1. Are current conditions suitable for ${data.cropType}?
2. One specific action the farmer should take now.
3. One risk or warning to watch for.

Use simple, actionable language.`;

  try {
    const response = await client.chat.completions.create({
      model: openAiModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content?.trim() || generateMockRecommendation(data);
  } catch (err: any) {
    if (err?.status === 429 || err?.status === 402) {
      console.warn("[ai-service] OpenAI quota exceeded — using mock recommendation");
      return generateMockRecommendation(data);
    }
    throw err;
  }
}

function generateMockRecommendation(data: RecommendationInput): string {
  const phOk      = data.soil.pH >= 5.5 && data.soil.pH <= 7.0;
  const tempOk    = data.weather.temperature >= 18 && data.weather.temperature <= 35;
  const lowN      = data.soil.nitrogen < 100;
  const highRain  = data.weather.rainfall > 20;

  return (
    `Current conditions in ${data.location} are ${tempOk ? 'favourable' : 'challenging'} for growing ${data.cropType} — ` +
    `temperature is ${data.weather.temperature}°C with ${data.weather.humidity}% humidity and ${data.weather.description}. ` +
    `Your soil pH of ${data.soil.pH} is ${phOk ? 'within the ideal range' : 'outside the ideal 5.5–7.0 range; consider lime amendment to correct it'}. ` +
    (lowN
      ? `Nitrogen levels are low at ${data.soil.nitrogen} mg/kg — apply a nitrogen-rich fertiliser before planting. `
      : `Soil nutrient levels (N: ${data.soil.nitrogen}, P: ${data.soil.phosphorus}, K: ${data.soil.potassium} mg/kg) are adequate for this season. `) +
    (highRain
      ? `Watch for waterlogging: rainfall intensity is high; ensure proper drainage to protect root health.`
      : `Monitor soil moisture regularly and irrigate if it drops below 30% to maintain steady crop growth.`)
  );
}
