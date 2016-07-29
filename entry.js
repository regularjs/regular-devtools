// create new panel for devtools
chrome.devtools.panels.create("Regular",
    "./assets/regular.png",
    "panel.html",
    function(panel) {
        panel.onShown.addListener(function(extPanelWindow) {
            chrome.devtools.inspectedWindow.eval(
                "window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.contain($0)",
                function(result, isException) {
                    if (!isException && result) {
                        extPanelWindow.postMessage({
                            type: "currNodeChange",
                            uuid: result
                        }, "*")
                    }
                }
            );
        });
    }
);
