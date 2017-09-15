// Create a current inspected page unique connection to the background page, by its tabId
export default chrome.runtime.connect({
    name: "devToBackCon_" + chrome.devtools.inspectedWindow.tabId
});
