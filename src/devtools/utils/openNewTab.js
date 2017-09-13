import log from '../../shared/log';

export default function openNewTab(url) {
    return new Promise((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(
            `window.location = '${url}'`,
            function(result, isException) {
                if (isException) {
                    log("Open new tab error: ", isException);
                    reject(isException);
                    return;
                }
                resolve(result);
            }
        );
    });
}
