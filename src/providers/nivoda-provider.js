import { config, isNivodaConfigured } from '../config.js';

/**
 * Nivoda integration placeholder.
 * Implement authentication + endpoints here once official Nivoda API docs
 * and sandbox/live credentials are available in environment variables.
 */
export const nivodaProvider = {
  name: 'nivoda',

  assertConfigured() {
    if (!isNivodaConfigured()) {
      const error = new Error(
        'Nivoda provider is not configured. Set NIVODA_API_URL and credentials in environment variables.'
      );
      error.status = 503;
      error.code = 'NIVODA_NOT_CONFIGURED';
      throw error;
    }
  },

  async getFilters() {
    this.assertConfigured();
    throw new Error('Nivoda getFilters is not implemented yet. Awaiting API documentation.');
  },

  async search() {
    this.assertConfigured();
    throw new Error('Nivoda search is not implemented yet. Awaiting API documentation.');
  },

  async getById() {
    this.assertConfigured();
    throw new Error('Nivoda getById is not implemented yet. Awaiting API documentation.');
  },

  /** @returns {object} Non-secret config snapshot for health checks */
  getStatus() {
    return {
      configured: isNivodaConfigured(),
      apiUrl: config.nivoda.apiUrl ? '[set]' : '[missing]',
      auth: config.nivoda.apiKey ? 'api_key' : config.nivoda.clientId ? 'client_credentials' : 'missing',
    };
  },
};
