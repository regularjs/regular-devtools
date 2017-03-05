import Regular from 'regularjs';
import Element from './Element';
import SearchView from './SearchView';

const ElementView = Regular.extend({
    template: `
        <div class='elementView' on-mouseleave={this.onMouseLeave()}>
            <div class="elementTree">
                {#if loading }
                    <img src='/assets/loading.svg' class='loading-img' />
                {#else}
                {#if nodes.length > 0}
                    {#list nodes as node}
                        <element node={node} level={1} >
                        </element>
                    {/list}
                {#else}
                    <div class="warnning">There is no Regular instance detected. Please check if you are using the latest version of Regularjs. Or try reloading Regular Devtools</div>
                {/if}
            {/if}
            </div>
            <searchView isolate ref=searchView ></searchView>
        </div>
    `,
    data: {
        nodes: [],
        loading: true
    },
    onMouseLeave: function() {
        this.$root.$refs.sidebarView.highLightNode(null, false);
    }
})
.component('element', Element)
.component('searchView', SearchView);

export default ElementView;

