export function findElementByUuid(nodes, uuid) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].uuid === uuid) {
            return nodes[i];
        }
        if (nodes[i].childNodes.length) {
            var result = findElementByUuid(nodes[i].childNodes, uuid);
            if (result) {
                return result;
            }
        }
    }
}

export function findElementByUuidNonRecursive(nodes, uuid) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].uuid === uuid) {
            return nodes[i];
        }
    }
}

export function findElementByName(nodes, reg, container) {
    for (var i = 0; i < nodes.length; i++) {
        if (reg.test(nodes[i].name)) {
            container.push(nodes[i].uuid);
        }
        if (nodes[i].childNodes.length) {
            findElementByName(nodes[i].childNodes, reg, container);
        }
    }
}
