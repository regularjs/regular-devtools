import log from '../../shared/log';

export default function(uuid) {
    chrome.devtools.inspectedWindow.eval(
        `devtoolsModel.print(${JSON.stringify(uuid)})`,
        function(result, isException) {
            if (isException) {
                log("Inspect Error: ", isException);
            }
        }
    );
}
