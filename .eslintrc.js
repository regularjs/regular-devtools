module.exports = {
    "extends": "google",
    "installedESLint": true,
    "rules": {
        "indent": ["error", 4],
        "no-negated-condition": 0,
        "no-implicit-coercion":0,
        "linebreak-style": 0,
		"guard-for-in": 0
    },
    "env": {
        "browser": true,
    },
    "globals": {
        "devtoolsModel": true,
        "chrome":true,
        "Regular":true,
        "CircularJSON":true,
        "lastSelected":true,
        "sidebarView":true
    }
};
