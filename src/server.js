import app from './app.js';
import { config } from './config.js';

app.listen(config.port, () => {
  console.log(`Primo diamond selector API listening on :${config.port} (${config.provider} provider)`);
});
