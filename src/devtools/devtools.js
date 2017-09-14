// the real devtools script
// the UI layer of devtools
import Regular from "regularjs";
import CircularJSON from "../shared/circular-json";
import log from '../shared/log';
import {enter, input, mouseenter, mouseleave} from './events';
import {
    printInConsole,
    findElementByUuid,
    inspectNodeByUUID,
    updateInstanceByUUIDAndPath,
    evalHighLightNode,
    getData,
    getOthersData,
    makeElementTree,
    syncArr
} from './utils';

// components
import DevtoolsViewComponent from './components/DevtoolsView';

// register custom events
Regular.use(enter);
Regular.use(input);
Regular.use(mouseenter);
Regular.use(mouseleave);

// directive for MDL component registeration
Regular.directive('r-md', function(elem, value) {
    componentHandler.upgradeElement(elem);
});

// variables
let ready = false;

// Create a current inspected page unique connection to the background page, by its tabId
const backgroundPageConnection = chrome.runtime.connect({
    name: "devToBackCon_" + chrome.devtools.inspectedWindow.tabId
});

// devtools
const devtools = new DevtoolsViewComponent({
    data: {
        nodes: [],
        lastSelected: null
    }
}).$inject("#app");
// left element view
const elementView = devtools.$refs.elementView;
// right sidebar view
const sidebarView = devtools.$refs.sidebarView;
// searchView
const searchView = elementView.$refs.searchView;

function injectContentScript(tabId) {
    backgroundPageConnection.postMessage({
        tabId: tabId || chrome.devtools.inspectedWindow.tabId,
        file: "/src/frontend/content.js"
    });
}

function displayWarning() {
    if (elementView.data.loading) {
        elementView.data.loading = false;
        elementView.$update();
    }
}

// listen for custom events
devtools
    .$on("initNodes", function(nodesStr) {
        log("On initNodes.");
        let nodes = CircularJSON.parse(nodesStr);
        this.data.nodes = nodes;

        elementView.data.loading = false;
        elementView.data.nodes = makeElementTree(nodes, []);
        elementView.$update();

        // init sidebar
        sidebarView.data.currentNode.name = nodes[0].name;
        sidebarView.data.currentNode.uuid = nodes[0].uuid;
        sidebarView.data.currentNode.inspectable = nodes[0].inspectable;
        sidebarView.$emit('updateData', nodes[0].uuid);
        ready = true;
    })
    .$on("clickElement", function(uuid) {
        if (uuid !== sidebarView.data.currentNode.uuid) {
            let currentNode = findElementByUuid(devtools.data.nodes, uuid);
            sidebarView.data.currentNode.name = currentNode.name;
            sidebarView.data.currentNode.inspectable = currentNode.inspectable;
            sidebarView.data.currentNode.uuid = uuid;
            sidebarView.$emit('updateData', uuid);
            sidebarView.$emit('updateOthersData', uuid);
        }
        printInConsole(uuid);
    })
    .$on("stateViewReRender", function(nodesStr) {
        log("On stateViewRender.");
        sidebarView.$emit('updateData', sidebarView.data.currentNode.uuid);
    })
    .$on("elementViewReRender", function(nodesStr) {
        log("On elementViewRerender.");
        let nodes = CircularJSON.parse(nodesStr);

        // need refactor
        /* eslint-disable no-unused-vars */
        var oldArr = elementView.data.nodes;
        var newArr = makeElementTree(nodes, []);
        elementView.data.nodes = syncArr(oldArr, newArr, []);
        /* eslint-enable no-unused-vars */
        elementView.$update();
    })
    .$on("currentNodeChange", function(uuid) {
        log("On currentNodeChange.");
        if (sidebarView.data.currentNode.uuid !== uuid) {
            devtools.focusNode(uuid);
        }
    })
    .$on("reload", function(event) {
        ready = false;
        log("On reload.");
        searchView.reset();
        // wait for the page to fully intialize
        setTimeout(function() {
            injectContentScript(event.tabId);
            setTimeout(displayWarning, 4000);
        }, 2000);
    })
    .$on("openNewTab", function(url) {
        backgroundPageConnection.postMessage({
            url: url
        });
    });

sidebarView
    .$on("dataChange", ({uuid, path, value}) => {
        updateInstanceByUUIDAndPath({uuid, path, value});
    })
    .$on("inspectNode", uuid => {
        inspectNodeByUUID(uuid);
    })
    .$on("highlightNode", ({uuid, inspectable}) => {
        if (!sidebarView.data.lockHighlight) {
            evalHighLightNode(uuid, inspectable);
        }
    })
    .$on("updateData", uuid => {
        getData(uuid).then(data => {
            let currentNode = CircularJSON.parse(data);
            sidebarView.data.currentNode.data = currentNode.data;
            sidebarView.$update();
        });
    })
    .$on("lockHighLight", flag => {
        sidebarView.data.lockHighlight = flag;
    })
    .$on("updateOthersData", uuid => {
        getOthersData(uuid).then(data => {
            sidebarView.data.others = data;
            sidebarView.$update();
        });
    });

backgroundPageConnection.onMessage.addListener(function(message) {
    if (message.type === "dataUpdate") {
        devtools.$emit("stateViewReRender");
    } else if (message.type === "reRender") {
        devtools.$emit("elementViewReRender", message.nodes);
    } else if (message.type === "initNodes") {
        devtools.$emit("initNodes", message.nodes);
    } else if (message.type === "currNodeChange" && ready) {
        console.log("currNodeChange", message);
        devtools.$emit("currentNodeChange", message.uuid);
    } else if (message.type === "pageReload") {
        elementView.data.loading = true;
        elementView.$update();
        devtools.$emit("reload", {
            tabId: message.tabId
        });
    }
});

// listen for messge when switch from element tab to regular tab
window.addEventListener("message", function(event) {
    if (event.data.type === "currNodeChange" && ready) {
        devtools.$emit("currentNodeChange", event.data.uuid);
    }
}, false);

injectContentScript();

// waiting 4000ms, if still loading, remove loading and show warning
setTimeout(displayWarning, 4000);
