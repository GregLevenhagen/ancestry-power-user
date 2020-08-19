let logCache = ``;
const MILLISECONDS_PER_MINUTE = 60000;
let lastStorageWrite = new Date();

chrome.runtime.onInstalled.addListener(function () {
  initStorage(`maximumScrollNumber`, `9`);
  initStorage(`groupName`, `6cM`);
  initStorage(`logHistory`, ``);

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: `ancestry.com` },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name == `clear`) {
    port.onMessage.addListener(function () {
      logCache = "";
      chrome.storage.sync.set({ logHistory: logCache });
      console.log(`log cleared.`);
      lastStorageWrite = new Date();
    });
  }

  if (port.name == `log`) {
    port.onMessage.addListener(function (message) {
      logCache =
        logCache == "" ? message.content : logCache + `\n` + message.content;

      let okayToWrite = isOkayToWriteToStorage();
      console.log(
        `log <${message.content}> and writtenToStorage <${okayToWrite}>`
      );

      if (okayToWrite) {
        chrome.storage.sync.get(`logHistory`, function (data) {
          logCache =
            data.logHistory == "" ? logCache : data.logHistory + logCache;
          if (logCache.length > 7000) {
            // real limit is 8k (8192) - playing it safe
            logCache = logCache.substring(
              Math.max(logCache.length - 7000, 0),
              logCache.length
            );
          }

          chrome.storage.sync.set({ logHistory: logCache });
          console.log(
            `log persisted to storage. logBytesInUse <${logCache.length}>`
          );
          logCache = "";
          lastStorageWrite = new Date();
        });
      }
    });

    port.onDisconnect.addListener(function () {
      console.log(
        `log port onDisconnect - persisting log cache to storage: logCache.length ${logCache.length}`
      );
      logCache = logCache.substring(
        Math.max(logCache.length - 7000, 0),
        logCache.length
      );
      chrome.storage.sync.set({ logHistory: logCache });
    });
  }
});

function isOkayToWriteToStorage() {
  // get the current date time minus 1 minute to compare
  let currentDateTimeMinusThreshold = new Date(
    Date.now() - MILLISECONDS_PER_MINUTE
  );

  // delay writing to storage to avoid limit on 120 writes per minute and limit on 1800 writes per hour
  let storageWriteTimeCompare =
    lastStorageWrite.getTime() < currentDateTimeMinusThreshold.getTime();
  return storageWriteTimeCompare;
}

function initStorage(key, value) {
  chrome.storage.sync.get(key, function (data) {
    console.log(`init <${key}> found is <${data[key]}>`);

    if (data[key] == undefined) {
      chrome.storage.sync.set({ [`${key}`]: value }, function () {
        console.log(`init <${key}> set <${value}>`);
      });
    }
  });
}
