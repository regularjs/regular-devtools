window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__ = (function() {
    var ins = [];
    var printTree = function(arr, level) {
        for (var i = 0; i < arr.length; i++) {
            console.log("--".repeat(level), arr[i].name || 'node');
             if (arr[i]._children) {
                printTree(arr[i]._children, level+1);
            }
        }
    }
    return {
        register: function(obj) {
            ins.push(obj);
        },
        get: function(index) {
            if (index) {
                return ins[index];
            }
            return ins;
        },
        print: function() {
            for (var i = 0; i < ins.length; i++) {
                if (ins[i].parentNode) {
                    console.log('root');
                    printTree(ins[i]._children, 2)
                }
            }
        }
    }
})();
