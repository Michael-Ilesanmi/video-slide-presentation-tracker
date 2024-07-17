import { flushContainer, mountOnContainer } from "./containers.js";
import { play } from "./video.js";

const custom__modal__container = document.createElement('div');
custom__modal__container.id = 'custom__modal__container';
const custom__modal = `<div id="custom__modal">
            <button id="modal__close__btn">X</button>
            <h3>This is a question box!</h3>
            <p id="question__position"></p>
            <form onsubmit="return false;" id="user__response__form">
            <fieldset id="user__response__field">
            </fieldset>
            <button type="submit" id="modal__submit__btn">Submit</button>
            </form>
    </div>`;


/**
     * Open the modal when there is a question on the timestamp
     * @param {string} question 
     * @returns {void}
     */
function openModal(question) {
    question = formatQuestion(question)    
    mountOnContainer(document.body, custom__modal__container)
    custom__modal__container.style.display = 'flex';
    custom__modal__container.innerHTML = custom__modal;
    let question__position = document.querySelector('#question__position');
    question__position.innerHTML = question.question ?? "";


    let response;

    switch (question.type) {
        case 'text':
            response = createTextField()
            break;
        case 'radio':
            response = createRadio(question.options)
            break;
        case 'checkbox':
            response = createCheckBox(question.options)
            break;
    
        default:
            response = createTextField()
            break;
    }

    let modal__submit__btn;
    let modal__close__btn;
    setTimeout(() => {
        modal__submit__btn = document.querySelector('#modal__submit__btn');
        modal__close__btn = document.querySelector('#modal__close__btn');
        modal__submit__btn.addEventListener('click', function () {
            handleModalResponse(question.type)
        });
        modal__close__btn.addEventListener('click', function () {
            play()
            custom__modal__container.style.display = 'none';
        });
    }, 1000);
    return;
}

/**
     * Format a line to fetch the question form it
     * @param {string} line 
     * @returns {string|void}
     */
function formatQuestion(line = null) {
    if (line) {
        let question = line.split('?')[1];
        question = question.replace(/'/g, '"');
        question = JSON.parse(question)
        return question;
    }
    return;
}

function createCheckBox (options = []) {
    let checkboxes = document.querySelector('#user__response__field');
    checkboxes.style.display = 'flex';
    options.forEach(option => {
        let label = document.createElement('label')
        let span = document.createElement('span')
        span.innerText = option;
        let checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox')
        checkbox.setAttribute('name', 'form_response')
        checkbox.setAttribute('value', option)
        label.appendChild(checkbox)
        label.appendChild(span)
        checkboxes.append(label)  
    });
    return checkboxes;
}

function createRadio (options = []) {
    let radios = document.querySelector('#user__response__field');
    radios.style.display = 'flex';
    options.forEach(option => {
        let label = document.createElement('label')
        let span = document.createElement('span')
        span.innerText = option;
        let radio = document.createElement('input');
        radio.setAttribute('type', 'radio')
        radio.setAttribute('name', 'form_response')
        radio.setAttribute('value', option)
        label.appendChild(radio)
        label.appendChild(span)
        radios.append(label)  
    });
    return radios;
}

function createTextField () {
    let textFieldContainer = document.querySelector('#user__response__field');
    textFieldContainer.style.display = 'flex';
    let textField = document.createElement('input');
    textField.setAttribute('type', 'text')
    textField.setAttribute('name', 'form_response')
    textField.setAttribute("placeholder", "Enter your response");
    textFieldContainer.append(textField)  
    return textFieldContainer;
}

/**
 * Submit a users response to a pop-up question
 * @param {string} response 
 * @returns 
 */
function handleModalResponse(type) {
    let response;
    switch (type) {
        case 'text':
            response = document.querySelector('#user__response__field input').value;
            break;
        case 'radio':
            response = document.querySelector('#user__response__field input:checked').value;
            break;
        case 'checkbox':
            response = [];
            let checkboxes = document.querySelectorAll('#user__response__field input:checked');
            checkboxes.forEach(checkbox => {
                response.push(checkbox.value)
            });
            break;    
        default:
            response = ''
            break;
    }
    if (response.length < 1) {
        return alert("Please enter a response");
    }
    custom__modal__container.style.display = 'none';
    play();
    return postResponse(response);
}

async function postResponse(response) {
    console.info(response)
    return;
}

export {
    openModal,
    handleModalResponse
}