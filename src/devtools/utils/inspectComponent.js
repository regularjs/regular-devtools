import log from '../../shared/log';

function inspectComponent(type) {
    if (type === "enter") {
        window.devtoolsModel.enterInspectMode();
    }else {
        window.devtoolsModel.exitInspectMode();
    }
}

const funcStr = inspectComponent.toString();

export function enter() {
    return new Promise((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(
            `(${funcStr})('enter')`,
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

export function exit() {
    return new Promise((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(
            `(${funcStr})('exit')`,
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