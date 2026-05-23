import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import Storage from '@ascua/surrealdb/classes/storage';

module('Unit | Classes | Storage', function (hooks) {
  setupTest(hooks);
  let storage;

  hooks.beforeEach(function () {
    storage = new Storage();
  });

  hooks.afterEach(function () {
    storage.clear();
  });

  test('should be able to set a value', async function (assert) {
    await storage.set('key', 'value');

    assert.equal(storage.get('key'), 'value');
  });

  test('should be able to get a value', async function (assert) {
    await storage.set('key', 'value');

    assert.equal(storage.get('key'), 'value');
  });

  test('should be able to delete a value', async function (assert) {
    await storage.set('key', 'value');
    await storage.del('key');

    assert.equal(storage.get('key'), undefined);
  });

  test('should be able to clear all values', async function (assert) {
    await storage.set('key1', 'value1');
    await storage.set('key2', 'value2');
    await storage.clear();

    assert.equal(storage.get('key1'), undefined);
    assert.equal(storage.get('key2'), undefined);
  });
});
