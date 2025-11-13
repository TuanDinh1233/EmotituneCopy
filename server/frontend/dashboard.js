const spotifySVG = `<img width="32" height="32" src = "src/logos/spotify.png"/>`;

const appleSVG = `<img width="32" height="32" src = "src/logos/itunes.png"/>`;

let playlistContainer = document.getElementById("playlist-container");

playlistContainer.innerHTML = "";

// Load suggestions from storage
let suggestions = [];
try {
    const sessionRaw = sessionStorage.getItem('emotitunes_suggestions');
    const localRaw = localStorage.getItem('emotitunes_suggestions');
    console.log('[Dashboard] sessionStorage:', sessionRaw ? 'found' : 'empty');
    console.log('[Dashboard] localStorage:', localRaw ? 'found' : 'empty');
    
    const raw = sessionRaw || localRaw;
    if (raw) {
        suggestions = JSON.parse(raw);
        console.log('[Dashboard] Loaded suggestions:', suggestions.length, 'items');
    } else {
        console.log('[Dashboard] No suggestions in storage');
    }
} catch (e) {
    console.error('[Dashboard] Error loading suggestions:', e);
}

if (!Array.isArray(suggestions) || suggestions.length === 0) {
    const empty = document.createElement('div');
    empty.classList.add('song-item');
    empty.innerHTML = `<div class="song-details"><span class="song-title">No suggestions found</span><span class="song-artist">Complete the questionnaire to see recommendations here.</span></div>`;
    playlistContainer.appendChild(empty);
} else {
    suggestions.forEach((item, index) => {
        const title = (item && item.found && item.found.name) || (item && item.suggested && item.suggested.title) || 'Unknown Title';
        const artist = (item && item.found && Array.isArray(item.found.artists) ? item.found.artists.join(', ') : (item && item.suggested && item.suggested.artist)) || 'Unknown Artist';
        const source = (item && item.found && item.found.spotify_url) ? 'spotify' : 'apple';
        const spotifyUrl = item?.found?.spotify_url;

        let songElement = document.createElement("div");
        songElement.classList.add("song-item");
        songElement.dataset.index = index;

        let logo = source === "spotify" ? spotifySVG : appleSVG;

        // Add Spotify link button
        let playButton = '';
        if (spotifyUrl) {
            playButton = `<a href="${spotifyUrl}" target="_blank" class="spotify-link-btn" title="Open in Spotify">🎧</a>`;
        }

        songElement.innerHTML = `
            <div class="song-logo">${logo}</div>
            <div class="song-details">
                <span class="song-title">${title}</span>
                <span class="song-artist">${artist}</span>
            </div>
            ${playButton}
        `;

        playlistContainer.appendChild(songElement);
    });
}

// Spotify integration for export playlist
const API_BASE = window.API_BASE || window.location.origin;

function setStatus(html) {
    const el = document.getElementById('status');
    if (el) {
        el.innerHTML = html;
        el.style.display = 'block';
    }
}

function clearStatus() {
    const el = document.getElementById('status');
    if (el) {
        el.style.display = 'none';
        el.innerHTML = '';
    }
}

function parseHashParams() {
    const hash = window.location.hash || '';
    const out = {};
    if (hash.startsWith('#')) {
        hash.substring(1).split('&').forEach(kv => {
            const [k, v] = kv.split('=');
            if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
    }
    return out;
}

let accessToken = null;
const hp = parseHashParams();
if (hp.access_token) {
    accessToken = hp.access_token;
    console.log('[Dashboard] Access token found in URL hash');
}

const loginBtn = document.getElementById('loginBtn');
const exportBtn = document.getElementById('exportBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        window.location.href = API_BASE + '/login?returnTo=dashboard.html';
    });
}

if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
        if (!accessToken) {
            setStatus('Please log in to Spotify first. <button onclick="document.getElementById(\'loginBtn\').style.display=\'inline-block\';document.getElementById(\'loginBtn\').click();" style="margin-left:10px;padding:8px 12px;background:#6a3093;color:white;border:none;border-radius:5px;cursor:pointer;">Log in Now</button>');
            loginBtn.style.display = 'inline-block';
            return;
        }
        
        if (!suggestions || suggestions.length === 0) {
            setStatus('No songs to export. Complete the questionnaire first.');
            return;
        }
        
        const uris = suggestions.map(s => s?.found?.uri).filter(Boolean);
        if (uris.length === 0) {
            setStatus('No Spotify tracks found to add to a playlist.');
            return;
        }
        
        const name = prompt('Playlist name', 'EmotiTunes Mix');
        if (!name) return;

        setStatus('Creating playlist on Spotify...');
        try {
            const resp = await fetch(`${API_BASE}/api/create-playlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken, name, public: false, trackUris: uris })
            });
            
            if (!resp.ok) {
                const txt = await resp.text();
                try {
                    const errorData = JSON.parse(txt);
                    setStatus(`❌ Error: ${errorData.error || resp.status}`);
                } catch {
                    setStatus(`❌ Failed to create playlist: ${resp.status} ${txt}`);
                }
                return;
            }
            
            const data = await resp.json();
            const url = data?.playlist?.external_urls?.spotify;
            if (url) {
                setStatus(`✅ Playlist created successfully! <a href="${url}" target="_blank" style="color:#6a3093;font-weight:bold;">Open in Spotify</a>`);
            } else {
                setStatus('✅ Playlist created! (No external URL returned)');
            }
        } catch (err) {
            setStatus('Unexpected error: ' + (err?.message || err));
        }
    });
}