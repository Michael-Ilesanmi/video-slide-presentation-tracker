function flushContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    return;
}

function mountOnContainer(container, child) {
    container.appendChild(child);
    return;
}

export {
    flushContainer,
    mountOnContainer,
}