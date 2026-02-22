const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 6000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// ─── Country code lookup ──────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸', timezone: 'UTC-5 to UTC-8' },
  { code: '+7', country: 'Russia / Kazakhstan', flag: '🇷🇺', timezone: 'UTC+3 to UTC+12' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', timezone: 'UTC+2' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', timezone: 'UTC+2' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', timezone: 'UTC+2' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', timezone: 'UTC+1' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', timezone: 'UTC+1' },
  { code: '+33', country: 'France', flag: '🇫🇷', timezone: 'UTC+1' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', timezone: 'UTC+1' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', timezone: 'UTC+1' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', timezone: 'UTC+1' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', timezone: 'UTC+2' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', timezone: 'UTC+1' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', timezone: 'UTC+1' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', timezone: 'UTC+0' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', timezone: 'UTC+1' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', timezone: 'UTC+1' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', timezone: 'UTC+1' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', timezone: 'UTC+1' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', timezone: 'UTC+1' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', timezone: 'UTC-5' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', timezone: 'UTC-6' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', timezone: 'UTC-3' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', timezone: 'UTC-3' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', timezone: 'UTC-4' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', timezone: 'UTC-5' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪', timezone: 'UTC-4' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', timezone: 'UTC+8' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', timezone: 'UTC+8 to UTC+11' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', timezone: 'UTC+7 to UTC+9' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', timezone: 'UTC+8' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', timezone: 'UTC+12' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', timezone: 'UTC+8' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', timezone: 'UTC+7' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', timezone: 'UTC+9' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', timezone: 'UTC+9' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', timezone: 'UTC+7' },
  { code: '+86', country: 'China', flag: '🇨🇳', timezone: 'UTC+8' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', timezone: 'UTC+3' },
  { code: '+91', country: 'India', flag: '🇮🇳', timezone: 'UTC+5:30' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', timezone: 'UTC+5' },
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫', timezone: 'UTC+4:30' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', timezone: 'UTC+5:30' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲', timezone: 'UTC+6:30' },
  { code: '+98', country: 'Iran', flag: '🇮🇷', timezone: 'UTC+3:30' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦', timezone: 'UTC+1' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿', timezone: 'UTC+1' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳', timezone: 'UTC+1' },
  { code: '+218', country: 'Libya', flag: '🇱🇾', timezone: 'UTC+2' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲', timezone: 'UTC+0' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', timezone: 'UTC+1' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', timezone: 'UTC+3' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿', timezone: 'UTC+3' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬', timezone: 'UTC+3' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲', timezone: 'UTC+2' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', timezone: 'UTC+2' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', timezone: 'UTC+0' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺', timezone: 'UTC+1' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', timezone: 'UTC+0' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸', timezone: 'UTC+0' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', timezone: 'UTC+2' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', timezone: 'UTC+2' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸', timezone: 'UTC+1' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷', timezone: 'UTC+1' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮', timezone: 'UTC+1' },
  { code: '+387', country: 'Bosnia & Herzegovina', flag: '🇧🇦', timezone: 'UTC+1' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', timezone: 'UTC+1' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰', timezone: 'UTC+1' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', timezone: 'UTC+1' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', timezone: 'UTC+3' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', timezone: 'UTC+4' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', timezone: 'UTC+2' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', timezone: 'UTC+3' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', timezone: 'UTC+3' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', timezone: 'UTC+5:45' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', timezone: 'UTC+4' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪', timezone: 'UTC+4' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', timezone: 'UTC+5' },
];

const detectCountry = (phone) => {
  const normalized = phone.startsWith('+') ? phone : '+' + phone.replace(/^00/, '');
  // Sort by code length descending to match longest prefix first
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const entry of sorted) {
    if (normalized.startsWith(entry.code)) return entry;
  }
  return null;
};

const cleanPhone = (phone) => {
  return phone.replace(/[\s\-().]/g, '');
};

// ─── AbstractAPI Phone Intelligence ──────────────────────────────────────────
// Endpoint: https://phoneintelligence.abstractapi.com/v1?api_key=KEY&phone=NUMBER
// Phone must be digits only (no +, spaces, dashes) — e.g. 61488774490

const checkAbstractAPI = async (phone, apiKey) => {
  if (!apiKey) return { source: 'AbstractAPI', found: null, note: 'API key not configured — get one free at abstractapi.com' };
  try {
    // Strip everything except digits — AbstractAPI Phone Intelligence expects raw digits
    const digitsOnly = phone.replace(/\D/g, '');

    const res = await fetchWithTimeout(
      `https://phoneintelligence.abstractapi.com/v1?api_key=${apiKey}&phone=${digitsOnly}`
    );

    if (res.status === 422 || res.status === 400) {
      const err = await res.json().catch(() => ({}));
      return { source: 'AbstractAPI', found: false, note: err?.error?.message || 'Invalid phone number' };
    }
    if (!res.ok) return { source: 'AbstractAPI', found: null, note: `API error ${res.status}` };

    const d = await res.json();

    // The phone intelligence API may return valid=false for unrecognised numbers
    if (d.valid === false) return { source: 'AbstractAPI', found: false, data: { raw: phone } };

    return {
      source: 'AbstractAPI',
      found: true,
      data: {
        formatted: d.format?.international || d.phone,
        local: d.format?.local,
        valid: d.valid,
        type: d.type,                           // mobile / landline / voip / unknown
        country: d.country?.name,
        countryCode: d.country?.code,
        dialingCode: d.country?.phone_code ? `+${d.country.phone_code}` : null,
        carrier: d.carrier,
        location: d.location,
        callerName: d.caller_name || null,       // Phone Intelligence extra fields
        lineStatus: d.line_status || null,
        portedNetwork: d.ported_network || null,
      },
    };
  } catch {
    return { source: 'AbstractAPI', found: null };
  }
};

// ─── Main Handler ─────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { query: rawPhone } = JSON.parse(event.body);
    if (!rawPhone?.trim()) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Phone number required' }) };
    }

    const phone = cleanPhone(rawPhone.trim());

    // Basic local detection
    const countryInfo = detectCountry(phone);
    const digits = phone.replace(/\D/g, '');
    const possibleFormats = [
      phone,
      digits,
      `+${digits}`,
    ];

    const [abstractResult] = await Promise.all([
      checkAbstractAPI(phone, process.env.ABSTRACT_API_KEY),
    ]);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        phone: rawPhone,
        searchType: 'phone',
        cleaned: phone,
        digits,
        country: abstractResult.data?.country || countryInfo?.country || null,
        countryFlag: countryInfo?.flag || null,
        timezone: abstractResult.data?.timezone || countryInfo?.timezone || null,
        carrier: abstractResult.data?.carrier || null,
        lineType: abstractResult.data?.type || null,
        formatted: abstractResult.data?.formatted || null,
        localFormat: abstractResult.data?.local || null,
        valid: abstractResult.data?.valid,
        callerName: abstractResult.data?.callerName || null,
        lineStatus: abstractResult.data?.lineStatus || null,
        portedNetwork: abstractResult.data?.portedNetwork || null,
        sources: { abstractapi: abstractResult },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
