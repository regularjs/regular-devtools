import log from '../../shared/log';

export default function showDefinitionByUUID(uuid) {
    chrome.devtools.inspectedWindow.eval(
        `
            var node = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(n) {
                return n.uuid === '${uuid}'
            })[0];
            if (node) {
                var proto = node.__proto__;
                var hasConfig = proto.hasOwnProperty('config') && typeof proto.config === 'function';
                var hasInit = proto.hasOwnProperty('init') && typeof proto.init === 'function';

                var found = false
                if (hasConfig) {
                    inspect(proto.config);
                } else if (hasInit) {
                    inspect(proto.init);
                } else {
                    for(var i in proto) {
                        if (i !== 'constructor' && proto.hasOwnProperty(i) && typeof proto[i] === 'function') {
                            inspect(proto[i]);
                            found = true;
                            break;
                        }
                    }

                    if(!found){
                        inspect(proto.constructor);
                    }
                }
            }
        `,
        function(result, isException) {
            if (isException) {
                log("Show definition Error: ", isException);
            }
        }
    );
}
