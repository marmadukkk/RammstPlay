// Вставьте свой YouTube API ключ
const API_KEY = "AIzaSyBDamTxI1eLAK6WDMlA7vVxUnyO9DqvGJY";
let player;
let currentTrackIndex = 0;
let tracks = [];

// Загрузка треков Rammstein
async function loadTracks() {
  try {
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=rammstein+official&type=video&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();

    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${API_KEY}`
    );
    const detailsData = await detailsResponse.json();

    tracks = detailsData.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      duration: formatDuration(item.contentDetails.duration),
    }));

    renderTracks();
  } catch (error) {
    console.error("Error loading tracks:", error);
  }
}

function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ]
    .filter((x, i) => x !== "00" || i > 0)
    .join(":");
}

function renderTracks() {
  const trackList = document.getElementById("trackList");
  trackList.innerHTML = tracks
    .map(
      (track, index) => `
        <div class="track" onclick="playTrack(${index})">
            <img src="${track.thumbnail}" class="thumbnail" alt="${track.title}">
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-duration">${track.duration}</div>
            </div>
        </div>
    `
    )
    .join("");
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "100%",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  setVolume(100);
  document.getElementById("progress").addEventListener("input", (e) => {
    const newTime = player.getDuration() * (e.target.value / 100);
    player.seekTo(newTime, true);
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    updateProgressBar();
  }
}

function updateProgressBar() {
  const progress = document.getElementById("progress");
  const duration = player.getDuration();
  const currentTime = player.getCurrentTime();

  progress.value = (currentTime / duration) * 100;

  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    requestAnimationFrame(updateProgressBar);
  }
}

function playTrack(index) {
  currentTrackIndex = index;
  player.loadVideoById(tracks[index].id);
  document.getElementById("player").style.height = "360px";
}

function togglePlay() {
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function playNext() {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  playTrack(currentTrackIndex);
}

function playPrevious() {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  playTrack(currentTrackIndex);
}

function setVolume(volume) {
  player.setVolume(volume);
}

// Инициализация
if (API_KEY === "AIzaSyBDamTxI1eLAK6WDMlA7vVxUnyO9DqvGJY") {
  alert("Пожалуйста, введите свой YouTube API ключ!");
} else {
  loadTracks();
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}
