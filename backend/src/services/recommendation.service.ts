import { randomUUID } from 'crypto';
import axios from 'axios';
import { Prisma } from '@prisma/client';
import type { Recommendation, Urgency, RecommendationSource } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import type { WeatherData } from './weather.service';
import type { CreateRecommendationDto } from '../models/recommendation.model';

// ── Rule-based fallback ───────────────────────────────────────────────────────

interface RuleResult { action: string; urgency: Urgency; message: string }

function ruleBasedRecommendation(weather: WeatherData): RuleResult {
  if (weather.temperature < 5) {
    return { action: 'protect_frost', urgency: 'high', message: `Temperature is ${weather.temperature}°C — protect crops from frost immediately.` };
  }
  if (weather.rainfall > 20) {
    return { action: 'harvest', urgency: 'high', message: `Heavy rainfall (${weather.rainfall}mm) — harvest before waterlogging damages crops.` };
  }
  if (weather.humidity < 30 && weather.rainfall === 0) {
    return { action: 'irrigate', urgency: 'medium', message: `Low humidity (${weather.humidity}%) with no rain — irrigate to prevent drought stress.` };
  }
  if (weather.temperature >= 18 && weather.temperature <= 28 && weather.humidity >= 50) {
    return { action: 'plant', urgency: 'low', message: `Temperature and humidity are optimal (${weather.temperature}°C, ${weather.humidity}%) — good time to plant.` };
  }
  return { action: 'fertilize', urgency: 'low', message: 'Conditions are stable — a good opportunity to apply fertilizer.' };
}

// ── Gemini AI recommendation ──────────────────────────────────────────────────

async function geminiRecommendation(weather: WeatherData, cropType?: string): Promise<RuleResult> {
  if (!env.geminiApiKey) throw new Error('Gemini API key not configured');

  const prompt = `You are an expert agronomist for small-scale farmers in Cameroon.
Weather: temperature=${weather.temperature}°C, humidity=${weather.humidity}%, rainfall=${weather.rainfall}mm, condition=${weather.condition}.
${cropType ? `Crop: ${cropType}.` : ''}
Choose ONE action: irrigate, plant, fertilize, harvest, protect_frost, no_action.
Choose urgency: low, medium, high.
Reply ONLY with JSON: {"action":"<action>","urgency":"<urgency>","message":"<one practical sentence>"}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`;
  const { data } = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
  }, { timeout: 10_000 });

  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini returned unparseable response');
  return JSON.parse(match[0]) as RuleResult;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateRecommendation(
  farmId: string,
  userId: string,
  weather: WeatherData,
  cropType?: string,
  observationId?: string,
): Promise<Recommendation> {
  let result: RuleResult;
  let source: RecommendationSource = 'ai';

  try {
    result = await geminiRecommendation(weather, cropType);
  } catch {
    result = ruleBasedRecommendation(weather);
    source = 'rule';
  }

  return saveRecommendation({
    farm_id: farmId,
    observation_id: observationId,
    event_id: randomUUID(),
    action: result.action,
    urgency: result.urgency,
    message: result.message,
    source,
    context_json: { userId, cropType, weather: weather as unknown as Record<string, unknown> },
  });
}

export async function saveRecommendation(dto: CreateRecommendationDto): Promise<Recommendation> {
  const contextJson = (dto.context_json ?? {}) as Prisma.InputJsonValue;

  return prisma.recommendation.upsert({
    where: { eventId: dto.event_id },
    create: {
      farmId: dto.farm_id,
      observationId: dto.observation_id ?? null,
      eventId: dto.event_id,
      action: dto.action,
      urgency: dto.urgency as Urgency,
      message: dto.message,
      source: dto.source as RecommendationSource,
      contextJson,
    },
    update: {},   // idempotent — no-op if event_id already exists
  });
}

export async function getRecommendationsByFarm(farmId: string): Promise<Recommendation[]> {
  return prisma.recommendation.findMany({
    where: { farmId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
