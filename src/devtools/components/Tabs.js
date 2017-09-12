import Regular from 'regularjs';

const Tabs = Regular.extend({
    template: `
        <div class="tabs">
            <div class="tabs-header">
                <div class="tabs-header-items">
                    {#list source as s}
                        {#if s.key === "data" }
                          <div class="mdl-tooltip roboto" data-mdl-for="ttl2">
                            the data displayed here is passed from inspected page by IPC, which means only JSON-ifiable object is allowed. If you want to inspect DOM or function in data, please using $r in console
                          </div>
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
