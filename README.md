# Regular Developer Tools [![build][build-image]][build-url]

> Regular Developer Tools is a Chrome Extension that allows real-time inspection of [Regular](http://regularjs.github.io/) components.

*Regular Developer Tools is under active development, any feedback is welcome* :clap:

### Overview

Some GIFs to show you how Regular Devtools works. You can:

*View component tree structure, and select a component to get its data, computed data, filters and directives*

![rdt-demo](http://wx2.sinaimg.cn/large/64c45edcgy1fjj9dy0gh5g21280q21kx.gif)

*Data changes are synchronized in a bi-direction way*

![rdt-demo](http://wx1.sinaimg.cn/large/64c45edcgy1fjj9dxzma8g21280q2nof.gif)

*Select a component, and inspect its instance by evaluating `$r` in the console*

![rdt-demo](http://wx3.sinaimg.cn/large/64c45edcgy1fjj9dxzp5yg21280q27l0.gif)

*Inspecting mode allow user to select a DOM node and view its corresponding component in Devtools Panel*

![rdt-demo](http://wx1.sinaimg.cn/large/64c45edcgy1fjjael50bvg21fk0qo7wh.gif)

### Features


> **New in v0.9**  
> Now you can enter the brand new **inspecting mode** by the hitting the  "target" button in navbar.



+ Inspecting Regular components hierarchy tree in element view.
+ Inspecting data, filters, directives, animations of selected component in sidebar.
+ Data changes made with Regular components will be reflected in both element view and sidebar in real-time.
+ Sidebar data is editable, changes will be applied to the corresponding component in page.
+ Searching component in element view.
+ Included contents will be annotated with `#inc`.
+ Click `inspect` button in the sidebar to inspect DOM node of selected component in Elements tab.
+ **Inspecting mode** allow user to inspect DOM node, and the corresponding component will be focused in Developer Tool.
+ **Pro Tip One**: When inspecting DOM node in Elements tab, switch to Regular tab, if the DOM node you are inspecting is rendered from a Regular component, the Regular Devtools will automatically focus on that component. It's like the reverse version of the last feature.
+ **Pro Tip Two**: When selecting component in element view, the component instance is available as `$r` in your console.

### Prerequisition

Require [regularjs](https://github.com/regularjs/regular) **v0.5.0+**.

### Installation

Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/regular-developer-tools/ehlcoecgkhfjffhmdhmhbjkjjpaecmam)

### Manual Installation

+ **Step 1** Clone this repo.
+ **Step 2** run `npm i && npm run build` in command line, you will get `dist` folder in current working directory
+ **Step 3** Open Google Chrome and navigate to `chrome://extensions/`.
+ **Step 4** Check Developement mode checkbox in right corner.
+ **Step 5** Click `Load unpacked extension` and load the `dist` folder.

### Development

```bash
# Install dependencies
$ npm install
# Build and watch file changes
$ npm run watch
# Build for production
$ npm run build
```

### Changelog

[CHANGELOG](CHANGELOG.md)

### License

[MIT](https://github.com/regularjs/regular-devtools/blob/master/LICENSE)

[build-image]: https://img.shields.io/circleci/project/regularjs/regular-devtools/master.svg?style=flat-square
[build-url]: https://circleci.com/gh/regularjs/regular-devtools
