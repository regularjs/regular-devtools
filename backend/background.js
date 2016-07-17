// background.js
var connection;

chrome.runtime.onConnect.addListener(function(panelConnection) {
    console.log('connected')
    var injectListener = function(message, sender, sendResponse) {
            console.log('injected!!')
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
