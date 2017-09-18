import log from '../../shared/log';

export function inspectNodeByUUID(uuid) {
    chrome.devtools.inspectedWindow.eval(
        `
            var node = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(n) {
                return n.uuid === '${uuid}'
            })[0];
            if (node) {
                inspect(node.group && node.group.children && node.group.children[0] && node.group.children[0].node && node.group.children[0].node() || node.parentNode);
            }
        `,
        function(result, isException) {
            if (isException) {
                log("Inspect Error: ", isException);
            }
        }
    );
}
