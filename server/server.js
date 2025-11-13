const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
const OpenAI = require('openai');
const querystring = require('querystring');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "https://emotituneslivecopy.onrender.com/callback";
const FRONTEND_BASE = process.env.FRONTEND_BASE || 'https://emotituneslivecopy.onrender.com';

app.use(cors());
app.use(express.json());

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});




// OpenAI client (new OpenAI SDK)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Refresh access token periodically
async function refreshAccessToken() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log('Access token refreshed');
        
        // Refresh token before it expires
        setTimeout(refreshAccessToken, (data.body['expires_in'] - 60) * 1000);
    } catch (error) {
        console.error('Error refreshing access token:', error);
        setTimeout(refreshAccessToken, 30000); // Retry after 30 seconds
    }
}

// Search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const data = await spotifyApi.searchTracks(query);
        res.json(data.body.tracks.items);
    } catch (error) {
        console.error('Error searching tracks:', error);
        res.status(500).json({ error: 'Failed to search tracks' });
    }
});

// Suggest songs from questionnaire using OpenAI, then lookup on Spotify
// Expected body: { answers: { ... } , promptOverride?: string, limit?: number }

/*
Receives answers from the user.

Builds a prompt for OpenAI asking for song suggestions in JSON format.

Calls openai.chat.completions.create to get suggestions.

Tries to parse OpenAI output to JSON.

Uses Spotify API to look up each suggested song to get Spotify info (album, preview link, URI, etc.).

Returns the enriched suggestions.
*/
app.post('/api/suggest', async (req, res) => {
    try {
        const { answers, promptOverride, limit = 10 } = req.body;

        if (!answers) return res.status(400).json({ error: 'answers object is required in the request body' });

        // Build a helpful prompt for OpenAI. Keep it strict and ask for JSON output.
        const basePrompt = `You are an assistant that recommends songs based on user questionnaire answers.\n\n` +
            `User answers (as JSON): ${JSON.stringify(answers)}\n\n` +
            `Based on these answers, suggest a list of ${limit} songs. For each suggestion return an object with keys: "title" and "artist". ` +
            `Return the response as a single valid JSON array (e.g. [{"title":"...","artist":"..."}, ...]). Do not include extra commentary or markdown.`;

        const prompt = promptOverride ? `${promptOverride}\n\n${basePrompt}` : basePrompt;

        // Call OpenAI
        // Call OpenAI (new SDK uses `chat.completions.create`)
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: 'You output only JSON arrays when asked.' }, { role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 800,
        });

        // Support both old/new response shapes defensively
        const raw = completion?.choices?.[0]?.message?.content || completion?.data?.choices?.[0]?.message?.content || '';

        let suggestions = [];
        try {
            // Be strict: try JSON parse first
            suggestions = JSON.parse(raw);
            if (!Array.isArray(suggestions)) throw new Error('parsed value is not an array');
        } catch (err) {
            // Fallback: try to extract JSON-looking substring
            const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (match) {
                try {
                    suggestions = JSON.parse(match[0]);
                } catch (err2) {
                    console.error('Failed to parse fallback JSON from OpenAI response', err2);
                }
            }
        }

        if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
            return res.status(500).json({ error: 'OpenAI did not return parsable suggestions', raw });
        }

        // Limit suggestions to provided limit
        const toLookup = suggestions.slice(0, limit).map(s => ({ title: s.title, artist: s.artist }));

        // For each suggestion, search Spotify and enrich result
        const results = [];
        for (const s of toLookup) {
            const q = `${s.title} ${s.artist}`.trim();
            try {
                const data = await spotifyApi.searchTracks(q, { limit: 1 });
                const track = data.body.tracks.items[0];
                if (track) {
                    results.push({
                        suggested: s,
                        found: {
                            id: track.id,
                            name: track.name,
                            artists: track.artists.map(a => a.name),
                            album: track.album?.name,
                            album_image_url: track.album?.images && track.album.images.length > 0 ? track.album.images[0].url : undefined,
                            preview_url: track.preview_url,
                            spotify_url: track.external_urls?.spotify,
                            uri: track.uri,
                        }
                    });
                } else {
                    results.push({ suggested: s, found: null });
                }
            } catch (searchErr) {
                console.error('Spotify lookup error for', q, searchErr.message || searchErr);
                results.push({ suggested: s, found: null, error: String(searchErr) });
            }
        }

        res.json({ suggestions: results, rawOpenAI: raw });
    } catch (error) {
        console.error('Error in /api/suggest', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

// Create a Spotify playlist for a user and add tracks
// Body: { access_token: string, name: string, description?: string, public?: boolean, trackUris: string[] }
app.post('/api/create-playlist', async (req, res) => {
    try {
        const { access_token, name, description = '', public: isPublic = false, trackUris } = req.body;

        if (!access_token) return res.status(400).json({ error: 'access_token (Spotify user token) is required' });
        if (!name) return res.status(400).json({ error: 'name (playlist name) is required' });
        if (!Array.isArray(trackUris) || trackUris.length === 0) return res.status(400).json({ error: 'trackUris must be a non-empty array of Spotify track URIs' });

        // Use a new SpotifyWebApi instance with the user's access token
        const userSpotify = new SpotifyWebApi();
        userSpotify.setAccessToken(access_token);

        // Get current user profile to obtain the user ID
        const me = await userSpotify.getMe();
        if (!me || !me.body || !me.body.id) {
            console.error('Spotify getMe() response:', me);
            return res.status(500).json({ error: 'Failed to determine Spotify user id from access token', details: me });
        }
        const userId = me.body.id;
        console.log('[Playlist] User ID:', userId, 'Product:', me.body.product);

        // Create playlist
        const created = await userSpotify.createPlaylist(name, { public: !!isPublic, description });
        if (!created || !created.body || !created.body.id) {
            console.error('Spotify createPlaylist response:', created);
            return res.status(500).json({ error: 'Failed to create playlist', details: created });
        }
        const playlistId = created.body.id;
        console.log('[Playlist] Created playlist:', playlistId);

        // Add tracks (Spotify allows adding up to 100 at a time)
        const chunkSize = 100;
        for (let i = 0; i < trackUris.length; i += chunkSize) {
            const chunk = trackUris.slice(i, i + chunkSize);
            const addTracksResp = await userSpotify.addTracksToPlaylist(playlistId, chunk);
            if (!addTracksResp || !addTracksResp.body) {
                console.error('Spotify addTracksToPlaylist response:', addTracksResp);
                // Continue, but log error
            }
        }

        const playlist = await userSpotify.getPlaylist(playlistId);
        if (!playlist || !playlist.body) {
            console.error('Spotify getPlaylist response:', playlist);
            return res.status(500).json({ error: 'Failed to fetch created playlist', details: playlist });
        }
        res.json({ playlist: playlist.body });
    } catch (err) {
        console.error('Error in /api/create-playlist', err);
        
        // Provide detailed error messages
        let userMessage = 'Failed to create playlist';
        if (err?.statusCode === 403) {
            userMessage = 'Permission denied: Your Spotify account may be a Guest or Family Plan account that cannot create playlists. Please use a personal Spotify account with full permissions.';
        } else if (err?.statusCode === 401) {
            userMessage = 'Unauthorized: Your Spotify session has expired. Please log in again.';
        }
        
        // If Spotify returns 401, tell user to refresh token / check scopes
        const status = err?.statusCode || 500;
        const message = err?.message || 'Failed to create playlist';
        res.status(status).json({ error: userMessage, details: { message, statusCode: err?.statusCode } });
    }
});


app.get("/login", (req, res) => {
  const returnTo = req.query.returnTo || 'results.html';
  const scope = "playlist-modify-private playlist-modify-public user-read-private";
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      state: returnTo,
    });

  res.redirect(authUrl);
});

// 2️⃣ Step 2: Handle the redirect and exchange code for a user token
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || 'results.html';

  const authOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  };

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", authOptions);
  const tokenData = await tokenResponse.json();

  if (tokenData.access_token) {
    const at = encodeURIComponent(tokenData.access_token);
    const rt = tokenData.refresh_token ? encodeURIComponent(tokenData.refresh_token) : '';
    const fragment = `#access_token=${at}${rt ? `&refresh_token=${rt}` : ''}`;
    return res.redirect(`${FRONTEND_BASE}/${state}${fragment}`);
  } else {
    res.status(400).json({ error: "Failed to get token", details: tokenData });
  }
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend')));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    refreshAccessToken(); // Initial token refresh
});