// import './static/stylesheets/main.css';
import React from 'react';
import {render} from 'react-dom';
import PipelineEditor from './src/PipelineEditor';

var pipeline = `
pipeline {
  agent any
  stages {
    stage('') {
      steps {
        sh 'env'
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
            <PipelineEditor pipeline={pipeline}/>
          </div>, shell);
}

