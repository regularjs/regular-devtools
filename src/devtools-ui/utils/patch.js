import {findElementByUUIDNonRecursive} from "./findElement";

// reuse old nodes
export default function patch(oldArr, newArr) {
    const container = [];
    for (var i = 0; i < newArr.length; i++) {
        var newNode = newArr[i];
        var oldNode = findElementByUUIDNonRecursive(oldArr, newArr[i].uuid);
        if (oldNode) {
            if (JSON.stringify(oldNode) !== JSON.stringify(newNode)) {
                oldNode.name = newNode.name;
                oldNode.isIncluded = newNode.isIncluded;
                oldNode.childNodes = patch(oldNode.childNodes, newNode.childNodes, []);
            }
            container.push(oldNode);
        } else {
            container.push(newNode);
        }
    }
    return container;
}
