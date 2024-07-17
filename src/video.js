import { flushContainer, mountOnContainer } from "./containers.js";
import { queueRenderPage } from "./presentation.js";
import { openModal } from "./modal.js";

let VIDEO_PLAYER;

function mountVideoPlayer (video_player_id = null, video_source = null) {
    // Find the video player
    VIDEO_PLAYER = document.querySelector(video_player_id);
    if (! VIDEO_PLAYER) {
        console.warn('Invalid Video Element!')    
        return null;    
    }
    VIDEO_PLAYER.src = video_source;
    VIDEO_PLAYER.classList.add('custom__video__element');
    VIDEO_PLAYER.setAttribute('controls', true);
    VIDEO_PLAYER.setAttribute('autoplay', true);
    console.info('Video Player Ready!');
    return VIDEO_PLAYER;
} 

/**
     * Listen if video is playing and watch for timestamp
     * @param {Array} timestamps 
     * @returns {void}
     */
function trackVideoTime(timestamps = []) {
    if (! VIDEO_PLAYER) {
        return console.warn('No available video player!');
    }
    let currentTimestamp;
    let interval;
    VIDEO_PLAYER.addEventListener('playing', function () {
        interval = setInterval(() => {
            currentTimestamp = mapCurrentTimestamp(this.currentTime, timestamps);
            if (currentTimestamp) {
                findVideoFrame(currentTimestamp);
            }
        }, 1000);
    })
    VIDEO_PLAYER.addEventListener('pause', function () {
        clearInterval(interval)
    });

}

/**
     * Find the timestamp array in the collection of timestamps
     * that matches the current position of the video
     * @param {number} currentTime 
     * @param {Array} timestamps 
     * @returns {Array}
     */
function mapCurrentTimestamp(currentTime = 0, timestamps = []) {
    let currentTimestamp = timestamps.find((time) => {
        return (time.start <= currentTime && time.end > currentTime)
            || (time.start <= currentTime && !time.end)
    });
    return currentTimestamp;
}

/**
     * Find the action that corresponds with the particular frame of video {page|popup}
     * @param {object} data 
     * @returns {void}
     */
function findVideoFrame(data) {
    if (data.page.includes('modal')) {
        VIDEO_PLAYER.pause();
        openModal(data.page)
        return;
    }
    queueRenderPage(data.page);
    return;
}

function play (){
    if (VIDEO_PLAYER) {
        return VIDEO_PLAYER.play();
    }
}

export {
    mountVideoPlayer,
    trackVideoTime,
    play,
}