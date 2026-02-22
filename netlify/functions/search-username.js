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

// ─── API-based checks (reliable, return rich data) ───────────────────────────

const checkGitHub = async (username) => {
  try {
    const res = await fetchWithTimeout(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TRACE-OSINT/1.0',
      },
    });
    if (res.status === 404) return { platform: 'GitHub', found: false, url: `https://github.com/${username}` };
    if (!res.ok) return { platform: 'GitHub', found: null, url: `https://github.com/${username}` };
    const d = await res.json();
    return {
      platform: 'GitHub', found: true, url: d.html_url, icon: 'github',
      data: {
        name: d.name, bio: d.bio, location: d.location, company: d.company,
        website: d.blog, avatar: d.avatar_url, email: d.email,
        followers: d.followers, following: d.following,
        publicRepos: d.public_repos, createdAt: d.created_at,
        twitterUsername: d.twitter_username,
      },
    };
  } catch {
    return { platform: 'GitHub', found: null, url: `https://github.com/${username}` };
  }
};

const checkReddit = async (username) => {
  try {
    const res = await fetchWithTimeout(`https://www.reddit.com/user/${username}/about.json`, {
      headers: { 'User-Agent': 'TRACE-OSINT/1.0' },
    });
    if (res.status === 404) return { platform: 'Reddit', found: false, url: `https://reddit.com/u/${username}` };
    if (!res.ok) return { platform: 'Reddit', found: null, url: `https://reddit.com/u/${username}` };
    const json = await res.json();
    const d = json.data;
    if (!d) return { platform: 'Reddit', found: false, url: `https://reddit.com/u/${username}` };
    return {
      platform: 'Reddit', found: true, url: `https://reddit.com/u/${username}`, icon: 'reddit',
      data: {
        name: d.name,
        karma: (d.link_karma || 0) + (d.comment_karma || 0),
        postKarma: d.link_karma,
        commentKarma: d.comment_karma,
        avatar: d.icon_img?.split('?')[0] || null,
        createdAt: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : null,
        isPremium: d.is_gold,
        totalAwardsReceived: d.total_awards_received,
        isOver18: d.over_18,
      },
    };
  } catch {
    return { platform: 'Reddit', found: null, url: `https://reddit.com/u/${username}` };
  }
};

const checkHackerNews = async (username) => {
  try {
    const res = await fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/user/${username}.json`);
    if (!res.ok) return { platform: 'Hacker News', found: null, url: `https://news.ycombinator.com/user?id=${username}` };
    const d = await res.json();
    if (!d) return { platform: 'Hacker News', found: false, url: `https://news.ycombinator.com/user?id=${username}` };
    return {
      platform: 'Hacker News', found: true, url: `https://news.ycombinator.com/user?id=${username}`, icon: 'hackernews',
      data: {
        name: username,
        karma: d.karma,
        about: d.about ? d.about.replace(/<[^>]*>/g, '').substring(0, 200) : null,
        createdAt: d.created ? new Date(d.created * 1000).toISOString() : null,
        submissions: d.submitted?.length || 0,
      },
    };
  } catch {
    return { platform: 'Hacker News', found: null, url: `https://news.ycombinator.com/user?id=${username}` };
  }
};

const checkDevTo = async (username) => {
  try {
    const res = await fetchWithTimeout(`https://dev.to/api/users/by_username?url=${username}`);
    if (res.status === 404) return { platform: 'Dev.to', found: false, url: `https://dev.to/${username}` };
    if (!res.ok) return { platform: 'Dev.to', found: null, url: `https://dev.to/${username}` };
    const d = await res.json();
    if (d.error) return { platform: 'Dev.to', found: false, url: `https://dev.to/${username}` };
    return {
      platform: 'Dev.to', found: true, url: `https://dev.to/${username}`, icon: 'devto',
      data: {
        name: d.name, bio: d.summary, location: d.location,
        avatar: d.profile_image, followers: d.followers_count,
        joinedAt: d.joined_at,
        github: d.github_username, twitter: d.twitter_username,
      },
    };
  } catch {
    return { platform: 'Dev.to', found: null, url: `https://dev.to/${username}` };
  }
};

const checkKeybase = async (username) => {
  try {
    const res = await fetchWithTimeout(`https://keybase.io/_/api/1.0/user/lookup.json?username=${username}`);
    if (!res.ok) return { platform: 'Keybase', found: null, url: `https://keybase.io/${username}` };
    const d = await res.json();
    if (d.status?.code !== 0 || !d.them?.length) return { platform: 'Keybase', found: false, url: `https://keybase.io/${username}` };
    const user = d.them[0];
    return {
      platform: 'Keybase', found: true, url: `https://keybase.io/${username}`, icon: 'keybase',
      data: {
        name: user.profile?.full_name,
        bio: user.profile?.bio,
        location: user.profile?.location,
        avatar: `https://keybase.io/${username}/picture`,
        proofs: user.proofs_summary?.all?.map(p => ({ type: p.proof_type, url: p.service_url })) || [],
      },
    };
  } catch {
    return { platform: 'Keybase', found: null, url: `https://keybase.io/${username}` };
  }
};

