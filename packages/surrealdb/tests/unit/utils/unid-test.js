import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import unid from '@ascua/surrealdb/utils/unid';
import utilTest from '@ascua/surrealdb/utils/test';
import window from 'ember-window-mock';
import { setupWindowMock } from 'ember-window-mock/test-support';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

module('Unit | Utils | Unid', function (hooks) {
  setupTest(hooks);
  setupWindowMock(hooks);

  test('Returns a string of the correct length', function (assert) {
    const result = unid();
    assert.equal(result.length, 64);
  });

  test('Returns a string of random characters', function (assert) {
    assert.expect(64);
    const result = unid();
    for (let i = 0; i < result.length; i++) {
      assert.ok(chars.includes(result[i]));
    }
  });

  test('Returns a different string each time it is called', function (assert) {
    const result1 = unid();
    const result2 = unid();
    assert.notEqual(result1, result2);
  });

  test('Stores the session string in localStorage if it is not already stored there', function (assert) {
    assert.expect(1);
    const persisted = utilTest();
    const session1 = unid();
    const session2 = unid();

    if (persisted === false) {
      assert.equal(window.localStorage.getItem('session'), session1);
    } else {
      assert.equal(window.localStorage.getItem('session'), session2);
    }
  });

  test('Returns the session string from localStorage if it is already stored there', function (assert) {
    assert.expect(1);
    const persisted = utilTest();
    const session1 = unid();
    const session2 = unid();

    window.localStorage.setItem('session', session1);

    if (persisted === false) {
      assert.equal(unid(), session1);
    } else {
      assert.equal(unid(), session2);
    }
  });
});
