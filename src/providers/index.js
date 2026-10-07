import { config } from '../config.js';
import { mockProvider } from './mock-provider.js';
import { nivodaProvider } from './nivoda-provider.js';

export function getProvider() {
  if (config.provider === 'nivoda') return nivodaProvider;
  return mockProvider;
}
