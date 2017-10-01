import Regular from 'regularjs';
import Element from './Element';
import Search from './Search';
import './Elements.css';

const Elements = Regular.extend({
    template: `
        <div class='elementView' on-mouseleave={this.onMouseLeave()}>
            <div class="elementTree">
                {#if loading }
                    <div class="loading-img">
                        <div r-md="" class="mdl-spinner mdl-js-spinner is-active"></div>
                    </div>
                {#else}
                {#if nodes.length > 0}
                    {#list nodes as node}
                        {#if node.hasTemplate && node.hasInjected}
                        <element node={node} level={1}></element>
                        {/if}
                    {/list}
                {#else}
                    <div class="warnning roboto">There is no Regular instance detected. Please check if you are using the latest version of Regularjs. Or try reloading Regular Devtools</div>
                {/if}
            {/if}
            </div>
            <search isolate ref=searchView />
        </div>
    `,
    data: {
        nodes: [],
        loading: true
    },
    onMouseLeave: function() {
        this.$root.$refs.sidebarView.highLightNode(null, false);
    }
});

Elements.component('element', Element);
Elements.component('search', Search);

export default Elements;
