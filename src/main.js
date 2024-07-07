
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs'; // import pdf.js library
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.mjs'; // register pdfJs worker

export default function init(pluginOptions = {}) {
    let defaultOptions = {
        strict_mode: false, // pop-up questions should be made compulsory {true|false}.
        dev_mode: false,
        id: '#presenting_video_container',
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

    const custom__modal__container = document.createElement('div');
    custom__modal__container.id = 'custom__modal__container';
    const custom__modal = `<div id="custom__modal">
            <button id="modal__close__btn">X</button>
            <h3>This is a question box!</h3>
            <p id="question__position"></p>
            <input type="text" id="question__answer" name="question__answer" />
            <button type="submit" id="modal__submit__btn">Submit</button>
    </div>`;
    const CONTAINER = document.querySelector(pluginOptions.id);
    const DATA_ATTRIBUTE = CONTAINER.getAttribute('data-videos');
    const DATA = DATA_ATTRIBUTE && JSON.parse(DATA_ATTRIBUTE) ? JSON.parse(DATA_ATTRIBUTE) : pluginOptions.data;
    const VIDEO_PLAYER = document.createElement('video');
    VIDEO_PLAYER.classList.add('custom__video__element');
    const SLIDE = document.createElement('iframe');
    SLIDE.id = 'powerpoint__container';
    const PDF_CONTAINER = document.createElement('canvas');
    PDF_CONTAINER.id = 'custom__pdf__container';
    const PAGES_NUMBER = document.createElement('p')
    PAGES_NUMBER.id = 'pagesNumber'
    let TRACKING_FILE_URL;
    let PRESENTATION_URL;
    let VIDEO_TITLE;


    let globalSlideNumber = 0; // page number of slide according to video timestamp

    let pdfFunction;
    let pageRendering = false; // if a pdf rendering is currently in progress {true|false}
    let pageNumPending = null; // the pageNumber of the slide that is queue to be rendered {null|Number}
    let pdfCanvas; // the HTML <canvas></canvas> element where the pdf will be rendered on
    let pdfContext; // the context of the pdf canvas 



    /**
    * If another page rendering in progress, waits until the rendering is
    * finished. Otherwise, executes rendering immediately.
    */
    function queueRenderPage(pageNumber = Number(1)) {
        if (typeof Number(pageNumber) !== 'number') {
            return console.warn(`pageNumber must be a number: ${typeof pageNumber} passed.`)
        }
        if (pageRendering) {
            pageNumPending = pageNumber;
        } else {
            setPdfPage(Number(pageNumber));
        }
    }

    function setPdfPage(pageNumber = 1) {
        pageNumber = Number(pageNumber)
        pageRendering = true;
        pdfFunction.getPage(pageNumber).then(function (page) {
            let desiredWidth = VIDEO_PLAYER.offsetWidth;
            let viewport = page.getViewport({ scale: 1, });
            let scale = desiredWidth / viewport.width;
            let scaledViewport = page.getViewport({ scale: scale, });

            // Prepare canvas using PDF page dimensions
            let canvas = pdfCanvas;
            canvas.width = VIDEO_PLAYER.offsetWidth;
            canvas.height = VIDEO_PLAYER.offsetHeight;

            // Render PDF page into canvas context
            let renderContext = {
                canvasContext: pdfContext,
                viewport: scaledViewport
            };
            let renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
                pageRendering = false;
                displayPageNumbers(pageNumber, pdfFunction.numPages)
                if (pageNumPending !== null) {
                    // New page rendering is pending
                    setPdfPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });

    }

    function mountPdfCanvas(url) {
        let loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function (pdf) {
            // Fetch the first page
            pdfFunction = pdf;
            setPdfPage();
        }, function (reason) {
            // PDF loading error
            console.error(reason);
        });
    }

    function displayPageNumbers(current, total) {
        if (pluginOptions.pages === true) {
            PAGES_NUMBER.innerHTML = `Page ${current} / ${total}`
        }
    }

    /**
     * Assign the resources URLs to the various elements
     * @param {object} video 
     * @returns {boolean}
     */
    async function mountVideo(video = null) {
        if (video) {
            VIDEO_PLAYER.src = video.video_url ?? false;
            PRESENTATION_URL = video.presentation_url ?? false;
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
            if (PRESENTATION_URL) {
                CONTAINER.appendChild(PDF_CONTAINER);
                CONTAINER.appendChild(custom__modal__container);
                mountPdfCanvas(PRESENTATION_URL)
                pdfCanvas = document.getElementById('custom__pdf__container');
                pdfContext = pdfCanvas.getContext('2d')
            }
            if (pluginOptions.pages === true) {
                CONTAINER.appendChild(PAGES_NUMBER);                
            }
            setVideoOptions();
        }
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
        let timestampObject = [];
        if (pluginOptions.tracker === 'json') {
            if (DATA.tracker_json.length < 1) {
                console.warn('Tracker is required. Empty array passed');
            }
            timestampObject = DATA.tracker_json
        } else {
            if (!TRACKING_FILE_URL) {
                console.warn('Tracking .txt file is required when options.tracker === txt')
            } else {
                let content = await getFileContent(TRACKING_FILE_URL);
                content.forEach(item => {
                    timestampObject.push(createTimeStampObject(item));
                });
            }
        }
        if (pluginOptions.dev_mode === true) {
            const dev_mode_logger = document.createElement('div');
            CONTAINER.appendChild(dev_mode_logger);
            dev_mode_logger.innerHTML = JSON.stringify(timestampObject);
        }
        return timestampObject;
    }


    /**
     * Format a line to fetch the question form it
     * @param {string} line 
     * @returns {string|void}
     */
    function formatQuestion(line = null) {
        if (line) {
            let question = line.split('?')[1];
            return question;
        }
        return;
    }


    /**
     * Read the file content of the .txt file
     * @param {url} source 
     * @returns {Array}
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

    /**
     * Find the action that corresponds with the particular frame of video {page|popup}
     * @param {object} data 
     * @returns {void}
     */
    function findVideoFrame(data) {
        if (data.page.includes('question')) {
            VIDEO_PLAYER.pause();
            let question = formatQuestion(data.page);
            openQuestionModal(question);
            return;
        }
        if (data.page !== globalSlideNumber) {
            globalSlideNumber = data.page;
            queueRenderPage(data.page);
            return;
        }
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
            modal__submit__btn.addEventListener('click', function () {
                answerQuestion(document.getElementById('question__answer').value)
            });
            modal__close__btn.addEventListener('click', function () {
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
     * Listen if video is playing and watch for timestamp
     * @param {Array} timestamps 
     * @returns {void}
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
        VIDEO_PLAYER.addEventListener('pause', function () {
            clearInterval(interval)
        });

    }

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

    mountVideo(Array.isArray(DATA) ? DATA[0] : DATA)
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

window.videoBookMark = init