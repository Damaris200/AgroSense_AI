import { env } from './config/env';
import { createApp } from './app';

const app = createApp();

app.listen(env.port, () => {
  console.log(`AgroSense backend running on port ${env.port} [${env.nodeEnv}]`);
});
