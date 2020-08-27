let countBtn = document.getElementById(`countButton`);
let scrollBtn = document.getElementById(`scrollButton`);
let markCheckedBtn = document.getElementById(`markCheckedButton`);
let clearLogBtn = document.getElementById(`clearLogButton`);
let logOutput = document.getElementById(`logOutputTextArea`);
const logPort = chrome.runtime.connect({ name: 'log' });

window.addEventListener(`load`, function () {
    initInputElementFromStorage(`scrollNumberInput`, `maximumScrollNumber`);
    initInputElementFromStorage(`groupNameInput`, `groupName`);
    initReadOnlyElementFromStorage(logOutput, `logHistory`);
});

scrollBtn.onclick = function (e) {
    chrome.storage.sync.get(`maximumScrollNumber`, function (data) {
        if (scrollBtn.innerText == `Stop scrolling`) {
            scrollBtn.style.backgroundColor = `#00ffff`;
            scrollBtn.innerText = `Scroll to the bottom`;

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { continueScrolling: false }, function (response) {
                    addToLogOutput(response.message);
                });
            });
        } else {
            scrollBtn.innerText = `Stop scrolling`;
            scrollBtn.style.backgroundColor = `#ffff99`;

            let logMessage = `Starting to scroll [${data.maximumScrollNumber}] times`;
            logPort.postMessage({ content: logMessage });
            addToLogOutput(logMessage);

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.executeScript(
                    tabs[0].id,
                    {
                        code: `var scrollNumber = ${data.maximumScrollNumber}; var continueScrolling = true;`,
                    },
                    function () {
                        chrome.tabs.executeScript(tabs[0].id, {
                            file: `scrollToBottom.js`,
                        });
                    }
                );
            });
        }
    });
};

countBtn.onclick = function (e) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
            file: `groupButtonCount.js`,
        });
    });
};

clearLogBtn.onclick = function (e) {
    logOutput.value = '';
    const clearPort = chrome.runtime.connect({ name: `clear` });
    clearPort.postMessage({ content: 'clearLog' });
};

markCheckedBtn.onclick = function (e) {
    if (markCheckedBtn.innerText == `Stop adding to group`) {
        markCheckedBtn.style.backgroundColor = `#00ffff`;
        markCheckedBtn.innerText = `Add the people on this page to the group`;
        chrome.storage.sync.set({ [`continueMarking`]: false });
    } else {
        markCheckedBtn.innerText = `Stop adding to group`;
        markCheckedBtn.style.backgroundColor = `#ffff99`;

        chrome.storage.sync.set({ [`continueMarking`]: true });

        chrome.storage.sync.get(`groupName`, function (data) {
            let logMessage = `Adding people to group [${data.groupName}]`;
            logPort.postMessage({ content: logMessage });
            addToLogOutput(logMessage);

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.executeScript(
                    tabs[0].id,
                    {
                        code: `var groupNamePassthrough = "${data.groupName}"; var continueMarking = true;`,
                    },
                    function () {
                        chrome.tabs.executeScript(tabs[0].id, {
                            file: `markChecked.js`,
                        });
                    }
                );
            });
        });
    }
};

function initInputElementFromStorage(elementName, storageKey) {
    let element = document.getElementById(elementName);

    chrome.storage.sync.get(storageKey, function (data) {
        element.value = data[storageKey];
        logPort.postMessage({ content: `${storageKey} is [${element.value}]` });
    });

    element.addEventListener(`change`, function () {
        chrome.storage.sync.set({ [`${storageKey}`]: element.value }, function () {
            logPort.postMessage({ content: `${storageKey} set [${element.value}]` });
        });
    });
}

function initReadOnlyElementFromStorage(element, storageKey) {
    chrome.storage.sync.get(storageKey, function (data) {
        if (data[storageKey] != null) {
            element.value = data[storageKey];
            let logMessage = `${storageKey} has been loaded`;
            logPort.postMessage({ content: logMessage });
            addToLogOutput(logMessage);
            logOutput.scrollTop = logOutput.scrollHeight;
        }
    });
}

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == `log`) {
        port.onMessage.addListener(function (message) {
            addToLogOutput(message.content);
        });
    }
});

function addToLogOutput(message) {
    logOutput.value += `\n` + message;
    logOutput.scrollTop = logOutput.scrollHeight;
}
