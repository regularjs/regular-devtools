import log from '../../shared/log';

function getOthersData(uuid) {
    var othersNameArr = ['_directives', '_filters', '_animations'];
    var node = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(n) {
        return n.uuid === uuid;
    })[0];
    if (node) {
        var constructor = node.constructor;
        var result = {};
        for (var prop in constructor) {
            if (constructor.hasOwnProperty(prop) && othersNameArr.indexOf(prop) !== -1) {
                var tempObj = {};
                var curObj = constructor[prop];
                var curUI = constructor.prototype;
                while (curObj && curUI) {
                    var tempArr = [];
                    for (var key in curObj) {
                        if (curObj.hasOwnProperty(key)) {
                            tempArr.push(key);
                        }
                    }
                    /* eslint-disable no-proto, no-loop-func */

                    tempArr.sort(); // same level sort
                    tempArr.forEach(function(value) {
                        if (!tempObj[value]) { // same command big level not show
                            if (curUI.constructor._addProtoInheritCache) {
                                tempObj[value] = "regular";
                            } else if (curUI.reset && !curUI.__proto__.reset && curUI.__proto__.constructor._addProtoInheritCache) {
                                var funStr = curUI.reset.toString();
                                if (funStr.indexOf("this.data = {}") !== -1 && funStr.indexOf("this.config()") !== -1) {
                                    tempObj[value] = "regularUI"; // very low possible be developer's Component
                                } else {
                                    tempObj[value] = curUI.name === undefined ? '' : curUI.name;
                                }
                            } else {
                                tempObj[value] = curUI.name === undefined ? '' : curUI.name; // same level same color
                            }
                        }
                    });
                    curObj = curObj.__proto__;
                    curUI = curUI.__proto__;

                    /* eslint-enable no-proto, no-loop-func*/
                }

                result[prop] = tempObj;
            }
        }
        return result;
    }
}

const getOthersDataStr = getOthersData.toString();

export default function(uuid) {
    return new Promise((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(
            `(${getOthersDataStr})(${JSON.stringify(uuid)})`,
            function(result, isException) {
                if (isException) {
                    log("Inspect Error: ", isException);
                    reject(isException);
                    return;
                }
                resolve(result);
            }
        );
    });
}
