// background.js, runs presistently
// inject content script for devtools page
// pass message from content script to devtools page
var connection;

chrome.runtime.onConnect.addListener(function(panelConnection) {
    var injectListener = function(message, sender, sendResponse) {
            // Inject a content script into the identified tab
            chrome.tabs.executeScript(message.tabId, {
                file: message.scriptToInject
            });
        }
        // add the listener
        // 
    if (panelConnection.name == "devToBackCon") {
        connection = panelConnection;
        panelConnection.onMessage.addListener(injectListener);
        return;
    }
        
    // Receive message from content script and relay to the devTools page for the
// current tab
    if (panelConnection.name === "injectToBackCon") {
        panelConnection.onMessage.addListener(function(request, sender, sendResponse) {
            console.log("backend received message", request)
            connection.postMessage(request);
            return true;
        });
    }

});
