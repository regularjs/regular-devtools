export default function makeElementTree(nodes, container) {
    for (var i = 0; i < nodes.length; i++) {
        var node = {
            ...nodes[i],
            childNodes: []
        };
        container.push(node);
        if (nodes[i].childNodes.length) {
            makeElementTree(nodes[i].childNodes, node.childNodes);
        }
    }
    return container;
}
