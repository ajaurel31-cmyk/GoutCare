export const PRODUCT_IDS = {
  monthly: 'goutcare_monthly_499',
  annual: 'goutcare_annual_2999',
} as const;

export const FREE_SCAN_LIMIT = 3;
export const DEFAULT_PURINE_TARGET = 400; // mg per day
export const DEFAULT_WATER_GOAL = 64; // oz per day
export const URIC_ACID_TARGET = 6.0; // mg/dL

export const STAGE_DEFAULTS: Record<string, { purineTarget: number; waterGoal: number; tip: string }> = {
  acute: {
    purineTarget: 300,
    waterGoal: 80,
    tip: 'Stricter purine limit and higher hydration during active flares',
  },
  intercritical: {
    purineTarget: 400,
    waterGoal: 64,
    tip: 'Standard targets for maintenance between flares',
  },
  chronic: {
    purineTarget: 350,
    waterGoal: 72,
    tip: 'Tighter management to reduce frequent flares',
  },
};

export const PURINE_THRESHOLDS = {
  low: 100,
  moderate: 200,
  high: 300,
} as const;

export const URIC_ACID_RANGES = {
  normal: 6.0,
  elevated: 7.0,
  high: 9.0,
} as const;

export const JOINT_LABELS: Record<string, string> = {
  'big-toe': 'Big Toe',
  'ankle': 'Ankle',
  'knee': 'Knee',
  'wrist': 'Wrist',
  'finger': 'Finger',
  'elbow': 'Elbow',
  'other': 'Other',
};

export const TRIGGER_LABELS: Record<string, string> = {
  'food': 'High-Purine Food',
  'alcohol': 'Alcohol',
  'dehydration': 'Dehydration',
  'stress': 'Stress',
  'injury': 'Injury',
  'medication-change': 'Medication Change',
  'weather': 'Weather Change',
  'other': 'Other',
};

export const TREATMENT_LABELS: Record<string, string> = {
  'colchicine': 'Colchicine',
  'nsaids': 'NSAIDs (Ibuprofen, etc.)',
  'prednisone': 'Prednisone',
  'ice': 'Ice/Cold Compress',
  'rest': 'Rest',
  'elevation': 'Elevation',
  'other': 'Other',
};

export const MEDICATION_PRESETS = [
  'Allopurinol',
  'Febuxostat',
  'Colchicine',
  'Indomethacin',
  'Naproxen',
  'Ibuprofen',
  'Prednisone',
  'Probenecid',
  'Pegloticase',
];

export const WATER_AMOUNTS = [
  { label: '8oz Glass', amount: 8 },
  { label: '12oz Can', amount: 12 },
  { label: '16oz Bottle', amount: 16 },
  { label: '20oz Bottle', amount: 20 },
];

// Medical citations for App Store Guideline 1.4.1 compliance
export const MEDICAL_CITATIONS = [
  {
    id: 'acr-2020',
    title: 'American College of Rheumatology Guidelines for Management of Gout (2020)',
    url: 'https://doi.org/10.1002/acr.24180',
    description: 'Uric acid targets, medication guidelines, and flare management',
  },
  {
    id: 'purine-tables',
    title: 'Kaneko K, et al. "Total Purine and Purine Base Content of Common Foodstuffs." Biol Pharm Bull. 2014;37(5):709-721',
    url: 'https://doi.org/10.1248/bpb.b13-00967',
    description: 'Purine content data for food database',
  },
  {
    id: 'choi-2004',
    title: 'Choi HK, et al. "Purine-Rich Foods, Dairy and Protein Intake, and the Risk of Gout in Men." N Engl J Med. 2004;350(11):1093-1103',
    url: 'https://doi.org/10.1056/NEJMoa035700',
    description: 'Dietary risk factors for gout, including high-purine foods and protective effects of dairy',
  },
  {
    id: 'neogi-2011',
    title: 'Neogi T. "Gout." N Engl J Med. 2011;364(5):443-452',
    url: 'https://doi.org/10.1056/NEJMcp1001124',
    description: 'Uric acid thresholds, gout pathophysiology, and clinical management',
  },
  {
    id: 'zhang-2012',
    title: 'Zhang Y, et al. "Cherry Consumption and Decreased Risk of Recurrent Gout Attacks." Arthritis Rheum. 2012;64(12):4004-4011',
    url: 'https://doi.org/10.1002/art.34677',
    description: 'Anti-inflammatory benefits of cherries for gout patients',
  },
  {
    id: 'choi-2007',
    title: 'Choi HK, Curhan G. "Coffee, Tea, and Caffeine Consumption and Serum Uric Acid Level." Arthritis Rheum. 2007;57(5):816-821',
    url: 'https://doi.org/10.1002/art.22762',
    description: 'Protective effects of coffee consumption on uric acid levels',
  },
  {
    id: 'dalbeth-2019',
    title: 'Dalbeth N, et al. "Gout." Lancet. 2016;388(10055):2039-2052',
    url: 'https://doi.org/10.1016/S0140-6736(16)00346-9',
    description: 'Comprehensive review of gout management, hydration, and lifestyle modifications',
  },
] as const;

export const MEDICAL_DISCLAIMER_SHORT = 'Purine values and health information are based on published medical research. This app is not a substitute for professional medical advice. Always consult your healthcare provider.';

export const DRUG_INTERACTIONS: Record<string, string[]> = {
  'Colchicine': ['Avoid alcohol — increases risk of liver damage and side effects', 'Avoid grapefruit juice — may increase colchicine levels'],
  'Allopurinol': ['Take with food to reduce stomach upset', 'Avoid alcohol — may reduce effectiveness'],
  'Febuxostat': ['Avoid alcohol — may worsen liver function', 'May interact with azathioprine and mercaptopurine'],
  'Prednisone': ['Avoid alcohol — increases risk of stomach bleeding', 'Take with food to reduce stomach irritation'],
  'Indomethacin': ['Avoid alcohol — increases risk of stomach bleeding', 'Take with food or milk'],
  'Naproxen': ['Avoid alcohol — increases risk of stomach bleeding', 'Do not take with other NSAIDs'],
  'Ibuprofen': ['Avoid alcohol — increases risk of stomach bleeding', 'Do not take with other NSAIDs'],
};