const checkGitLab = async (username) => {
  try {
    const res = await fetchWithTimeout(`https://gitlab.com/api/v4/users?username=${username}`);
    if (!res.ok) return { platform: 'GitLab', found: null, url: `https://gitlab.com/${username}` };
    const d = await res.json();
    if (!d?.length) return { platform: 'GitLab', found: false, url: `https://gitlab.com/${username}` };
    const user = d[0];
    return {
      platform: 'GitLab', found: true, url: `https://gitlab.com/${username}`, icon: 'gitlab',
      data: {
        name: user.name, bio: user.bio, avatar: user.avatar_url,
        createdAt: user.created_at, website: user.website_url,
        publicRepos: user.public_repos,
      },
    };
  } catch {
    return { platform: 'GitLab', found: null, url: `https://gitlab.com/${username}` };
  }
};

// ─── Web-based checks (check HTTP response status) ───────────────────────────

const checkWeb = async (platform, url) => {
  try {
    const res = await fetchWithTimeout(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'manual',
    });

    if (res.status === 404) return { platform, found: false, url };
    if (res.status === 200) return { platform, found: 'likely', url };
    if (res.status >= 301 && res.status <= 302) {
      const location = res.headers.get('location') || '';
      if (/login|signin|404|not.found|does.not.exist/i.test(location)) {
        return { platform, found: false, url };
      }
      return { platform, found: 'likely', url };
    }
    if (res.status === 429) return { platform, found: null, note: 'Rate limited', url };
    return { platform, found: null, url };
  } catch {
    return { platform, found: null, url };
  }
};

// ─── Main handler ─────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { query: rawUsername } = JSON.parse(event.body);
    if (!rawUsername?.trim()) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Username required' }) };
    }

    const username = rawUsername.replace(/^@/, '').trim();

    const [
      github, reddit, hackerNews, devTo, keybase, gitlab,
      twitter, instagram, tiktok, twitch, youtube, pinterest,
      medium, telegram, snapchat, linkedin, tumblr, mastodon,
    ] = await Promise.all([
      checkGitHub(username),
      checkReddit(username),
      checkHackerNews(username),
      checkDevTo(username),
      checkKeybase(username),
      checkGitLab(username),
      checkWeb('Twitter / X', `https://twitter.com/${username}`),
      checkWeb('Instagram', `https://www.instagram.com/${username}/`),
      checkWeb('TikTok', `https://www.tiktok.com/@${username}`),
      checkWeb('Twitch', `https://www.twitch.tv/${username}`),
      checkWeb('YouTube', `https://www.youtube.com/@${username}`),
      checkWeb('Pinterest', `https://www.pinterest.com/${username}/`),
      checkWeb('Medium', `https://medium.com/@${username}`),
      checkWeb('Telegram', `https://t.me/${username}`),
      checkWeb('Snapchat', `https://www.snapchat.com/add/${username}`),
      checkWeb('LinkedIn', `https://www.linkedin.com/in/${username}/`),
      checkWeb('Tumblr', `https://${username}.tumblr.com/`),
      checkWeb('Mastodon', `https://mastodon.social/@${username}`),
    ]);

    const allPlatforms = [
      github, reddit, hackerNews, devTo, keybase, gitlab,
      twitter, instagram, tiktok, twitch, youtube, pinterest,
      medium, telegram, snapchat, linkedin, tumblr, mastodon,
    ];

    // Aggregate best profile data
    const richData = allPlatforms.filter(p => p.found === true && p.data);
    const avatars = richData.filter(p => p.data?.avatar).map(p => ({ platform: p.platform, url: p.data.avatar }));
    const names = [...new Set(richData.filter(p => p.data?.name).map(p => p.data.name))];
    const locations = [...new Set(richData.filter(p => p.data?.location).map(p => p.data.location).filter(Boolean))];
    const bios = richData.filter(p => p.data?.bio).map(p => ({ platform: p.platform, bio: p.data.bio }));
    const websites = [...new Set(richData.filter(p => p.data?.website).map(p => p.data.website).filter(Boolean))];

    const confirmed = allPlatforms.filter(p => p.found === true).length;
    const likely = allPlatforms.filter(p => p.found === 'likely').length;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        username,
        searchType: 'username',
        summary: {
          name: names[0] || null,
          names,
          avatar: avatars[0] || null,
          avatars,
          locations,
          bios,
          websites,
          confirmed,
          likely,
          total: allPlatforms.length,
        },
        platforms: allPlatforms,
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
