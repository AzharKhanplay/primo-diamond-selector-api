import { Router } from 'express';
import { getCache, setCache } from '../cache/memory-cache.js';
import { config } from '../config.js';
import { getProvider } from '../providers/index.js';

export const diamondsRouter = Router();

diamondsRouter.get('/filters', async (_req, res, next) => {
  try {
    const provider = getProvider();
    const cacheKey = `filters:${provider.name}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const payload = await provider.getFilters();
    setCache(cacheKey, payload, config.cacheTtlSeconds);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

diamondsRouter.get('/search', async (req, res, next) => {
  try {
    const provider = getProvider();
    const cacheKey = `search:${provider.name}:${JSON.stringify(req.query)}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const payload = await provider.search(req.query);
    setCache(cacheKey, payload, config.cacheTtlSeconds);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

diamondsRouter.get('/:id', async (req, res, next) => {
  try {
    const provider = getProvider();
    const diamond = await provider.getById(req.params.id);
    if (!diamond) {
      return res.status(404).json({ error: 'Diamond not found' });
    }
    res.json({ item: diamond });
  } catch (error) {
    next(error);
  }
});
