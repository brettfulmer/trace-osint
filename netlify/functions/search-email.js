import crypto from 'crypto';

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

const md5 = (str) => crypto.createHash('md5').update(str.toLowerCase().trim()).digest('hex');

// ─── Gravatar Lookup ──────────────────────────────────────────────────────────

const checkGravatar = async (email) => {
  const hash = md5(email);
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=200`;
  const profileUrl = `https://www.gravatar.com/${hash}.json`;

  try {
    // Check if avatar exists
    const avatarRes = await fetchWithTimeout(avatarUrl, { method: 'HEAD' });
    if (avatarRes.status === 404) {
      return { source: 'Gravatar', found: false };
    }

    // Try to get profile data
    try {
      const profileRes = await fetchWithTimeout(profileUrl);
      if (profileRes.ok) {
        const json = await profileRes.json();
        const entry = json.entry?.[0];
        if (entry) {
          return {
            source: 'Gravatar',
            found: true,
            data: {
              name: entry.displayName || entry.name?.formatted,
              avatar: `https://www.gravatar.com/avatar/${hash}?s=200`,
              profileUrl: entry.profileUrl,
              about: entry.aboutMe,
              location: entry.currentLocation,
              emails: entry.emails?.map(e => e.value),
              accounts: entry.accounts?.map(a => ({ shortname: a.shortname, url: a.url })),
              urls: entry.urls?.map(u => ({ title: u.title, value: u.value })),
              hash,
            },
          };
        }
      }
    } catch { /* profile fetch failed, but avatar exists */ }

    return {
      source: 'Gravatar',
      found: true,
      data: { avatar: `https://www.gravatar.com/avatar/${hash}?s=200`, hash },
    };
  } catch {
    return { source: 'Gravatar', found: null };
  }
};

// ─── Hunter.io Enrichment ─────────────────────────────────────────────────────

const checkHunter = async (email, apiKey) => {
  if (!apiKey) return { source: 'Hunter.io', found: null, note: 'API key not configured' };
  try {
    const res = await fetchWithTimeout(
      `https://api.hunter.io/v2/email-enrichment?email=${encodeURIComponent(email)}&api_key=${apiKey}`
    );
    if (res.status === 404) return { source: 'Hunter.io', found: false };
    if (res.status === 401) return { source: 'Hunter.io', found: null, note: 'Invalid API key' };
    if (!res.ok) return { source: 'Hunter.io', found: null };
    const json = await res.json();
    const d = json.data;
    if (!d) return { source: 'Hunter.io', found: false };
    return {
      source: 'Hunter.io',
      found: true,
      data: {
        name: [d.first_name, d.last_name].filter(Boolean).join(' ') || null,
        firstName: d.first_name,
        lastName: d.last_name,
        position: d.position,
        company: d.company,
        companyType: d.company_type,
        industry: d.industry,
        companySize: d.company_size,
        website: d.website,
        linkedin: d.linkedin_url,
        twitter: d.twitter_handle ? `https://twitter.com/${d.twitter_handle}` : null,
        location: d.city ? `${d.city}${d.state ? ', ' + d.state : ''}${d.country ? ', ' + d.country : ''}` : d.country,
        avatar: d.avatar,
        confidence: d.score,
      },
    };
  } catch {
    return { source: 'Hunter.io', found: null };
  }
};

// ─── Have I Been Pwned ────────────────────────────────────────────────────────

const checkHIBP = async (email, apiKey) => {
  if (!apiKey) return { source: 'HaveIBeenPwned', found: null, note: 'API key not configured — get one at haveibeenpwned.com' };
  try {
    const res = await fetchWithTimeout(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'TRACE-OSINT/1.0',
        },
      }
    );
    if (res.status === 404) return { source: 'HaveIBeenPwned', found: false, breaches: [] };
    if (res.status === 401) return { source: 'HaveIBeenPwned', found: null, note: 'Invalid API key' };
    if (!res.ok) return { source: 'HaveIBeenPwned', found: null };
    const breaches = await res.json();
    return {
      source: 'HaveIBeenPwned',
      found: true,
      data: {
        breachCount: breaches.length,
        breaches: breaches.map(b => ({
          name: b.Name,
          domain: b.Domain,
          date: b.BreachDate,
          pwnCount: b.PwnCount,
          dataClasses: b.DataClasses,
          verified: b.IsVerified,
          sensitive: b.IsSensitive,
        })),
      },
    };
  } catch {
    return { source: 'HaveIBeenPwned', found: null };
  }
};

// ─── Email Validation ─────────────────────────────────────────────────────────

const validateEmailSyntax = (email) => {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Check common service registrations by probing OAuth/avatar endpoints
const probeEmailPresence = async (email, hash) => {
  const probes = [
    {
      service: 'Gravatar',
      url: `https://www.gravatar.com/avatar/${hash}?d=404`,
      check: (status) => status !== 404,
    },
  ];

  const results = await Promise.all(
    probes.map(async ({ service, url, check }) => {
      try {
        const res = await fetchWithTimeout(url, { method: 'HEAD' }, 4000);
        return { service, found: check(res.status) };
      } catch {
        return { service, found: null };
      }
    })
  );
  return results;
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
    const { query: email } = JSON.parse(event.body);
    if (!email?.trim()) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Email required' }) };
    }

    const cleanEmail = email.toLowerCase().trim();
    const valid = validateEmailSyntax(cleanEmail);
    if (!valid) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          email: cleanEmail,
          searchType: 'email',
          error: 'Invalid email format',
          valid: false,
        }),
      };
    }

    const emailHash = md5(cleanEmail);
    const [local, domain] = cleanEmail.split('@');

    const [gravatar, hunter, hibp] = await Promise.all([
      checkGravatar(cleanEmail),
      checkHunter(cleanEmail, process.env.HUNTER_API_KEY),
      checkHIBP(cleanEmail, process.env.HIBP_API_KEY),
    ]);

    // Aggregate name and avatar
    const name = hunter.data?.name || gravatar.data?.name || null;
    const avatar = hunter.data?.avatar || gravatar.data?.avatar || null;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        email: cleanEmail,
        searchType: 'email',
        valid: true,
        emailHash,
        emailParts: { local, domain },
        summary: { name, avatar },
        sources: { gravatar, hunter, hibp },
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
