import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'dedupe.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

let a = {
    "which": {
        "git": "git"
    },
    "checkPath": {
        "git": "true"
    },
    "exist": {
        "git": "true"
    },
    "exec": {
        "git --version" : {
            "code": 0,
            "stdout": "git verzion 1.0.0"
        }
    }
};

tmr.setAnswers(<any>a);

tmr.run();