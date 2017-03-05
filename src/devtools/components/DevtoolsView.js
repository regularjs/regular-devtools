import Regular from 'regularjs';
import SidebarView from './SidebarView';
import ElementView from './ElementView';
import {findElementByUuid, searchPath, printInConsole} from '../utils';

// Regular components for devtools' UI
const DevtoolsViewComponent = Regular.extend({
    template: `
        <div class='regualrDevtools'>
            <div class='devtoolsHeader no-space'>
                <div class="devtoolsHeader-container logo">
                    Regular Devtools
                </div>
                <div class="devtoolsHeader-container refresh">
                    <img src='/assets/refresh.svg' on-click={this.onRefresh()} class='devtoolsHeader-refresh' title="Refresh"/>
                </div>
            </div>
            <div class="devtoolsMain">
                <ElementView ref=elementView isolate />
                <SidebarView ref=sidebarView isolate />
            </div>
        </div>
    `,
    onRefresh: function() {
        chrome.devtools.inspectedWindow.reload();
    },
    focusNode: function(uuid) {
        var elementViewDOM = document.querySelector(".elementTree");
        var elementViewRect = elementViewDOM.getBoundingClientRect();
        var evHeight = elementViewRect.height;
        var node = findElementByUuid(this.data.nodes, uuid);
        var path = [];
        var i;
        var currTop;
        let lastSelected = this.data.lastSelected;
        const sidebarView = this.$refs.sidebarView;
        const elementView = this.$refs.elementView;

        sidebarView.data.currentNode = node;
        sidebarView.$update();
        searchPath(elementView._children, uuid, path);
        for (i = 0; i < path.length; i++) {
            path[i].data.opened = true;
        }
        if (lastSelected) {
            lastSelected.data.selected = false;
        }
        this.data.lastSelected = path[0];
        path[0].data.selected = true;
        printInConsole(uuid);
        elementView.$update();
        currTop = path[0].group.children[0].last().getBoundingClientRect().top;
        if ((currTop > evHeight) || (currTop < 0)) {
            if (currTop < 0) {
                elementViewDOM.scrollTop = Math.abs(currTop);
            } else {
                elementViewDOM.scrollTop += (currTop - evHeight);
            }
        }
    }
});

DevtoolsViewComponent.component('SidebarView', SidebarView);
DevtoolsViewComponent.component('ElementView', ElementView);

export default DevtoolsViewComponent;
