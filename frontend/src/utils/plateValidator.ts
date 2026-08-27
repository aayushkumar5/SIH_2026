/**
 * Indian License Plate Format Validator & Normalizer
 *
 * Supports:
 * 1. Standard Indian Registration: [State Code 2][RTO 2][Series 1-3][Digits 4] e.g. DL 01 AB 1234, UP 32 BZ 9999
 * 2. Bharat Series (BH): [Year 2] BH [Digits 4] [Letters 1-2] e.g. 22 BH 1234 AA
 * 3. Military/Defence: [Arrow/Prefix] [Year 2] [Class 1] [Digits 6] [Suffix 1] e.g. 22D123456A, ↑22D123456A
 */

export interface PlateValidationResult {
  isValid: boolean;
  normalized: string;
  format: 'STANDARD' | 'BHARAT_SERIES' | 'MILITARY' | 'INVALID';
  stateCode?: string;
  stateName?: string;
  rtoCode?: string;
  series?: string;
  digits?: string;
  description: string;
}

const INDIAN_STATES: Record<string, string> = {
  AN: 'Andaman & Nicobar',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CH: 'Chandigarh',
  DD: 'Daman & Diu',
  DL: 'Delhi',
  DN: 'Dadra & Nagar Haveli',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu & Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TR: 'Tripura',
  TS: 'Telangana',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
};

export function validateAndNormalizePlate(rawPlate: string): PlateValidationResult {
  if (!rawPlate) {
    return {
      isValid: false,
      normalized: '',
      format: 'INVALID',
      description: 'Empty plate number',
    };
  }

  // Remove spaces, hyphens, and dots, convert to uppercase
  const cleaned = rawPlate.replace(/[^A-Za-z0-9↑]/g, '').toUpperCase();

  // 1. Check Bharat Series: e.g. 22BH1234AA or 23BH5678A
  const bhRegex = /^(\d{2})BH(\d{4})([A-Z]{1,2})$/;
  const bhMatch = cleaned.match(bhRegex);
  if (bhMatch) {
    return {
      isValid: true,
      normalized: `${bhMatch[1]} BH ${bhMatch[2]} ${bhMatch[3]}`,
      format: 'BHARAT_SERIES',
      digits: bhMatch[2],
      series: bhMatch[3],
      description: `Bharat Series (BH) • Registered Year 20${bhMatch[1]}`,
    };
  }

  // 2. Check Military / Defence format: e.g. 22D123456A or ↑22D123456A
  const milRegex = /^↑?(\d{2})([A-Z])(\d{6})([A-Z])$/;
  const milMatch = cleaned.match(milRegex);
  if (milMatch) {
    return {
      isValid: true,
      normalized: `↑${milMatch[1]}${milMatch[2]} ${milMatch[3]}${milMatch[4]}`,
      format: 'MILITARY',
      digits: milMatch[3],
      series: milMatch[2],
      description: `Indian Armed Forces Vehicle • Procured 20${milMatch[1]}`,
    };
  }

  // 3. Check Standard Indian State format: e.g. DL01AB1234, UP32BZ9999, UK04CA5678
  const stdRegex = /^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{4})$/;
  const stdMatch = cleaned.match(stdRegex);
  if (stdMatch) {
    const state = stdMatch[1];
    const rto = stdMatch[2].padStart(2, '0');
    const series = stdMatch[3] || '';
    const digits = stdMatch[4];
    const stateName = INDIAN_STATES[state] || 'Indian State / UT';

    return {
      isValid: true,
      normalized: `${state} ${rto} ${series ? series + ' ' : ''}${digits}`.trim(),
      format: 'STANDARD',
      stateCode: state,
      stateName,
      rtoCode: rto,
      series,
      digits,
      description: `${stateName} (RTO ${state}-${rto})`,
    };
  }

  // Fallback for non-standard formats
  return {
    isValid: cleaned.length >= 4,
    normalized: cleaned,
    format: cleaned.length >= 4 ? 'STANDARD' : 'INVALID',
    description: cleaned.length >= 4 ? 'Custom / Commercial Format' : 'Invalid License Plate',
  };
}
