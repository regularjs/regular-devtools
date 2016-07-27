// background.js, runs presistently
// inject content script for devtools page
// pass message from content script to devtools page
var connection;
var prefix = "[Regular Devtools] ";

chrome.runtime.onConnect.addListener(function(panelConnection) {
    var injectListener = function(message, sender, sendResponse) {
            // Inject a content script into the identified tab
            chrome.tabs.executeScript(message.tabId, {
                file: message.scriptToInject
            });
            console.log(prefix + "Content script injected.");
        }
        // add the listener
        // 
    if (panelConnection.name == "devToBackCon") {
        connection = panelConnection;
        panelConnection.onMessage.addListener(injectListener);
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
            if (changeInfo.status === "complete") {
                console.log(prefix + "Backend send pageReload event");
                connection.postMessage({
                    type: "pageReload",
                    tabId: tabId
                })
            }
        })
        return;
    }

    // Receive message from content script and relay to the devTools page for the
    // current tab
    if (panelConnection.name === "injectToBackCon") {
        panelConnection.onMessage.addListener(function(request, sender, sendResponse) {
            console.log(prefix +"Backend received message:" + request.type)
            connection.postMessage(request);
            return true;
        });
    }

});
