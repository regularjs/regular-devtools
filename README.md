# Regular Developer Tools

*Regular Developer Tools is in beta, your feedback is welcomed*

Regular Developer Tools is a Chrome Extension that allows real-time inspection of [Regular](http://regularjs.github.io/) components.

### Overview

Some GIFs to show you how Regular Devtools works.

![rdt-demo](https://raw.githubusercontent.com/zxc0328/regular-devtools/master/gifs/rdt_demo_ss.gif)

![rdt-demo](https://raw.githubusercontent.com/zxc0328/regular-devtools/master/gifs/rdt_demo_dom_ss.gif)

### Features

+ Inspecting Regular components hierarchy tree in element view.
+ Inspecting the selected component's data, filters, directives, animations in the sidebar.
+ Data changes made with Regular components will be reflected in both element view and sidebar in real-time.
+ Sidebar data is editable, changes will be applied to the coresponding component in page.
+ Search by component name in the element view 
+ Included contents will be annotated(with `#include` on top).
+ Click inspect button state view to inspect DOM node of the selected component in the Element tab.
+ **Pro Tip One** When inspecting DOM node in Elements tab, switch for Regular tab, if the DOM node you are inspecting is rendered from a Regular component, the Regular Devtools will automatically focus on that component. It's like the reverse version of the last feature.
+ **Pro Tip Two** When selecting component in element view, the component instance is available as `$r` in Chrome Devtools Console!

### Prerequisition

Your project must use a custom build of Regularjs(before Regular v0.4.5 is published). You can find it in [`/libs/regular.js`](https://github.com/regularjs/regular-devtools/blob/master/lib/regular.js)

### Install

Install in [Chrome Webstore](https://chrome.google.com/webstore/detail/regular-developer-tools/ehlcoecgkhfjffhmdhmhbjkjjpaecmam)

### Develop


+ **Step1** Clone this repo
+ **Step2** Open Google Chrome and navigate to `chrome://extensions/`
+ **Step3** Check Developement mode checkbox in right corner
+ **Step4** Click `Load unpacked extension` and load the folder you just cloned.




### Change Log

#### v0.1 2016-07-26

#### v0.2 2016-08-24

### License

[MIT](https://github.com/regularjs/regular-devtools/blob/master/LICENSE)
