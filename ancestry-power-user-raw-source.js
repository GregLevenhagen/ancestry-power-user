// @ts-nocheck
function getGroupButtonCount() {
    console.log(`group button count [${document.querySelectorAll('button[id^=groupAddBtn]').length}]`);
}

function scrollXTimes(i) {
    setTimeout(function () {
        window.scrollTo(0, document.body.scrollHeight);
        console.log(`apu: [${i}] scrolling, scrolling, scrolling...keep those doggies scrollin`);
        if (--i) {
            scrollXTimes(i);
        }
    }, 3000);
}

// labeltitle is the human created group name
function markTheGroups(labeltitle) {
    let index = 0;
    let newlyChecked = 0;
    document.querySelectorAll('button[id^=groupAddBtn]').forEach((groupButton) => {
        groupButton.click();

        // after the groupButton is clicked, the popup is loaded, query into popup
        document.querySelectorAll('.checkInputLabel').forEach((label) => {
            // match the row of the popup to our group of interest, there are multiple groups available to check in the popup
            if (label.title === labeltitle) {
                label.parentNode.querySelectorAll("[id^='groupCallout_cbxTag']").forEach((chkbx) => {
                    if (!chkbx.checked) {
                        // if not checked, click it to have the site's angular code pick it up and process
                        chkbx.click();
                        ++newlyChecked;
                        console.log(
                            `apu: added check - chkbx.checked[${chkbx.checked}] label.title[${label.title}] groupButton.id[${groupButton.id}] index[${index}] newlyChecked[${newlyChecked}]`
                        );
                    } else if (index % 100 == 0) {
                        console.log(`apu: processed - index[${index}] newlyChecked[${newlyChecked}]`);
                    }
                });
            }
        });

        ++index;
    });

    console.log(`apu: done - totalEvaluated[${index}] newlyChecked[${newlyChecked}]`);
}
