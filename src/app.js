import cors from 'cors';
import express from 'express';
import { config, isAllowedCorsOrigin } from './config.js';
import { diamondsRouter } from './routes/diamonds.js';
import { getProvider } from './providers/index.js';
import { nivodaProvider } from './providers/nivoda-provider.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);

app.get('/health', (_req, res) => {
  const provider = getProvider();
  res.json({
    ok: true,
    provider: provider.name,
    nivoda: nivodaProvider.getStatus(),
  });
});

app.use('/api/diamonds', diamondsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) {
    console.error('[primo-diamond-selector-api]', error.message);
  }
  res.status(status).json({
    error: error.message || 'Unexpected error',
    code: error.code || 'INTERNAL_ERROR',
  });
});

export default app;
