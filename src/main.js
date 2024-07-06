const init = function (pluginOptions = {}) {
    let defaultOptions = {
        strict_mode: false // pop-up questions should be made compulsory {true|false}.
    }
    pluginOptions = Object.assign({}, defaultOptions, pluginOptions);

    const custom__modal__container = document.createElement('div');
    custom__modal__container.id = 'custom__modal__container';
    const custom__modal = `<div id="custom__modal">
            <button id="modal__close__btn">X</button>
            <h3>This is a question box!</h3>
            <p id="question__position"></p>
            <input type="text" id="question__answer" name="question__answer" />
            <button type="submit" id="modal__submit__btn">Submit</button>
    </div>`;
    const CONTAINER = document.querySelector('#presenting_video_container');
    const DATA_ATTRIBUTE = CONTAINER.getAttribute('data-videos');
    const DATA = DATA_ATTRIBUTE && JSON.parse(DATA_ATTRIBUTE) ? JSON.parse(DATA_ATTRIBUTE) : null;
    const VIDEO_PLAYER = document.createElement('video');
    VIDEO_PLAYER.classList.add('custom__video__element');
    const SLIDE = document.createElement('iframe');
    SLIDE.id = 'powerpoint__container';
    let TRACKING_FILE_URL;
    let POWERPOINT_URL;
    let VIDEO_TITLE
    let timeStamps;

    /**
     * Assign the resources URLs to the various elements
     * @param {object} video 
     * @returns {boolean}
     */
    async function mountVideo(video = null) {
        if (video) {
            VIDEO_PLAYER.src = video.video_url ?? false;
            POWERPOINT_URL = formatPowerPointUrl(video.presentation_url) ?? false;
            TRACKING_FILE_URL = video.tracking_url ?? false;
            VIDEO_TITLE = video.title ?? false;
            return true;
        }
        return false;
    }

    /**
     * Append the various elements to the DOM
     * @returns {void}
     */
    async function mountElementsInContainer() {
        if (CONTAINER) {
            CONTAINER.appendChild(VIDEO_PLAYER);
            if (POWERPOINT_URL) {
                SLIDE.src = POWERPOINT_URL;
                SLIDE.title = VIDEO_TITLE;
                CONTAINER.appendChild(SLIDE);
                CONTAINER.appendChild(custom__modal__container);
            }
            setVideoOptions();
        }
    }

    /**
     * Create an embed URL for the powerpoint document
     * @param {string} url 
     * @returns {string|boolean}
     */
    function formatPowerPointUrl(url) {
        if (url) {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${url}`;
        }
        return false;
    }

    /**
     * Set the attributes of the mounted <video></video> element 
     * @returns {void}
     */
    function setVideoOptions() {
        VIDEO_PLAYER.setAttribute('controls', 'controls');
        VIDEO_PLAYER.setAttribute('autoplay', 'autoplay');
        return;
    }

    /**
     * Create an array of objects of the timestamps from the tracking .txt file
     * @returns {Array}
     */
    async function parseTrackingFile() {
        if (!TRACKING_FILE_URL) {
            return false
        }
        let content = await getFileContent(TRACKING_FILE_URL);
        let timestampObject = [];
        content.forEach(item => {
            timestampObject.push(createTimeStampObject(item));
        });
        console.log(timestampObject)
        return timestampObject;
    }


    /**
     * Format a line to fetch the question form it
     * @param {string} line 
     * @returns {string|void}
     */
    function formatQuestion(line = null) {
        if(line){
            let question = line.split('?')[1];
            return question;
        }
        return;
    }


    /**
     * Read the file content of the .txt file
     * @param {url} source 
     * @returns 
     */
    async function getFileContent(source) {
        let file = await fetch(source)
        let text = await file.text();
        // text = text.replace(/\s/g, "");
        text = text.split(";")
        text = text.filter((item) => item.length > 0)
        return text;
    }

    /**
     * Break a line of the .txt file into time and page/action component
     * @param {string} line 
     * @returns {object} 
     */
    function createTimeStampObject(line) {
        let breakLine = line.split('='); // break the timestamp line into timestamp and value components
        let timestamps = breakLine[0];
        let start = convertTimestampToSeconds(timestamps.split('-')[0]);
        let end = timestamps.split('-')[1] ? convertTimestampToSeconds(timestamps.split('-')[1]) : start + 1;
        let page = breakLine[1];
        return {
            timestamps: timestamps,
            start: start,
            end: end,
            page: page
        }
    }

    /**
     * convert time stamp [HH:MM:SS] to seconds
     * @param {string} timestamp 
     * @returns {number} 
     */
    function convertTimestampToSeconds(timestamp) {
        const [hours, minutes, seconds] = timestamp.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return totalSeconds;
    }

    function findVideoFrame(data) {
        // const frameSelection = document.querySelector('#presenting_video_container > .custom_iframe_element');
        // const iframe = frameSelection.contentDocument || frameSelection.contentWindow.document;
        // const ButtonFastFwd = iframe.contentWindow.document.getElementById("ButtonFastFwd-Small14");
        // var elmnt = iframe.contentWindow.document.getElementsByTagName("H1")[0];
        // // const ButtonFastFwd = document.getElementById("ButtonFastFwd-Small14");
        if (data.page.includes('question')) {
            VIDEO_PLAYER.pause();
            let question = formatQuestion(data.page);
            openQuestionModal(question);
        }
        console.log(data)
    }

    /**
     * Open the modal when there is a question on the timestamp
     * @param {string} question 
     * @returns {void}
     */
    function openQuestionModal(question) {
        custom__modal__container.style.display = 'flex';
        custom__modal__container.innerHTML = custom__modal;
        let question__position = document.querySelector('#question__position');
        question__position.innerHTML = question;
        let modal__submit__btn;
        let modal__close__btn;
        setTimeout(() => {
            modal__submit__btn = document.querySelector('#modal__submit__btn');
            modal__close__btn = document.querySelector('#modal__close__btn');
            console.log(modal__submit__btn)
            modal__submit__btn.addEventListener('click', function() {
                answerQuestion(document.getElementById('question__answer').value)
            });
            modal__close__btn.addEventListener('click', function() {
                if (pluginOptions.strict_mode === true) {
                    VIDEO_PLAYER.currentTime -= 1;
                }
                custom__modal__container.style.display = 'none';
            });
        }, 1000);
        return;
    }


    /**
     * Submit a users response to a pop-up question
     * @param {string} response 
     * @returns 
     */
    function answerQuestion(response) {
        if (response.length < 1) {
            return alert("Please enter a response");
        }
        custom__modal__container.style.display = 'none';
        VIDEO_PLAYER.play();
        return alert(`User responded with - ${response}`);
    }

    /**
     * Find the timestamp array in the collection of timestamps that matches the current position of the video
     * @param {number} currentTime 
     * @param {Array} timestamps 
     * @returns {Array}
     */
    function mapCurrentTimestamp (currentTime = 0, timestamps = []){
        let currentTimestamp = timestamps.find((time) => {
            return (time.start <= currentTime && time.end > currentTime) 
                || (time.start <= currentTime && !time.end)
        });
        return currentTimestamp;
    }


    /**
     * Listen if video is playing and watch for timestamp
     */
    function trackVideoTime(timestamps = []) {
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
        VIDEO_PLAYER.addEventListener('pause', function() {
            clearInterval(interval)
        });

    }

    mountVideo(DATA[0])
        .then(
            (res) => {
                if (res === true) {
                    mountElementsInContainer()
                        .then(() => {
                            parseTrackingFile().then((res) => {
                                if (res) {
                                    trackVideoTime(res)
                                }
                            });
                        });
                } else {
                    alert('no video')
                }
            }
        );
}