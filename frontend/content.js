// this is the content script runs when the panel is activated.
// this script serves as the brigde between app page script(inject and hook) and the backend script 
var port = chrome.runtime.connect({
    name: "injectToBackCon"
});

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
injectScript(chrome.extension.getURL('frontend/inject.js'), 'body');

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        port.postMessage(event.data.data);
    }
}, false);
