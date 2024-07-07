# Video Bookmark Module

This JavaScript module allows you to create an interactive video player with PDF presentation slides and question pop-ups at specific timestamps. The module utilizes the PDF.js library to render PDF slides and provides a customizable plugin to enhance video presentations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Functions](#functions)
- [Example](#example)
- [Dependencies](#dependencies)

## Installation

To use the module, include it in your project as follows:

```html
<script type="module" src="path/to/module.js"></script>
```

```
import videoPlayer from "path/to/module.js";
```

## Usage

To initialize the video bookmark module, call the init function with the desired options:

```
import videoBookMark from 'path/to/your/module.js';

const options = {
    id: '#your_video_container', // the id of the div where you want the container to be mounted
    tracker: 'txt', // the format of the tracking file {txt|json}
    data: {
        id: "1",
        video_url: "path/to/your/video.mp4",
        presentation_url: "path/to/your/presentation.pdf",
        tracking_url: "path/to/your/tracking.txt", // required if options.tracker === 'txt'
        title: "Your Video Title",
        tracker_json: {
            // JSON object for tracking timestamps and actions
            // required if options.tracker === 'json'
        }
    }
};

videoBookMark(options);

```

## Options

The ```init()``` function accepts an options object with the following properties:

| Option         | Type     | Default                        | Description                                                                 |
|----------------|----------|--------------------------------|-----------------------------------------------------------------------------|
| id             | string   | '#presenting_video_container'  | The ID of the container where the video and slides will be embedded.        |
| tracker        | string   | 'txt'                          | The format of the tracking file. Can be either 'txt' or 'json'.             |
| pages        | boolean   | true                         | Enable display of page number             |
| data           | object   | {}                             | An object containing video and presentation details:                        |
| data.id        | string   |                                | The ID of the video.                                                        |
| data.video_url | string   |                                | The URL of the video file.                                                  |
| data.presentation_url | string |                          | The URL of the PDF presentation.                                            |
| data.tracking_url | string |                               | The URL of the tracking file (required if tracker is 'txt').                |
| data.title     | string   |                                | The title of the video.                                                     |
| data.tracker_json | object |                              | The JSON object for tracking timestamps and actions (required if tracker is 'json'). |


## Example

Here is a complete example of using the module:

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Bookmark Example</title>
</head>
<body>
    <div id="your_video_container"></div>
    <script type="module">
        import videoBookMark from 'path/to/your/module.js';

        const options = {
            id: '#your_video_container',
            tracker: 'json',
            data: {
                id: "1",
                video_url: "path/to/your/video.mp4",
                presentation_url: "path/to/your/presentation.pdf",
                tracking_url: "path/to/your/tracking.txt",
                title: "Your Video Title",
                tracker_json: {
                    // JSON object for tracking timestamps and actions
                }
            }
        };

        videoBookMark(options);
    </script>
</body>
</html>
```

## Dependencies

PDF.js - Used for rendering PDF documents.

```
<script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs"></script>
<script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.mjs';
</script>
```

## License

This software is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).