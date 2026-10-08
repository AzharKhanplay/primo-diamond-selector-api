import { config, isNivodaConfigured } from '../config.js';
import { nivodaGraphql } from '../nivoda/client.js';
import { DIAMONDS_BY_QUERY } from '../nivoda/queries.js';
import {
  buildNivodaOrder,
  buildNivodaQuery,
  normalizeNivodaItem,
} from '../nivoda/normalize.js';

const SHAPES = ['Round', 'Oval', 'Cushion', 'Emerald', 'Pear', 'Princess', 'Marquise', 'Radiant', 'Asscher', 'Heart'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
const CLARITIES = ['IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1'];
const CUTS = ['Excellent', 'Very Good', 'Good'];
const LABS = ['GIA', 'IGI'];

export const nivodaProvider = {
  name: 'nivoda',

  assertConfigured() {
    if (!isNivodaConfigured()) {
      const error = new Error(
        'Nivoda provider is not configured. Set NIVODA_API_URL, NIVODA_USERNAME, and NIVODA_PASSWORD.'
      );
      error.status = 503;
      error.code = 'NIVODA_NOT_CONFIGURED';
      throw error;
    }
  },

  async getFilters() {
    this.assertConfigured();
    return {
      provider: 'nivoda',
      filters: [
        { key: 'shape', label: 'Shape', type: 'multi', options: SHAPES.map((value) => ({ value: value.toUpperCase(), label: value })) },
        {
          key: 'type',
          label: 'Diamond type',
          type: 'single',
          options: [
            { value: 'natural', label: 'Natural' },
            { value: 'lab', label: 'Lab-grown' },
          ],
        },
        { key: 'carat_min', label: 'Min carat', type: 'number', min: 0.3, max: 10, step: 0.01 },
        { key: 'carat_max', label: 'Max carat', type: 'number', min: 0.3, max: 10, step: 0.01 },
        { key: 'color', label: 'Colour', type: 'multi', options: COLORS.map((value) => ({ value, label: value })) },
        { key: 'clarity', label: 'Clarity', type: 'multi', options: CLARITIES.map((value) => ({ value, label: value })) },
        { key: 'cut', label: 'Cut', type: 'multi', options: CUTS.map((value) => ({ value, label: value })) },
        { key: 'lab', label: 'Certification', type: 'multi', options: LABS.map((value) => ({ value, label: value })) },
        { key: 'available', label: 'Availability', type: 'boolean' },
      ],
      sort: [
        { value: 'price_asc', label: 'Price: low to high' },
        { value: 'price_desc', label: 'Price: high to low' },
        { value: 'carat_desc', label: 'Carat: high to low' },
      ],
    };
  },

  async search(params = {}) {
    this.assertConfigured();

    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(24, Math.max(1, Number(params.limit || 12)));
    const offset = (page - 1) * limit;

    const data = await nivodaGraphql(DIAMONDS_BY_QUERY, {
      query: buildNivodaQuery(params),
      offset,
      limit,
      order: buildNivodaOrder(params.sort),
    });

    const result = data?.diamonds_by_query || { total_count: 0, items: [] };
    const items = (result.items || []).map(normalizeNivodaItem);
    const total = Number(result.total_count || 0);

    return {
      provider: 'nivoda',
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      items,
    };
  },

  async getById(id) {
    this.assertConfigured();

    const data = await nivodaGraphql(DIAMONDS_BY_QUERY, {
      query: buildNivodaQuery({ available: 'true' }),
      offset: 0,
      limit: 100,
      order: buildNivodaOrder('price_asc'),
    });

    const match = (data?.diamonds_by_query?.items || []).find((item) => String(item.id) === String(id));
    if (!match) return null;
    return normalizeNivodaItem(match);
  },

  getStatus() {
    return {
      configured: isNivodaConfigured(),
      apiUrl: config.nivoda.apiUrl ? '[set]' : '[missing]',
      auth: config.nivoda.username ? 'username_password' : 'missing',
    };
  },
};
