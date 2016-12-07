// background.js, runs presistently
// inject content script for devtools page
// pass message from content script to devtools page
var prefix = "[Regular Devtools] ";
var injectToBackConnection;

// for every page's different injectToBackConnection to its devToBackConnection  according to tab.id
var devToBackConMap = {};

var injectListener = function(message, sender, sendResponse) {
    // Inject a content script into the identified tab
    chrome.tabs.executeScript(message.tabId, {
        file: message.file
    });
    console.log(prefix + "Content script injected.");
};

// cannot put in onConnect.addListener() for everyConnect add one  callbackFun
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.status === "complete") {
        console.log(prefix + "Backend send pageReload event");

        devToBackConMap[tabId].postMessage({
            type: "pageReload",
            tabId: tabId
        });
    }
});

chrome.runtime.onConnect.addListener(function(connection) {
    // add the listener
    if (connection.name.indexOf("devToBackCon") !== -1) {
        var tabId = connection.name.split('_')[1];
        console.log("dev2Back get connect with tabId: " + tabId);
        devToBackConMap[tabId] = connection;
        devToBackConMap[tabId].onMessage.addListener(injectListener);
        return;
    }

    // Receive message from content script and relay to its devTools page according sender  tab.id
    if (connection.name === "injectToBackCon") {
        injectToBackConnection = connection;
        console.log(prefix + "injectToBack Connection established.", connection);
        injectToBackConnection.onMessage.addListener(function(request, sender, sendResponse) {
            console.log(prefix + "Backend received message:" + request.type);
            console.log("inject2Back sent info with tabId: " + sender.sender.tab.id);
            devToBackConMap[sender.sender.tab.id].postMessage(request);
            return true;
        });
    }
});
