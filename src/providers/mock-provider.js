const SHAPES = ['Round', 'Oval', 'Cushion', 'Emerald', 'Pear', 'Princess'];
const COLORS = ['D', 'E', 'F', 'G', 'H'];
const CLARITIES = ['IF', 'VVS1', 'VVS2', 'VS1', 'VS2'];
const CUTS = ['Excellent', 'Very Good'];
const LABS = ['GIA', 'IGI'];
const TYPES = ['natural', 'lab'];

function buildDiamond(index) {
  const shape = SHAPES[index % SHAPES.length];
  const carat = Number((0.5 + (index % 20) * 0.05).toFixed(2));
  const color = COLORS[index % COLORS.length];
  const clarity = CLARITIES[index % CLARITIES.length];
  const cut = CUTS[index % CUTS.length];
  const lab = LABS[index % LABS.length];
  const type = TYPES[index % TYPES.length];
  const base = type === 'lab' ? 900 : 2200;
  const priceGbp = base + carat * 4200 + index * 37;
  const price = Math.round(priceGbp * 100);

  return {
    id: `mock-${index + 1}`,
    sku: `PD-MOCK-${String(index + 1).padStart(4, '0')}`,
    shape,
    carat,
    color,
    clarity,
    cut,
    polish: cut,
    symmetry: cut,
    fluorescence: index % 3 === 0 ? 'None' : 'Faint',
    lab,
    certificate: `${lab}-${100000 + index}`,
    type,
    price,
    currency: 'GBP',
    available: index % 11 !== 0,
    measurements: {
      length: Number((carat * 6.2).toFixed(2)),
      width: Number((carat * 6.0).toFixed(2)),
      depth: Number((carat * 3.8).toFixed(2)),
    },
    imageUrl: '',
  };
}

const ALL_DIAMONDS = Array.from({ length: 48 }, (_, i) => buildDiamond(i));

export const mockProvider = {
  name: 'mock',

  async getFilters() {
    return {
      provider: 'mock',
      filters: [
        { key: 'shape', label: 'Shape', type: 'multi', options: SHAPES.map((v) => ({ value: v, label: v })) },
        { key: 'type', label: 'Diamond type', type: 'single', options: [
          { value: 'natural', label: 'Natural' },
          { value: 'lab', label: 'Lab-grown' },
        ]},
        { key: 'carat_min', label: 'Min carat', type: 'number', min: 0.3, max: 5, step: 0.01 },
        { key: 'carat_max', label: 'Max carat', type: 'number', min: 0.3, max: 5, step: 0.01 },
        { key: 'color', label: 'Colour', type: 'multi', options: COLORS.map((v) => ({ value: v, label: v })) },
        { key: 'clarity', label: 'Clarity', type: 'multi', options: CLARITIES.map((v) => ({ value: v, label: v })) },
        { key: 'cut', label: 'Cut', type: 'multi', options: CUTS.map((v) => ({ value: v, label: v })) },
        { key: 'lab', label: 'Certification', type: 'multi', options: LABS.map((v) => ({ value: v, label: v })) },
        { key: 'price_min', label: 'Min price', type: 'number', min: 500, max: 50000, step: 100 },
        { key: 'price_max', label: 'Max price', type: 'number', min: 500, max: 50000, step: 100 },
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
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(24, Math.max(1, Number(params.limit || 12)));
    const sort = params.sort || 'price_asc';

    let results = ALL_DIAMONDS.filter((diamond) => {
      if (params.shape && !String(params.shape).split(',').includes(diamond.shape)) return false;
      if (params.type && diamond.type !== params.type) return false;
      if (params.color && !String(params.color).split(',').includes(diamond.color)) return false;
      if (params.clarity && !String(params.clarity).split(',').includes(diamond.clarity)) return false;
      if (params.cut && !String(params.cut).split(',').includes(diamond.cut)) return false;
      if (params.lab && !String(params.lab).split(',').includes(diamond.lab)) return false;
      if (params.carat_min && diamond.carat < Number(params.carat_min)) return false;
      if (params.carat_max && diamond.carat > Number(params.carat_max)) return false;
      if (params.price_min && diamond.price < Number(params.price_min) * 100) return false;
      if (params.price_max && diamond.price > Number(params.price_max) * 100) return false;
      if (params.available === 'true' && !diamond.available) return false;
      return true;
    });

    results.sort((a, b) => {
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'carat_desc') return b.carat - a.carat;
      return a.price - b.price;
    });

    const total = results.length;
    const start = (page - 1) * limit;
    const items = results.slice(start, start + limit);

    return {
      provider: 'mock',
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      items,
    };
  },

  async getById(id) {
    const diamond = ALL_DIAMONDS.find((item) => item.id === id);
    if (!diamond) return null;
    return diamond;
  },
};
