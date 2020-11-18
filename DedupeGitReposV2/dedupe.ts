import tl = require('azure-pipelines-task-lib/task');

async function run() {
    var git = tl.tool(tl.which('git', true));
    git.arg('--version');
    var result = git.execSync({ "silent": true });
    console.log(result.stdout);
};

run();