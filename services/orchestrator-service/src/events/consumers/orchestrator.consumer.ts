import { consumer } from '../../config/kafka';
import { initState, setWeather, setSoil, isReady, getState, clearState } from '../../state/analysis.state';
import { publishAnalysisReady } from '../producers/analysis-ready.producer';

const TOPICS = ['farm.saved', 'weather.fetched', 'soil.analyzed'];

export async function startOrchestratorConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topics: TOPICS, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error(`[orchestrator] malformed JSON on ${topic}`);
        return;
      }

      try {
        if (topic === 'farm.saved') {
          initState(data.submissionId, {
            farmId:      data.farmId,
            submissionId: data.submissionId,
            userId:      data.userId,
            userEmail:   data.userEmail,
            userName:    data.userName,
            cropType:    data.cropType,
            location:    data.location,
            gpsLat:      data.gpsLat,
            gpsLng:      data.gpsLng,
          });
        }

        if (topic === 'weather.fetched') {
          initState(data.submissionId, {
            farmId:      data.farmId,
            submissionId: data.submissionId,
            userId:      data.userId,
            userEmail:   data.userEmail,
            userName:    data.userName,
            cropType:    data.cropType  ?? 'unknown',
            location:    data.location  ?? 'unknown',
            gpsLat:      data.gpsLat    ?? 0,
            gpsLng:      data.gpsLng    ?? 0,
          });
          setWeather(data.submissionId, {
            temperature: data.temperature,
            humidity:    data.humidity,
            rainfall:    data.rainfall,
            description: data.description,
          });
        }

        if (topic === 'soil.analyzed') {
          initState(data.submissionId, {
            farmId:      data.farmId,
            submissionId: data.submissionId,
            userId:      data.userId,
            userEmail:   data.userEmail,
            userName:    data.userName,
            cropType:    data.cropType  ?? 'unknown',
            location:    data.location  ?? 'unknown',
            gpsLat:      data.gpsLat    ?? 0,
            gpsLng:      data.gpsLng    ?? 0,
          });
          setSoil(data.submissionId, {
            pH:         data.pH,
            moisture:   data.moisture,
            nitrogen:   data.nitrogen,
            phosphorus: data.phosphorus,
            potassium:  data.potassium,
          });
        }

        if (isReady(data.submissionId)) {
          const s = getState(data.submissionId)!;
          await publishAnalysisReady({
            submissionId: s.submissionId,
            farmId:       s.farmId,
            userId:       s.userId   ?? 'anonymous',
            userEmail:    s.userEmail ?? '',
            userName:     s.userName  ?? '',
            cropType:     s.cropType,
            location:     s.location,
            gpsLat:       s.gpsLat,
            gpsLng:       s.gpsLng,
            weather:      s.weather,
            soil:         s.soil,
            readyAt:      new Date().toISOString(),
          });
          clearState(s.submissionId);
        }
      } catch (err) {
        console.error(`[orchestrator] error processing ${topic}:`, err);
      }
    },
  });
}
