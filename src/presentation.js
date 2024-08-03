import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs'; // import pdf.js library
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.mjs'; // register pdfJs worker

let pdfFunction;
let pageRendering = false; // if a pdf rendering is currently in progress {true|false}
let pageNumPending = null; // the pageNumber of the slide that is queue to be rendered {null|Number}
let pdfCanvas; // the HTML <canvas></canvas> element where the pdf will be rendered on
let pdfContext; // the context of the pdf canvas 

const PAGES_NUMBER = document.createElement('p');
PAGES_NUMBER.id = 'pagesNumber';

let PRESENTATION_CANVAS;

const presentationOptions = {
    showPages: true,
    width: 0,
    height: 0,
    scale: 1
}

function mountPresentation(presentation_canvas_id = null, presentation_source = null) {
    PRESENTATION_CANVAS = document.querySelector(presentation_canvas_id);
    if (! PRESENTATION_CANVAS) {
        console.warn('Invalid Presentation Container!')
        return null;
    }

    PRESENTATION_CANVAS.classList.add('custom__pdf__container');

    let presentation_canvas_parent = PRESENTATION_CANVAS.parentElement

    if (!presentation_source) {
        console.warn('Invalid Presentation URL!')
        return null;
    }

    presentationOptions.width = ((PRESENTATION_CANVAS.width ?? 100) * presentation_canvas_parent.offsetWidth) / 100;
    presentationOptions.height = presentationOptions.width * (9/16);

    pdfCanvas = PRESENTATION_CANVAS;
    pdfContext = pdfCanvas.getContext('2d')

    mountPdfCanvas(presentation_source);

    return pdfCanvas;
}

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
        let desiredWidth = presentationOptions.width;
        let viewport = page.getViewport({ scale: 1 });
        let scale = desiredWidth / viewport.width;
        let scaledViewport = page.getViewport({ scale: scale });

        // Prepare canvas using PDF page dimensions
        let canvas = pdfCanvas;
        canvas.width = presentationOptions.width;
        canvas.height = presentationOptions.height;

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
    if (presentationOptions.showPages === true) {
        PAGES_NUMBER.innerHTML = `Page ${current} / ${total}`
    }
}

export {
    mountPresentation,
    queueRenderPage
}