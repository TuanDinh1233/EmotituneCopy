const songs = [
    { title: "Blinding Lights", artist: "The Weeknd", source: "spotify" },
    { title: "Levitating", artist: "Dua Lipa", source: "apple" },
    { title: "Save Your Tears", artist: "The Weeknd", source: "spotify" },
    { title: "Kiss Me More", artist: "Doja Cat feat. SZA", source: "apple" }
];

const spotifySVG = `<img width="32" height="32" src = "src/logos/spotify.png"/>`;

const appleSVG = `<img width="32" height="32" src = "src/logos/itunes.png"/>`;

let playlistContainer = document.getElementById("playlist-container");

songs.forEach(song => {
    let songElement = document.createElement("div");
    songElement.classList.add("song-item");

    let logo = song.source === "spotify" ? spotifySVG : appleSVG;

    songElement.innerHTML = `
        <div class="song-logo">${logo}</div>
        <div class="song-details">
            <span class="song-title">${song.title}</span>
            <span class="song-artist">${song.artist}</span>
        </div>
    `;

    playlistContainer.appendChild(songElement);
});