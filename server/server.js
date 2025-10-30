const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    refreshAccessToken(); // Initial token refresh
});