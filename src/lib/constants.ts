export const PRODUCT_IDS = {
  monthly: 'goutcare_monthly_499',
  annual: 'goutcare_annual_2999',
} as const;

export const FREE_SCAN_LIMIT = 3;
export const DEFAULT_PURINE_TARGET = 400; // mg per day
export const DEFAULT_WATER_GOAL = 64; // oz per day
export const URIC_ACID_TARGET = 6.0; // mg/dL

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

export const DRUG_INTERACTIONS: Record<string, string[]> = {
  'Colchicine': ['Avoid alcohol — increases risk of liver damage and side effects', 'Avoid grapefruit juice — may increase colchicine levels'],
  'Allopurinol': ['Take with food to reduce stomach upset', 'Avoid alcohol — may reduce effectiveness'],
  'Febuxostat': ['Avoid alcohol — may worsen liver function', 'May interact with azathioprine and mercaptopurine'],
  'Prednisone': ['Avoid alcohol — increases risk of stomach bleeding', 'Take with food to reduce stomach irritation'],
  'Indomethacin': ['Avoid alcohol — increases risk of stomach bleeding', 'Take with food or milk'],
  'Naproxen': ['Avoid alcohol — increases risk of stomach bleeding', 'Do not take with other NSAIDs'],
  'Ibuprofen': ['Avoid alcohol — increases risk of stomach bleeding', 'Do not take with other NSAIDs'],
};
