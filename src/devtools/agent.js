import mitt from 'mitt';
import port from './port';

class Agent {
    constructor() {
        Object.assign(this, mitt());

        port.onMessage.addListener(message => {
            switch (message.type) {
            case 'dataUpdate':
                this.emit('dataUpdate');
                break;
            case 'reRender':
                this.emit('reRender', message.nodes);
                break;
            case 'initNodes':
                this.emit('initNodes', message.nodes);
                break;
            case 'currNodeChange':
                this.emit('currNodeChange', message.uuid);
                break;
            case 'pageReload':
                this.emit('pageReload', message.tabId);
                break;
            default:
                // skip
            }
        });

        // listen for messge when switch from element tab to regular tab
        window.addEventListener("message", event => {
            if (event.data.type === "currNodeChange") {
                this.emit("currNodeChange", event.data.uuid);
            }
        }, false);
    }

    injectContentScript(tabId) {
        port.postMessage({
            tabId: tabId || chrome.devtools.inspectedWindow.tabId,
            file: "/src/frontend/content.js"
        });
    }
}

export default new Agent();
