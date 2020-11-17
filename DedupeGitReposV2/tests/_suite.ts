import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Sample task test', function () {
    
    before( function() {

    });

    after(() => {

    });

    it('should succeed for simple inputs', function(done: Mocha.Done){
        this.timeout(1000);

        let tp = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.stdout.indexOf('Hello human') >= 0, true, 'should display Hello human');
        done();
    });

 
    it('should fail if tool returns 1', function(done: Mocha.Done){
        this.timeout(1000);

        let tp = path.join(__dirname, 'failure.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.run();
        assert.strictEqual(tr.succeeded, false, 'should have failed');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.strictEqual(tr.errorIssues[0], 'Bad input was given', 'error issue output');
        assert.strictEqual(tr.stdout.indexOf('Hello bad'), -1, "Should not display Hello bad");
    
        done();       
    });

});