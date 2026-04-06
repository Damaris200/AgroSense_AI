import { redis } from '../config/redis';
import type { AgroEvent, StreamName } from './types';

/**
 * Publish an event to a Redis Stream.
 * Returns the entry ID assigned by Redis.
 */
export async function publish(stream: StreamName, event: AgroEvent): Promise<string> {
  const fields: string[] = [];
  for (const [key, value] of Object.entries(event)) {
    fields.push(key, String(value));
  }
  const id = await redis.xadd(stream, '*', ...fields);
  if (!id) throw new Error(`Failed to publish event to stream ${stream}`);
  return id;
}
