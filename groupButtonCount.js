function getGroupButtonCount() {
  let count = document.querySelectorAll(`button[id^=groupAddBtn]`).length;
  const logPort = chrome.runtime.connect({ name: "log" });
  logPort.postMessage({ content: `Number of people on page is [${count}]` });
}

getGroupButtonCount();
