import { mountVideoPlayer, trackVideoTime, play } from './video.js';
import { mountPresentation, queueRenderPage } from './presentation.js';
import { parseTrackingFile } from './tracker.js';

export default async function init(pluginOptions = {}) {
    let defaultOptions = {
        strict_mode: false, // pop-up questions should be made compulsory {true|false}.
        dev_mode: false,
        id: '#presenting_video_container',
        player_id: '#my_video_player',
        presentation_id: '#my_presentation_container',
        tracker: 'txt', // the format of the tracking file {txt|json} 
        pages: true,
        data: {
            "id": "1",
            "video_url": "",
            "presentation_url": "",
            "tracking_url": null, // required if options.tracker === 'txt'
            "title": "",
            "tracker_json": {} // required if options.tracker === 'json'
        }
    }
    pluginOptions = Object.assign({}, defaultOptions, pluginOptions); // register plugin options
    const data = pluginOptions.data;

    // Step 1
    mountVideoPlayer(pluginOptions.player_id, data.video_url);

    // Step 2
    mountPresentation(pluginOptions.presentation_id, data.presentation_url);
    let videoTimestampTracker;
    if (pluginOptions.tracker === 'txt') {
        videoTimestampTracker = await parseTrackingFile(data.tracking_url);
    } else {
        videoTimestampTracker = data.tracker_json;
    }

    // Step 3
    trackVideoTime(videoTimestampTracker)


    /**
     * Add the CSS file to the head of the HTML
     * @returns {void}
     */
    async function addCss() {
        const scriptURL = import.meta.url;
        const cssURL = scriptURL.replace('main.js', 'video-player-js.css');
        const head = document.getElementsByTagName('head')[0];
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssURL;
        head.appendChild(link);
        return;
    }

    addCss();


}