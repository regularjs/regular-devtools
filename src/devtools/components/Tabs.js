import Regular from 'regularjs';

const Tabs = Regular.extend({
    template: `
        <div class="tabs">
            <div class="tabs-header">
                <div class="tabs-header-items">
                    {#list source as s}
                        {#if s.key === "data" }
                          <div class="mdl-tooltip roboto" data-mdl-for="ttl2">The data object is passed to Devtools by IPC, so DOM object and function in data object can't be viewed here. Please inspect $r in the console for the original data object.</div>
                          <div r-md=""  class="tabs-header-item" id="ttl2" on-click="{ this.onTabClick( s.key ) }">
                          { s.text }
                          </div>
                        {#else}
                          <div class="tabs-header-item" on-click="{ this.onTabClick( s.key ) }">
                            { s.text }
                          </div>
                        {/if}
                    {/list}
                    <div class="tab-indicator" style="{ 'transform:translateX(' + currentIndex*60 + 'px)'}"></div>
                </div>
            </div>
        </div>
    `,
    onTabClick: function(key) {
        if (this.data.selected === key) {
            return;
        }
        this.$emit('change', key);
    }
});

export default Tabs;
