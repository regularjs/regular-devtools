import log from '../../shared/log';

export default function printInConsole(uuid) {
    chrome.devtools.inspectedWindow.eval(
        "devtoolsModel.print('" + uuid + "')",
        function(result, isException) {
            if (isException) {
                log("Inspect Error: ", isException);
            }
        }
    );
}
