export default function openNewTab(url) {
    return new Promise((resolve, reject) => {
        chrome.tabs.create({
            url: url
        }, function () {
            resolve()
        });
    });
}
