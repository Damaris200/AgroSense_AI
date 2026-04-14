import { env } from './config/env';
import { createApp } from './app';

const app = createApp();

app.listen(env.port, () => {
  console.log(`[auth-service] running on port ${env.port} [${env.nodeEnv}]`);
});
