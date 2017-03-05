import Regular from 'regularjs';
import {findElementByName} from '../utils';

const SearchView = Regular.extend({
    template: `
        <div class="searchView">
            <input type="text" r-model={value} on-enter={this.onEnter()} on-input={this.onInput()} class="searchView-input" placeholder="Search By Component Name"/>
            <div class="searchView-btns">
                <div class="searchView-text">
                    {#if hasSearched && !resultList.length}
                        Not found
                    {#else}
                        {#if resultList.length}
                            {index + 1}/{resultList.length} found
                        {/if}
                    {/if}
                </div>
                <img src="/assets/search.svg" class="searchView-btn" on-click={this.search()} alt="search" title="Search"/>
                <img src="/assets/prev.svg" class="searchView-btn" on-click={this.next(-1)} alt="prev" title="Previous result"/>
                <img src="/assets/next.svg" class="searchView-btn" on-click={this.next(1)} alt="next" title="Next result"/>
            </div>
        </div>
    `,
    data: {
        value: "",
        resultList: [],
        index: 0,
        hasSearched: false
    },
    onInput: function() {
        this.data.hasSearched = false;
    },
    onEnter: function() {
        if (this.data.hasSearched) {
            this.next(1);
        } else {
            this.search();
        }
    },
    search: function() {
        if (!this.data.value) {
            return;
        }
        var reg = new RegExp(this.data.value);
        this.data.resultList = [];
        this.data.index = 0;
        findElementByName(this.$root.data.nodes, reg, this.data.resultList);
        this.data.hasSearched = true;
        if (this.data.resultList.length) {
            this.$root.focusNode(this.data.resultList[0]);
        }
    },
    next: function(dir) {
        var data = this.data;
        if (data.resultList.length) {
            data.index += dir;
            if (data.index === data.resultList.length) data.index = 0;
            if (data.index === -1) data.index = data.resultList.length - 1;
            this.$root.focusNode(data.resultList[data.index]);
        }
    },
    reset: function() {
        this.data.value = "";
        this.data.resultList = [];
        this.data.index = 0;
        this.data.hasSearched = false;
        this.$update();
    }
});

export default SearchView;
