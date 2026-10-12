const CUT_LABELS = {
  EX: 'Excellent',
  ID: 'Ideal',
  VG: 'Very Good',
  G: 'Good',
  GD: 'Good',
  FR: 'Fair',
  F: 'Fair',
  P: 'Poor',
  PR: 'Poor',
};

const FLU_LABELS = {
  NON: 'None',
  FNT: 'Faint',
  MED: 'Medium',
  STG: 'Strong',
  VST: 'Very Strong',
};

const SHAPE_LABELS = {
  ROUND: 'Round',
  OVAL: 'Oval',
  PRINCESS: 'Princess',
  PEAR: 'Pear',
  CUSHION: 'Cushion',
  EMERALD: 'Emerald',
  MARQUISE: 'Marquise',
  RADIANT: 'Radiant',
  ASSCHER: 'Asscher',
  HEART: 'Heart',
};

function labelCut(value) {
  if (!value) return '';
  return CUT_LABELS[value] || value;
}

function labelFlu(value) {
  if (!value) return 'None';
  return FLU_LABELS[value] || value;
}

function labelShape(value) {
  if (!value) return '';
  const key = String(value).toUpperCase();
  if (SHAPE_LABELS[key]) return SHAPE_LABELS[key];
  return key.charAt(0) + key.slice(1).toLowerCase();
}

function isAvailable(availability) {
  if (!availability) return true;
  const value = String(availability).toUpperCase();
  return !['SOLD', 'UNAVAILABLE', 'NOT_AVAILABLE', 'HOLD'].includes(value);
}

export function normalizeNivodaItem(item) {
  const cert = item?.diamond?.certificate || {};
  const price = Number(item?.markup_price ?? item?.price ?? 0);
  const labgrown = Boolean(cert.labgrown);

  return {
    id: String(item.id),
    sku: cert.certNumber ? String(cert.certNumber) : String(item.id),
    shape: labelShape(cert.shape),
    carat: cert.carats != null ? Number(cert.carats) : null,
    color: cert.color || '',
    clarity: cert.clarity || '',
    cut: labelCut(cert.cut),
    polish: labelCut(cert.polish),
    symmetry: labelCut(cert.symmetry),
    fluorescence: labelFlu(cert.floInt),
    lab: cert.lab || '',
    certificate: cert.certNumber ? String(cert.certNumber) : '',
    type: labgrown ? 'lab' : 'natural',
    price,
    currency: 'GBP',
    available: isAvailable(item?.diamond?.availability),
    measurements: {
      length: cert.length != null ? Number(cert.length) : null,
      width: cert.width != null ? Number(cert.width) : null,
      depth: cert.depth != null ? Number(cert.depth) : null,
    },
    imageUrl: item?.diamond?.image || '',
    videoUrl: item?.diamond?.video || '',
    v360: item?.diamond?.v360 || null,
    certificateUrl: cert.pdfUrl || '',
  };
}

export function buildNivodaQuery(params = {}) {
  const query = {
    has_image: params.has_image === 'true' || params.has_image === true ? true : undefined,
  };

  if (params.type === 'lab') query.labgrown = true;
  else if (params.type === 'natural') query.labgrown = false;

  const caratMin = params.carat_min != null ? Number(params.carat_min) : 0.3;
  const caratMax = params.carat_max != null ? Number(params.carat_max) : 10;
  query.sizes = [{ from: caratMin, to: caratMax }];

  if (params.shape) {
    query.shapes = String(params.shape)
      .split(',')
      .map((shape) => shape.trim().toUpperCase())
      .filter(Boolean);
  }

  if (params.color) {
    query.color = String(params.color)
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
  }

  if (params.clarity) {
    query.clarity = String(params.clarity)
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
  }

  if (params.cut) {
    query.cut = String(params.cut)
      .split(',')
      .map((value) => {
        const trimmed = value.trim();
        if (trimmed === 'Excellent') return 'EX';
        if (trimmed === 'Very Good') return 'VG';
        if (trimmed === 'Good') return 'G';
        return trimmed.toUpperCase();
      })
      .filter(Boolean);
  }

  if (params.lab) {
    query.lab = String(params.lab)
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
  }

  // Nivoda staging rejects some availability filter shapes (502). Filter in provider after fetch instead.

  return query;
}

export function buildNivodaOrder(sort = 'price_asc') {
  const map = {
    price_asc: { type: 'price', direction: 'ASC' },
    price_desc: { type: 'price', direction: 'DESC' },
    carat_desc: { type: 'size', direction: 'DESC' },
  };
  return map[sort] || map.price_asc;
}
