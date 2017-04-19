// import './static/stylesheets/main.css';
import React from 'react';
import {render} from 'react-dom';
import PipelineEditor from './src/PipelineEditor';

var pipeline = `
pipeline {
  agent {
    docker {
      image 'node:7-alpine'
      args '--restart always --rm'
    }
    
  }
  stages {
    stage('Pull code') {
      steps {
        sleep 10
      }
    }

    stage('Test') {
      steps {
        sh 'echo \'test\''
      }
    }
  }
  environment {
    JAVA_HOME = '/usr/local/jvm'
  }
}
`

let pipeline_2 = `
pipeline {
  agent {
    docker {
      image 'node:7-alpine'
      args '--restart always --rm'
    }
  }
  
  stages {
    stage('Pull code') {
        steps {
            git(url: 'http://172.24.6.123/root/dcos-package-demo.git', branch: 'master', credentialsId: 'global-username')
        }
    }

    stage('Test') {
      steps {
        sh 'echo "test"'
        sleep 10
        timeout(time: 20) {
          sh 'sh run.sh'
        }
        
      }
    }
    stage('Deploy') {
      steps {
        timeout(time: 3, unit: 'MINUTES') {
          retry(count: 5) {
            sh './flakey-deploy.sh'
          }
          
        }
        
      }
    }
  }
}
`

// init shell
initShell();

function initShell() {
    var shell = document.createElement('main');
    shell.className = 'app-shell';
    document.body.appendChild(shell);
    render(<div>
            <PipelineEditor pipeline={pipeline_2}/>
          </div>, shell);
}

