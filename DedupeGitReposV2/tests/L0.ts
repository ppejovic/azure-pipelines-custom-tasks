import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('DedupeGitReposV2 Suite', function () {
    
    before( function() {

    });

    after(() => {

    });

    it('should create worktree on first clone', function(done: Mocha.Done){
        this.timeout(1000);

        let tp = path.join(__dirname, 'L0FirstClone.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.stdout);
        assert.strictEqual(tr.stdout.indexOf('verzion') >= 0, true, 'should display version');
        done();
    });

});