import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Sample task test', function () {
    
    before( function() {

    });

    after(() => {

    });

    it('should create worktree on first clone', function(done: Mocha.Done){
        this.timeout(1000);

        let tp = path.join(__dirname, 'L0FirstClone.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.stdout.indexOf('Hello human') >= 0, true, 'should display Hello human');
        done();
    });

});