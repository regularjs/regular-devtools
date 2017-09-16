import Regular from 'regularjs';
import {findElementByName} from '../utils';

const SearchView = Regular.extend({
    template: `
        <div class="searchView roboto">
            <div  r-md=""  class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label searchView-md">
                <input class="mdl-textfield__input searchView-md-input" r-model={value} on-enter={this.onEnter()} on-input={this.onInput()} type="text" id="sample3">
                <label class="mdl-textfield__label searchView-md-label" for="sample3">Search By Component Name</label>
            </div>
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
                <img src="/dist/static/media/search.svg" class="searchView-btn" on-click={this.search()} alt="search" title="Search"/>
                <img src="/dist/static/media/prev.svg" class="searchView-btn" on-click={this.next(-1)} alt="prev" title="Previous result"/>
                <img src="/dist/static/media/next.svg" class="searchView-btn" on-click={this.next(1)} alt="next" title="Next result"/>
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
