import Regular from 'regularjs';
import {findElementByUuid} from '../utils';

const Element = Regular.extend({
    template: `
        <div class="element purple {selected ? 'selected' : 'element-tag'}"
        style="padding-left:{level*30}px;}" on-click={this.onClick(node)} on-mouseenter={this.onMouseEnter(node.uuid, node.inspectable)}>
            <div class="borderline"></div>
            <img src="/dist/static/media/arrow.svg"
            style="margin-left: -10px;"
            alt="arrow" on-click={opened = !opened}
            class="arrow ele-item {opened ? 'arrow-down' : null} {node.childNodes.length > 0 ? '': 'hide'}"/>
            <span class="tag ele-item">&lt;</span>
            <span class="tagname ele-item { node.name === '[anonymous]' ? 'is-anonymous' : '' }">{node.name}</span>
            <span class="tag ele-item">&gt;{#if node.shadowFlag }<span class="ele-include">#inc</span>{/if}</span>
        </div>
        {#if node.childNodes.length > 0} {#list node.childNodes as n}
        <div style={opened ? '' : "display:none;"} class={node.shadowFlag ? 'include-border':null}>
            <element node={n} level={level+1} ></element>
        </div>
        {/list}
        {/if}
        {#if node.childNodes.length > 0}
        <div class="element purple"
        style="padding-left:{level*30}px;{opened ? null : 'display:none;'}">
            <span class="tag ele-item">&lt;/</span>
            <span class="tagname ele-item { node.name === '[anonymous]' ? 'is-anonymous' : '' }">{node.name}</span>
            <span class="tag ele-item">&gt;</span>
        </div>
        {/if}
    `,
    data: {
        selected: false,
        opened: false
    },
    onMouseEnter: function(uuid, inspectable) {
        // Communication between two components(not directly related), should refactor using eventbus.
        this.$root.$refs.sidebarView.highLightNode(uuid, inspectable);
    },
    onClick: function(node) {
        let lastSelected = this.$root.data.lastSelected;
        if (lastSelected) {
            if (lastSelected === this) {
                return;
            }

            if (!findElementByUuid(this.$root.data.nodes, lastSelected.data.node.uuid)) {
                this.$root.data.lastSelected = null;
            } else {
                lastSelected.data.selected = false;
            }
        }
        this.data.selected = true;
        this.$root.data.lastSelected = this;
        this.$root.$emit("clickElement", node.uuid);
    }
});

Element.component('element', Element);

export default Element;
