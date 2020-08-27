// labeltitle is the human created group name
async function markTheGroups(labelTitle) {
    let index = 0;
    let newlyChecked = 0;
    const logPort = chrome.runtime.connect({ name: 'log' });
    let groupButtons = document.querySelectorAll(`button[id^=groupAddBtn]`);

    for (let groupButton of groupButtons) {
        continueMarking = await new Promise((resolve, _reject) => {
            chrome.storage.sync.get(`continueMarking`, function (data) {
                resolve(data.continueMarking);
            });
        });

        if (!continueMarking) {
            logPort.postMessage({ content: `total evaluated[${index}] added[${newlyChecked}]\nadding to group cancelled` });
            return;
        }

        groupButton.click();

        // after the groupButton is clicked, the popup is loaded, query into popup
        document.querySelectorAll(`.checkInputLabel`).forEach((label) => {
            // match the row of the popup to our group of interest, there are multiple groups available to check in the popup
            if (label.title === labelTitle) {
                label.parentNode.querySelectorAll(`[id^='groupCallout_cbxTag']`).forEach((chkbx) => {
                    if (!chkbx.checked) {
                        // if not checked, click it to have the site's angular code pick it up and process
                        chkbx.click();
                        ++newlyChecked;
                        logPort.postMessage({ content: `added person[${index}] to group[${label.title}]` });
                    }
                    if (index % 100 == 0 && index > 0) {
                        logPort.postMessage({ content: `added to group [${newlyChecked} / ${index}]` });
                    }
                });
            }
        });

        ++index;
    }

    // TODO: get button to change back
    logPort.postMessage({ content: `total evaluated[${index}] added[${newlyChecked}]` });
}

// groupNamePassThrough is a var set in the popup.js
markTheGroups(groupNamePassthrough);
