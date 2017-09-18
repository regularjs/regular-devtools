# Regular Developer Tools [![build][build-image]][build-url]

> Regular Developer Tools是一个chrome扩展，它允许你实时地观察[Regular](http://regularjs.github.io/)组件

*Regular Developer Tools仍然处于公测阶段, 欢迎反馈任何问题* :clap:

### 总览

下面一些GIF会告诉你Regular Devtools是如何工作的

![rdt-demo](https://raw.githubusercontent.com/zxc0328/regular-devtools/master/gifs/rdt_demo_ss.gif)

![rdt-demo](https://raw.githubusercontent.com/zxc0328/regular-devtools/master/gifs/rdt_demo_dom_ss.gif)

### 特性

+ 查看Regular组件的树形结构
+ 查看选中组件的data、filters、directives、animations
+ 页面中的组件变化会实时更新到Regular Devtools中
+ 侧边栏的data是可编辑的，编辑后变动将自动应用到页面中
+ 在组件视图中搜索组件
+ include的内容会使用`#inc`进行标识
+ 点击`inspect`查看选中组件对应的DOM节点
+ **小贴士一**：当从Elements面板切换到Regular面板时，如果之前选中的DOM节点是由Regular组件渲染出来的，Regular Devtools会自动选中该组件，这相当于最后一条特性的相反版本
+ **小贴士二**：当在组件视图中选中一个组件后，你可以在console中通过`$r`取到当前组件实例的引用

### 前置条件

你的项目需要使用定制的regularjs(或使用官方0.5及以上版本的regularjs)，你可以在这里找到定制版本[`/libs/regular.js`](https://github.com/regularjs/regular-devtools/blob/master/lib/regular.js)

### 安装

从[谷歌应用商店](https://chrome.google.com/webstore/detail/regular-developer-tools/ehlcoecgkhfjffhmdhmhbjkjjpaecmam)安装

### 如何开发

+ **步骤1** 克隆本仓库
+ **步骤2** 执行命令`npm i && npm run build`，会打包源码到dist目录
+ **步骤3** 打开Chrome浏览器，并导航至`chrome://extensions/`
+ **步骤4** 勾选右上角的`开发者模式`
+ **步骤5** 点击`加载已解压的扩展程序...`，选择刚刚生成的`dist`文件夹

### 更新日志

#### v0.1 2016-07-26

#### v0.2 2016-08-24

### License

[MIT](https://github.com/regularjs/regular-devtools/blob/master/LICENSE)

[build-image]: https://img.shields.io/circleci/project/regularjs/regular-devtools/master.svg?style=flat-square
[build-url]: https://circleci.com/gh/regularjs/regular-devtools
