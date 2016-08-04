# Regular Developer Tools

Regular Developer Tools is a Chrome Extension that allows real-time inspection of [Regular](http://regularjs.github.io/) components.

[中文介绍](http://zxc0328.github.io/2016/07/26/annoucing-regular-devtools/)

### Overview

Some GIFs to show you how Regular Devtools works.

![rdt-demo](https://raw.githubusercontent.com/zxc0328/regular-devtools/master/gifs/rdt_demo_ss.gif)

![rdt-demo](https://raw.githubusercontent.com/zxc0328/regular-devtools/master/gifs/rdt_demo_dom_ss.gif)

### Features

+ Inspecting Regular components hierarchy tree in the element view.
+ Inspecting the selected component's data in the state view.
+ Data changes made with Regular components will be reflected in both element view and state view in real-time.
+ Included contents will be annotated(with `#include` on top).
+ Click inspect button state view to inspect DOM node of the selected component in the Element tab.
+ **Pro Tips** When inspecting DOM node in Elements tab, switch for Regular tab, if the DOM node you are inspecting is rendered from a Regular component, the Regular Devtools will automatically focus on that component. It's like the reverse version of the last feature.

### Install

This Extension is not published in Chrome web store yet. You can install it manually.

+ **Step1** Clone this repo
+ **Step2** Open Google Chrome and navigate to `chrome://extensions/`
+ **Step3** Click `Load unpacked extension` and load the folder you just cloned.
+ **Step4** Open your page with Chrome, switch Chrome Devtools for `Regular`  tab
+ **Step5** All done! Happy Inspecting!

### Prerequisition

Custom build of Regularjs. You can find it in [`/libs/regular.js`](https://github.com/regularjs/regular-devtools/blob/master/lib/regular.js)

### Known Issues

+ The component with `isolate` prop will not appear in the components hierarchy tree.
+ Regular-dnd wrapper component will not appear in the components hierarchy tree.

### Change Log

#### v0.1 2016-07-26

### License

[MIT](https://github.com/regularjs/regular-devtools/blob/master/LICENSE)
