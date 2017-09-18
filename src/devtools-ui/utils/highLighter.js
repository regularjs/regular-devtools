let maskNode;
let labelNode;

const setLabelPositon = function(node, rect) {
    var w = Math.max(document.documentElement.clientWidth,
        window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight,
        window.innerHeight || 0);

    // detect if rect resides in the viewport
    if (rect.top >= 0 && rect.top <= h && rect.left >= 0 && rect.left <= w) {
        // set vertical
        if (rect.top > 34) {
            node.style.top = window.scrollY + rect.top - 29 + "px";
        } else if ((h - rect.top - rect.height) > 34) {
            node.style.top = window.scrollY + rect.top + rect.height + 5 + "px";
        } else {
            node.style.top = window.scrollY + rect.top + "px";
        }

        // set horizontal
        if (rect.left > 120) {
            node.style.left = rect.left + "px";
        } else if ((h - rect.left - rect.width) > 120) {
            node.style.left = rect.left + "px";
        } else {
            node.style.left = rect.left + "px";
        }
    } else {
        if (rect.top < 0) {
            node.style.top = window.scrollY + "px";
        } else if (rect.top > h) {
            node.style.top = window.scrollY + h - 24 + "px";
        }

        if (rect.left < 0) {
            node.style.left = window.scrollX + "px";
        } else if (rect.left > w) {
            node.style.left = window.scrollX + w - 100 + "px";
        }

        if (!node.style.left) node.style.left = rect.left + "px";
        if (!node.style.top) node.style.top = rect.top + "px";
    }
};

export function clearMask() {
    if (maskNode) {
        document.querySelector("body").removeChild(maskNode);
        document.querySelector("body").removeChild(labelNode);
        maskNode = null;
        labelNode = null;
    }
}

export function highLightNode(domNode, name) {
    var rect = domNode.getBoundingClientRect();
    clearMask();

    // draw mask
    maskNode = document.createElement("div");
    maskNode.style.position = "absolute";
    maskNode.style.left = rect.left + "px";
    maskNode.style.top = rect.top + window.scrollY + "px";
    maskNode.style.width = rect.width + window.scrollX + "px";
    maskNode.style.height = rect.height + "px";
    maskNode.style.backgroundColor = "rgba(145, 183, 228, 0.6)";
    maskNode.style.zIndex = 999999;
    maskNode.style.pointerEvents = "none";
    document.querySelector("body").appendChild(maskNode);

    // draw label
    var demensionStr = "\n" + rect.width.toFixed(0) + "×" + rect.height.toFixed(0);
    labelNode = document.createElement("div");
    labelNode.textContent = name + demensionStr;
    labelNode.style.backgroundColor = "#272931";
    labelNode.style.color = "#fff";
    labelNode.style.position = "absolute";
    labelNode.style.padding = "0 10px";
    labelNode.style.height = "24px";
    labelNode.style.lineHeight = "24px";
    labelNode.style.fontSize = "12px";
    labelNode.style.borderRadius = "2px";
    labelNode.style.zIndex = 999999;
    setLabelPositon(labelNode, rect);
    document.querySelector("body").appendChild(labelNode);
}
