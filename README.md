# Video Bookmark Module

This JavaScript module allows you to create an interactive video player with PDF presentation slides and question pop-ups at specific timestamps. The module utilizes the PDF.js library to render PDF slides and provides a customizable plugin to enhance video presentations.

## Table of Contents

- [Installation](#installation)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

To use the module, include it in your project as follows:

```html
<script type="module" src="path/to/module.js"></script>
```

```
import videoPlayer from "path/to/module.js";
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