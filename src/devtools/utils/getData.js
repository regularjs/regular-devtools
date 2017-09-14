import log from '../../shared/log';

function getData(uuid) {
    var node = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(n) {
        return n.uuid === uuid;
    })[0];
    return window.devtoolsModel.stringify({
        name: node.name || "[anonymous]",
        uuid: uuid,
        data: node.data,
        computed: window.devtoolsModel.fetchComputedProps(node)
    });
}

const getDataStr = getData.toString();

export default function(uuid) {
    return new Promise((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(
            `(${getDataStr})(${JSON.stringify(uuid)})`,
            function(result, isException) {
                if (isException) {
                    log("Get Data Error: ", isException);
                    reject(isException);
                    return;
                }
                resolve(result);
            }
        );
    });
}
