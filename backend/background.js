// background.js, runs presistently
// inject content script for devtools page
// pass message from content script to devtools page
var devToBackConnection;
var injectToBackConnection;
var prefix = "[Regular Devtools] ";

chrome.runtime.onConnect.addListener(function(connection) {
    var injectListener = function(message, sender, sendResponse) {
            // Inject a content script into the identified tab
            chrome.tabs.executeScript(message.tabId, {
                file: message.file
            });
            console.log(prefix + "Content script injected.");
        }
        // add the listener
    if (connection.name == "devToBackCon") {
        devToBackConnection = connection;
        devToBackConnection.onMessage.addListener(injectListener);
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
            if (changeInfo.status === "complete") {
                console.log(prefix + "Backend send pageReload event");
                devToBackConnection.postMessage({
                    type: "pageReload",
                    tabId: tabId
                })
            }
        })
        return;
    }

    // Receive message from content script and relay to the devTools page for the
    // current tab
    if (connection.name === "injectToBackCon") {
        injectToBackConnection = null;
        injectToBackConnection = connection;
        console.log(prefix + "injectToBack Connection established.", connection)
        injectToBackConnection.onMessage.addListener(function(request, sender, sendResponse) {
            console.log(prefix + "Backend received message:" + request.type)
            devToBackConnection.postMessage(request);
            return true;
        });
    }

});
