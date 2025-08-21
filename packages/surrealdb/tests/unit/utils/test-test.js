import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import utilTest from '@ascua/surrealdb/utils/test';
import window from 'ember-window-mock';
import { setupWindowMock } from 'ember-window-mock/test-support';

module('Unit | Utils | Test', function (hooks) {
  setupTest(hooks);
  setupWindowMock(hooks);

  test('Returns true if the browser has localStorage and sessionStorage', function (assert) {
    const result = utilTest();
    assert.true(result);
  });

  test('Throws an exception if the browser does not have localStorage', function (assert) {
    assert.expect(1);
    try {
      window.localStorage = undefined;
      utilTest();
    } catch (e) {
      assert.equal(e.message, 'exception');
    }
  });

  test('Throws an exception if the browser does not have sessionStorage', function (assert) {
    assert.expect(1);
    try {
      window.sessionStorage = undefined;
      utilTest();
    } catch (e) {
      assert.equal(e.message, 'exception');
    }
  });
});
