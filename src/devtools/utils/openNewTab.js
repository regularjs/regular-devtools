export default function openNewTab(url) {
    return new Promise((resolve, reject) => {
        chrome.tabs.create({url}, function() {
            resolve();
        });
    });
}
