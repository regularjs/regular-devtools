export function updateInstanceByUUIDAndPath({uuid, path, value}) {
    // send message to page, update instance by uuid and path
    var fn = function(uuid, path, value) {
        window.postMessage({
            type: 'FROM_CONTENT_SCRIPT',
            action: 'UPDATE_INSTANCE',
            payload: {
                uuid: uuid,
                path: path,
                value: value
            }
        }, '*');
    };
    chrome.devtools.inspectedWindow.eval(
        '(' + fn + ')(' + JSON.stringify(uuid) + ',' + JSON.stringify(path) + ',' + JSON.stringify(value) + ')', {
            useContentScriptContext: true
        },
        function() {}
    );
}
