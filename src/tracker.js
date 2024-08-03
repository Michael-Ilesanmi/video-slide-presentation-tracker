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
    // Split the timestamp by colon
    const parts = timestamp.split(':');
    // Initialize variables for hours, minutes, and seconds
    let hours = 0, minutes = 0, seconds = 0;
    // Determine the length of the parts and assign values accordingly
    if (parts.length === 3) {
        // Format hh:mm:ss
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
        seconds = parseInt(parts[2], 10);
    } else if (parts.length === 2) {
        // Format mm:ss
        minutes = parseInt(parts[0], 10);
        seconds = parseInt(parts[1], 10);
    } else if (parts.length === 1) {
        // Format ss
        seconds = parseInt(parts[0], 10);
    } else {
        // Invalid format
        throw new Error('Invalid timestamp format');
    }
    // Convert the total time to seconds
    let totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    return totalSeconds;
}

export {
    parseTrackingFile,
}