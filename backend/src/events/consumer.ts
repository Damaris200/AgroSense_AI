import { redis } from '../config/redis';
import type { StreamName } from './types';

export type MessageHandler = (id: string, fields: Record<string, string>) => Promise<void>;

/**
 * Consume messages from a Redis Stream using a consumer group.
 * Runs indefinitely; call `stop()` to exit the loop.
 */
export function createConsumer(
  stream: StreamName,
  group: string,
  consumer: string,
  handler: MessageHandler,
) {
  let running = false;

  async function ensureGroup() {
    try {
      await redis.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
    } catch (err: unknown) {
      // BUSYGROUP means the group already exists — that's fine
      if (err instanceof Error && !err.message.includes('BUSYGROUP')) throw err;
    }
  }

  async function run() {
    await ensureGroup();
    running = true;
    while (running) {
      const results = await redis.xreadgroup(
        'GROUP', group, consumer,
        'COUNT', '10',
        'BLOCK', '2000',
        'STREAMS', stream, '>',
      ) as Array<[string, Array<[string, string[]]>]> | null;

      if (!results) continue;

      for (const [, messages] of results) {
        for (const [id, rawFields] of messages) {
          const fields: Record<string, string> = {};
          for (let i = 0; i < rawFields.length; i += 2) {
            fields[rawFields[i]!] = rawFields[i + 1] ?? '';
          }
          try {
            await handler(id, fields);
            await redis.xack(stream, group, id);
          } catch (err) {
            console.error(`Failed to process message ${id}:`, err);
          }
        }
      }
    }
  }

  function stop() {
    running = false;
  }

  return { run, stop };
}
