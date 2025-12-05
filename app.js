const songs = [
    {
        title: "00h49outside",
        file: "assets/audio/00h49outside.wav",
        theme: "theme-midnight"
    },
    {
        title: "0330",
        file: "assets/audio/0330.wav",
        theme: "theme-sunset"
    },
    {
        title: "autumn",
        file: "assets/audio/autumn.wav",
        theme: "theme-autumn"
    },
    {
        title: "birds",
        file: "assets/audio/birds.wav",
        theme: "theme-sky"
    },
    {
        title: "grass",
        file: "assets/audio/grass.wav",
        theme: "theme-grass"
    },
    {
        title: "pixelated",
        file: "assets/audio/pixelated.wav",
        theme: "theme-pixel"
    },
    {
        title: "meow",
        file: "assets/audio/meow.wav",
        theme: "theme-meow"
    },
    {
        title: "sungod",
        file: "assets/audio/sungod.wav",
        theme: "theme-sun"
    },
    {
        title: "SWID",
        file: "assets/audio/SWID.wav",
        theme: "theme-swat"
    },
    {
        title: "woods",
        file: "assets/audio/woods.wav",
        theme: "theme-woods"
    }
];

let currentIndex = 0;
let isPlaying = false;

const audioPlayer = document.getElementById('audio-player');
const trackName = document.getElementById('track-name');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const trackTime = document.getElementById('track-time');

function loadSong(index) {
    const song = songs[index];
    trackName.textContent = song.title;
    audioPlayer.src = song.file;

    // Apply theme
    document.body.className = ''; // Clear all classes
    document.body.classList.add(song.theme);

    updatePlayPauseIcon();
}

function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play().catch(e => console.log("Playback failed needs interaction first", e));
    }
    isPlaying = !isPlaying;
    updatePlayPauseIcon();
}

function updatePlayPauseIcon() {
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

function playNext() {
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong(currentIndex);
    if (isPlaying) audioPlayer.play();
}

function playPrev() {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(currentIndex);
    if (isPlaying) audioPlayer.play();
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Time display
    trackTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', playNext);
progressContainer.addEventListener('click', setProgress);

// Use 'loadedmetadata' to update total duration display immediately when song loads
audioPlayer.addEventListener('loadedmetadata', () => {
    trackTime.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
});

// Initial Load
loadSong(currentIndex);
