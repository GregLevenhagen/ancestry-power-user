function scrollSpecifiedTimes(index) {
    setTimeout(function myIdentifier() {
        window.scrollTo(0, document.body.scrollHeight);
        const logPort = chrome.runtime.connect({ name: 'log' });
        logPort.postMessage({ content: `[${index}] scrolling...` });
        --index;
        if (!continueScrolling) {
            logPort.postMessage({ content: `scrolling cancelled` });
            clearTimeout(myIdentifier);
        } else if (index > 0) {
            setTimeout(myIdentifier, 5000);
        } else {
            logPort.postMessage({ content: `scrolling finished` });
            // TODO: get button to change back
            clearTimeout(myIdentifier);
        }
    }, 5000);
}

chrome.runtime.onMessage.addListener(async function (request, _sender, sendResponse) {
    if (request.continueScrolling != undefined) {
        // continueScrolling is a var set in popup.js
        continueScrolling = request.continueScrolling;
        sendResponse({ message: `request to cancel scrolling received` });
    }
});

// scrollNumber is a var set in popup.js
scrollSpecifiedTimes(scrollNumber);
