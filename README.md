# Pipeline Editor Component

__For make this editor communite with right jenkins url, have to change following code.__

`node_modules/@jenkins-cd/blueocean-core-js/dist/js/capability/CapabilityApi.js 49行`
```js
    // TODO: (Workaround) 恢复原有代码
    var classesUrl = ""
    if (path.startsWith("http://")){
        classesUrl = path + '/blue/rest/classes/'
    }else{
        classesUrl = _utils2.default.cleanSlashes(path + '/blue/rest/classes/');
    }
    // 
```