import Regular from 'regularjs';
import SidebarPane from './SidebarPane';
import SimpleJsonTree from './SimpleJsonTree';
import JsonTree from './JsonTree';
import Tabs from './Tabs';
import log from '../../shared/log';

const SidebarView = Regular.extend({
    template: `
        <div class="sidebar">
            <div class="sidebar__header roboto">
                <div class="sidebar__header-left">&lt;{currentNode.name}&gt;</div>
                <div class="sidebar__header-right">$r in the console</div>
            </div>
            <Tabs currentIndex={ currentTabIndex } source="{ tabSource }" selected="{ tabSelected }" on-change="{ this.onTabChange( $event ) }"></Tabs>
            <div class="sidebar__content">
                {#if tabSelected == 'data'}
                <div>
                    {#if currentNode.inspectable }
                        <div class="sidebar__inspect" on-click={this.onInspectNode(currentNode.uuid)}>
                            inspect
                        </div>
                    {/if}
                    <SidebarPane title="Normal">
                        <JsonTree source="{ currentNode.data }" on-change="{ this.onDataChange($event) }" />
                    </SidebarPane>
                    <SidebarPane title="Computed">
       
                    </SidebarPane>
                </div>
                {#elseif tabSelected == 'others' && currentNode && others}
                <div>
                    <SidebarPane title="filters">
                        <SimpleJsonTree source="{ others._filters }" />
                    </SidebarPane>
                    <SidebarPane title="directives">
                        <SimpleJsonTree source="{ others._directives }" />
                    </SidebarPane>
                    <SidebarPane title="animations">
                        <SimpleJsonTree source="{ others._animations }" />
                    </SidebarPane>
                </div>
                {#else}
                {/if}
            </div>
        </div>
    `,
    config() {
        // defaultValue of currentNode
        this.data.currentNode = {
            name: "",
            uuid: "",
            data: {}
        };
        // others for currentNode
        this.data.others = {};
        this.data.tabSource = [{
            text: "Data",
            key: "data"
        }, {
            text: 'Others',
            key: 'others'
        }];
        // defaults to `data` pane
        this.data.tabSelected = 'data';
    },
    computed: {
        currentTabIndex: {
            get: function(){
               return this.getCurrentTabIndex()
            }
        } 
    },
    getCurrentTabIndex(){
        const source = this.data.tabSource
        for (let i=0;i<source.length;i++) {
            if (this.data.tabSelected === source[i].key) {
                return i
            }
        }
        return 0
    },
    onTabChange(key) {
        this.data.tabSelected = key;
        this.$update();
        log("Tab is Changed to", key);
    },
    onDataChange({path, value}) {
        const uuid = this.data.currentNode.uuid;
        this.$emit('dataChange', {uuid, path, value});
    },
    onInspectNode(uuid) {
        this.$emit('inspectNode', uuid);
    },
    highLightNode(uuid, inspectable) {
        this.$emit('highlightNode', {uuid, inspectable});
    }
});

SidebarView.component('SidebarPane', SidebarPane);
SidebarView.component('SimpleJsonTree', SimpleJsonTree);
SidebarView.component('Tabs', Tabs);
SidebarView.component('JsonTree', JsonTree);

export default SidebarView;
