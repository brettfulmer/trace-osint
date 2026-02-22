const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
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

// ─── Google Vision Web Detection ──────────────────────────────────────────────

const googleVisionSearch = async (base64Image, apiKey) => {
  if (!apiKey) {
    return { source: 'Google Vision', found: null, note: 'API key not configured — get one free at console.cloud.google.com' };
  }

  try {
    const body = {
      requests: [{
        image: { content: base64Image },
        features: [
          { type: 'WEB_DETECTION', maxResults: 20 },
          { type: 'FACE_DETECTION', maxResults: 5 },
          { type: 'LABEL_DETECTION', maxResults: 10 },
        ],
      }],
    };

    const res = await fetchWithTimeout(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      20000
    );

    if (!res.ok) {
      const errText = await res.text();
      return { source: 'Google Vision', found: null, note: `API error: ${res.status}` };
    }

    const json = await res.json();
    const result = json.responses?.[0];
    if (!result) return { source: 'Google Vision', found: null };

    const web = result.webDetection;
    const faces = result.faceAnnotations;
    const labels = result.labelAnnotations;

    return {
      source: 'Google Vision',
      found: !!(web?.webEntities?.length || web?.pagesWithMatchingImages?.length),
      data: {
        entities: web?.webEntities?.filter(e => e.description && e.score > 0.5).map(e => ({
          description: e.description,
          score: Math.round(e.score * 100),
        })) || [],
        fullMatches: web?.fullMatchingImages?.map(i => ({ url: i.url })) || [],
        partialMatches: web?.partialMatchingImages?.slice(0, 10).map(i => ({ url: i.url })) || [],
        pagesWithImage: web?.pagesWithMatchingImages?.slice(0, 10).map(p => ({
          url: p.url,
          title: p.pageTitle,
          thumbnails: p.fullMatchingImages?.map(i => i.url) || [],
        })) || [],
        similarImages: web?.visuallySimilarImages?.slice(0, 10).map(i => ({ url: i.url })) || [],
        bestGuess: web?.bestGuessLabels?.map(l => l.label) || [],
        faceCount: faces?.length || 0,
        labels: labels?.filter(l => l.score > 0.7).map(l => ({ description: l.description, score: Math.round(l.score * 100) })) || [],
      },
    };
  } catch (err) {
    return { source: 'Google Vision', found: null, note: err.message };
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
    const body = JSON.parse(event.body);
    const { image: base64Image, filename } = body;

    if (!base64Image) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Image data required' }) };
    }

    // Strip data URL prefix if present
    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

    // Check image size (Vision API limit is 20MB)
    const sizeBytes = Buffer.byteLength(imageData, 'base64');
    if (sizeBytes > 20 * 1024 * 1024) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Image too large (max 20MB)' }) };
    }

    const [visionResult] = await Promise.all([
      googleVisionSearch(imageData, process.env.GOOGLE_VISION_API_KEY),
    ]);

    const hasResults = visionResult.found === true;
    const topEntities = visionResult.data?.entities?.slice(0, 5) || [];
    const possibleNames = topEntities
      .filter(e => e.description && /^[A-Z][a-z]+ [A-Z][a-z]+/.test(e.description))
      .map(e => e.description);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        searchType: 'image',
        filename: filename || 'uploaded-image',
        hasResults,
        possibleNames,
        bestGuess: visionResult.data?.bestGuess || [],
        faceCount: visionResult.data?.faceCount || 0,
        sources: { vision: visionResult },
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
