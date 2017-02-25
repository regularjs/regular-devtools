const searchPath = function(nodes, uuid, path) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].data.node.uuid === uuid) {
            path.push(nodes[i]);
            return true;
        } else if (nodes[i]._children.length > 0) {
            if (searchPath(nodes[i]._children, uuid, path)) {
                path.push(nodes[i]);
                return true;
            }
        }
    }
    return false;
};

export default function searchPathWarpper(nodes, uuid, path) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].data.node.uuid === uuid) {
            path.push(nodes[i]);
            return path;
        } else if (searchPath(nodes[i]._children, uuid, path)) {
            path.push(nodes[i]);
            return path;
        }
    }
}
