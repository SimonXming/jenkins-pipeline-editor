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

For real life use, need to simulate severl jenkins api, most api is GET.


url|method|params|js method name|是否必须|备注
-----|---|----|------|----|----
/blue/rest/pipeline-metadata/crumbInfo|GET||fetchClassic.fetch()|否|only useful when useCrumb is True
/rest/pipeline-metadata/pipelineStepMetadata|GET|depth=20|PipelineMetadataService.getStepListing()|是|get step metaData
/rest/pipeline-metadata/agentMetadata|GET|depth=20|PipelineMetadataService.getAgentListing()|是|get agent metaData
/pipeline-model-converter/toJson|POST|jenkinsfile=''|PipelineSyntaxConverter.convertPipelineToJson()|是|convertPipelineToJson
/pipeline-model-converter/toJenkinsfile|POST|json=''|PipelineSyntaxConverter.convertJsonToPipeline()|是|convertJsonToPipeline
/pipeline-model-converter/stepsToJson|POST|jenkinsfile=''|PipelineSyntaxConverter.convertPipelineStepsToJson()|是|convertPipelineStepsToJson
/pipeline-model-converter/stepsToJenkinsfile|POST|json=''|PipelineSyntaxConverter.convertJsonStepsToPipeline()|是|convertJsonStepsToPipeline
/pipeline-model-converter/validateJson|POST|json=''|PipelineValidator.validatePipeline()|是|validatePipeline with pipeline change
/sse-gateway/connect|GET|clientId=''||否|request only when data-rooturl exist

### 注意：
可能需要 jenkins-cros-plugin 的支持。