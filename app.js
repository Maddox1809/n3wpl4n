// PRODUCTION: Only 00h49outside is active. Other songs kept for future releases.
const songs = [
    {
        title: "00h49outside",
        file: "assets/audio/00h49outside.wav",
        slug: "00h49outside",
        view: "pages/00h49outside.html",
        style: "styles/00h49outside.css"
    }
];

// FUTURE RELEASES - Uncomment songs as they become available:
/*
const allSongs = [
    {
        title: "00h49outside",
        file: "assets/audio/00h49outside.wav",
        slug: "00h49outside",
        view: "pages/00h49outside.html",
        style: "styles/00h49outside.css"
    },
    {
        title: "0330",
        file: "assets/audio/0330.wav",
        slug: "0330",
        view: "pages/0330.html",
        style: "styles/0330.css"
    },
    {
        title: "autumn",
        file: "assets/audio/autumn.wav",
        slug: "autumn",
        view: "pages/autumn.html",
        style: "styles/autumn.css"
    },
    {
        title: "birds",
        file: "assets/audio/birds.wav",
        slug: "birds",
        view: "pages/birds.html",
        style: "styles/birds.css"
    },
    {
        title: "grass",
        file: "assets/audio/grass.wav",
        slug: "grass",
        view: "pages/grass.html",
        style: "styles/grass.css"
    },
    {
        title: "pixelated",
        file: "assets/audio/pixelated.wav",
        slug: "pixelated",
        view: "pages/pixelated.html",
        style: "styles/pixelated.css"
    },
    {
        title: "meow",
        file: "assets/audio/meow.wav",
        slug: "meow",
        view: "pages/meow.html",
        style: "styles/meow.css"
    },
    {
        title: "sungod",
        file: "assets/audio/sungod.wav",
        slug: "sungod",
        view: "pages/sungod.html",
        style: "styles/sungod.css"
    },
    {
        title: "SWID",
        file: "assets/audio/SWID.wav",
        slug: "swid",
        view: "pages/swid.html",
        style: "styles/swid.css"
    },
    {
        title: "woods",
        file: "assets/audio/woods.wav",
        slug: "woods",
        view: "pages/woods.html",
        style: "styles/woods.css"
    },
    {
        title: "contrast",
        file: "assets/audio/contrast.wav",
        slug: "contrast",
        view: "pages/contrast.html",
        style: "styles/contrast.css"
    }
];
*/

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
const viewRoot = document.getElementById('view-root');

function updatePlayPauseIcon() {
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

async function loadSong(index) {
    const song = songs[index];
    trackName.textContent = song.title;
    trackTime.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
    audioPlayer.src = song.file;

    // mark body for per-track CSS hooks
    document.body.dataset.track = song.slug;
    document.body.classList.remove('glitch-active');

    await Promise.all([
        loadView(song),
        ensureTrackStyle(song.style)
    ]);

    updatePlayPauseIcon();
}

async function loadView(song) {
    try {
        const res = await fetch(song.view, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load view for ${song.title}`);
        const html = await res.text();
        await swapView(html);
    } catch (err) {
        console.error(err);
        viewRoot.innerHTML = `<div class="view-loading">Could not load view.</div>`;
    }
}

function ensureTrackStyle(href) {
    return new Promise((resolve, reject) => {
        let link = document.getElementById('track-style');
        if (link && link.dataset.href === href) {
            resolve();
            return;
        }

        if (!link) {
            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.id = 'track-style';
            document.head.appendChild(link);
        }

        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load stylesheet ${href}`));
        link.dataset.href = href;
        link.href = href;
    });
}

function swapView(html) {
    return new Promise((resolve) => {
        const finishFadeOut = () => {
            viewRoot.innerHTML = html;
            requestAnimationFrame(() => {
                viewRoot.classList.remove('view-fading');
                resolve();
            });
        };

        viewRoot.classList.add('view-fading');
        const onTransitionEnd = () => {
            viewRoot.removeEventListener('transitionend', onTransitionEnd);
            finishFadeOut();
        };

        viewRoot.addEventListener('transitionend', onTransitionEnd, { once: true });
        setTimeout(finishFadeOut, 900); // fallback if transition is skipped
    });
}

function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(e => console.log('Playback requires interaction first', e));
    } else {
        audioPlayer.pause();
    }
}

function playNext() {
    const shouldResume = !audioPlayer.paused;
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong(currentIndex).then(() => {
        if (shouldResume) audioPlayer.play();
    });
}

function playPrev() {
    const shouldResume = !audioPlayer.paused;
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(currentIndex).then(() => {
        if (shouldResume) audioPlayer.play();
    });
}

// Smooth 60fps progress bar animation
function animateProgressBar() {
    const { duration, currentTime } = audioPlayer;
    if (duration && !Number.isNaN(duration) && !audioPlayer.paused) {
        const percent = (currentTime / duration) * 100;
        progressBar.style.width = `${percent}%`;
    }
    requestAnimationFrame(animateProgressBar);
}

// Start the animation loop
requestAnimationFrame(animateProgressBar);

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const percent = duration && !Number.isNaN(duration) ? (currentTime / duration) * 100 : 0;
    progressBar.style.width = `${percent}%`;

    trackTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;

    if (songs[currentIndex].slug === 'contrast') {
        if (currentTime >= 203) {
            document.body.classList.add('glitch-active');
        } else {
            document.body.classList.remove('glitch-active');
        }
    }
}

function setProgress(e) {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    if (!duration || Number.isNaN(duration)) return;
    audioPlayer.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
    if (Number.isNaN(seconds) || !Number.isFinite(seconds)) return '0:00';
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

audioPlayer.addEventListener('loadedmetadata', () => {
    trackTime.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
});

audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    updatePlayPauseIcon();
});

audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseIcon();
});

// Initial Load
loadSong(currentIndex);
