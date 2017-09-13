import Regular from 'regularjs';
import SidebarView from './SidebarView';
import ElementView from './ElementView';
import {searchPath, printInConsole, enter, exit, openNewTab} from '../utils';

// Regular components for devtools' UI
const DevtoolsViewComponent = Regular.extend({
    template: `
        <div class="regualrDevtools">
            <div class="devtoolsHeader roboto">
                <div class="devtoolsHeader__logo">
                    Regular Devtools
                </div>
                <div class="devtoolsHeader__toolbar">
                    <div class="mdl-tooltip" data-mdl-for="tt3">Select a DOM node to inspect its component</div>
                    <img r-md="" id='tt3' src="/assets/target{inspecting ? '_active' : '' }.svg" on-click={this.onInspect()} class="devtoolsHeader-item"/>
                    <div class="mdl-tooltip" data-mdl-for="tt1">Reload</div>
                    <img r-md="" id='tt1' src='/assets/refresh.svg' on-click={this.onRefresh()} class="devtoolsHeader-item"/>
                    <div class="mdl-tooltip" data-mdl-for="tt4">Visit project homepage for detailed documentation</div>
                    <img r-md="" id='tt4' src='/assets/github.svg' on-click={this.onGithubClicked()} class="devtoolsHeader-item"/>
                </div>
            </div>
            <div class="devtoolsMain">
                <ElementView ref=elementView isolate />
                <SidebarView ref=sidebarView isolate />
            </div>
        </div>
    `,
    data: {
        inspecting: false
    },
    onGithubClicked: function() {
        openNewTab("https://github.com/regularjs/regular-devtools");
    },
    onInspect: function() {
        if (this.data.inspecting) {
            this.data.inspecting = false;
            this.$refs.sidebarView.$emit("lockHighLight", false);
            exit();
        } else {
            this.data.inspecting = true;
            this.$refs.sidebarView.$emit("lockHighLight", true);
            enter();
        }
        this.$update();
    },
    onRefresh: function() {
        chrome.devtools.inspectedWindow.reload();
    },
    focusNode: function(uuid) {
        const elementViewDOM = document.querySelector(".elementTree");
        const elementView = this.$refs.elementView;
        const relativeOffset = elementView._children[0].group.children[0].last().getBoundingClientRect().top;
        // unselect last selected
        if (this.data.lastSelected) {
            this.data.lastSelected.data.selected = false;
        }

        // update sidebarView
        this.$emit("clickElement", uuid);

        // update elementView
        const path = [];
        searchPath(elementView._children, uuid, path);
        for (let i = 0; i < path.length; i++) {
            path[i].data.opened = true;
        }
        this.data.lastSelected = path[0];
        path[0].data.selected = true;
        printInConsole(uuid);
        elementView.$update();

        // scroll into view
        const currTop = path[0].group.children[0].last().getBoundingClientRect().top;
        console.log(currTop);
        elementViewDOM.scrollTop = currTop - relativeOffset;
    }
});

DevtoolsViewComponent.component('SidebarView', SidebarView);
DevtoolsViewComponent.component('ElementView', ElementView);

export default DevtoolsViewComponent;
