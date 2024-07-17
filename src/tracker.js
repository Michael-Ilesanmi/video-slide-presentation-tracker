/**
     * Create an array of objects of the timestamps from the tracking .txt file
     * @returns {Array}
     */
async function parseTrackingFile(file) {
    if (!file) {
        console.warn('Invalid File URL!');
        return;
    }

    let timestampObject = [];
    let content = await getFileContent(file);
    content.forEach(item => {
        timestampObject.push(createTimeStampObject(item));
    });
    return timestampObject;
}


/**
 * Read the file content of the .txt file
 * @param {url} source 
 * @returns {Array}
 */
async function getFileContent(source) {
    let file = await fetch(source)
    let text = await file.text();
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

export {
    parseTrackingFile,
}