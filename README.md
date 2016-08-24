# Regular Developer Tools

> Regular Developer Tools is a Chrome Extension that allows real-time inspection of [Regular](http://regularjs.github.io/) components.

*Regular Developer Tools is still in beta, any feedback is welcome* :clap:

### Overview

Some GIFs to show you how Regular Devtools works.

![rdt-demo](https://raw.githubusercontent.com/zxc0328/regular-devtools/master/gifs/rdt_demo_ss.gif)

![rdt-demo](https://raw.githubusercontent.com/zxc0328/regular-devtools/master/gifs/rdt_demo_dom_ss.gif)

### Features

+ Inspecting Regular components hierarchy tree in element view.
+ Inspecting data, filters, directives, animations of selected component in sidebar.
+ Data changes made with Regular components will be reflected in both element view and sidebar in real-time.
+ Sidebar data is editable, changes will be applied to the coresponding component in page.
+ Searching component in element view.
+ Included contents will be annotated with `#inc`.
+ Click `inspect` button to inspect DOM node of selected component in Elements tab.
+ **Pro Tip One**: When inspecting DOM node in Elements tab, switch to Regular tab, if the DOM node you are inspecting is rendered from a Regular component, the Regular Devtools will automatically focus on that component. It's like the reverse version of the last feature.
+ **Pro Tip Two**: When selecting component in element view, the component instance is available as `$r` in your console.

### Prerequisition

Your project must use a custom build of regularjs(before Regular v0.4.5 is released). You can find it in [`/libs/regular.js`](https://github.com/regularjs/regular-devtools/blob/master/lib/regular.js)

### Installation

Install from [Chrome Webstore](https://chrome.google.com/webstore/detail/regular-developer-tools/ehlcoecgkhfjffhmdhmhbjkjjpaecmam)

### Development

+ **Step1** Clone this repo
+ **Step2** Open Google Chrome and navigate to `chrome://extensions/`
+ **Step3** Check Developement mode checkbox in right corner
+ **Step4** Click `Load unpacked extension` and load the folder you just cloned.

### Change Log

#### v0.1 2016-07-26

#### v0.2 2016-08-24

### License

[MIT](https://github.com/regularjs/regular-devtools/blob/master/LICENSE)
