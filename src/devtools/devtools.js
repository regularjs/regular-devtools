// the real devtools script
// the UI layer of devtools
import Regular from "regularjs";
import 'material-design-lite';
import CircularJSON from "../shared/circular-json";
import log from '../shared/log';
import {enter, input, mouseenter, mouseleave} from './events';
import {
    printInConsole,
    findElementByUuid,
    inspectNodeByUUID,
    showDefinitionByUUID,
    updateInstanceByUUIDAndPath,
    evalHighLightNode,
    getData,
    getOthersData,
    makeElementTree,
    syncArr
} from './utils';
import agent from './agent';
import DevtoolsViewComponent from './components/DevtoolsView';

import 'material-design-lite/dist/material.min.css';
import './devtools.css';

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
            let currentNode = findElementByUuid(this.data.nodes, uuid);
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
        this.data.nodes = nodes;
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
            agent.injectContentScript(event.tabId);
            setTimeout(displayWarning, 4000);
        }, 2000);
    })
    .$on("openNewTab", function(url) {
        agent.openInNewTab(url);
    });

sidebarView
    .$on("dataChange", ({uuid, path, value}) => {
        updateInstanceByUUIDAndPath({uuid, path, value});
    })
    .$on("inspectNode", uuid => {
        inspectNodeByUUID(uuid);
    })
    .$on("showDefinition", uuid => {
        showDefinitionByUUID(uuid);
    })
    .$on("highLightNode", ({uuid, inspectable}) => {
        if (!sidebarView.data.lockHighlight) {
            evalHighLightNode(uuid, inspectable);
        }
    })
    .$on("updateData", uuid => {
        getData(uuid).then(data => {
            let currentNode = CircularJSON.parse(data);
            sidebarView.data.currentNode.data = currentNode.data;
            sidebarView.data.currentNode.computed = currentNode.computed;
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

agent.on('dataUpdate', () => devtools.$emit("stateViewReRender"));
agent.on('reRender', nodes => devtools.$emit("elementViewReRender", nodes));
agent.on('initNodes', nodes => devtools.$emit("initNodes", nodes));
agent.on('currNodeChange', uuid => {
    if (ready) {
        devtools.$emit("currentNodeChange", uuid);
    }
});
agent.on('pageReload', tabId => {
    elementView.data.loading = true;
    elementView.$update();
    devtools.$emit("reload", {tabId});
});

agent.injectContentScript();

// waiting 4000ms, if still loading, remove loading and show warning
setTimeout(displayWarning, 4000);
