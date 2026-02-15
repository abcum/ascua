import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import hasher from '@ascua/surrealdb/builders/hasher';
import md5 from '@ascua/surrealdb/utils/md5';

module('Unit | Builders | Hasher', function (hooks) {
  setupTest(hooks);

  test('should create a basic SQL query', function (assert) {
    const results = hasher('person');

    assert.equal(results, md5('SELECT * FROM person'));
  });

  test('should add a WHERE clause to the query', function (assert) {
    const results = hasher('person', {
      where: ['name = John Doe'],
    });

    assert.equal(results, md5('SELECT * FROM person WHERE name = John Doe'));
  });

  test('should group the results by all of the columns in the table', function (assert) {
    const results = hasher('person', {
      group: ['name', 'age'],
    });

    assert.equal(results, md5('SELECT * FROM person GROUP BY name,age'));
  });
});
