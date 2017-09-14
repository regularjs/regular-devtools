import log from '../../shared/log';

export function evalHighLightNode(uuid, inspectable) {
    var evalStr = inspectable ? "devtoolsModel.highLighter('" + uuid + "')" : "devtoolsModel.highLighter()";
    chrome.devtools.inspectedWindow.eval(
        evalStr,
        function(result, isException) {
            if (isException) {
                log("Inspect Error: ", isException);
            }
        }
    );
}
