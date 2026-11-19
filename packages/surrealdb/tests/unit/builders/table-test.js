import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import table from '@ascua/surrealdb/builders/table';

module('Unit | Builders | Table', function (hooks) {
  setupTest(hooks);

  test('should create a basic SQL query', function (assert) {
    const results = table('person');

    assert.deepEqual(results, {
      text: 'SELECT * FROM table($tb)',
      vars: {
        tb: 'person',
      },
    });
  });

  test('should add a WHERE clause to the query', function (assert) {
    const results = table('person', {
      where: ['name = John Doe'],
    });

    assert.equal(
      results.text,
      'SELECT * FROM table($tb) WHERE name = John Doe'
    );
    assert.deepEqual(results.vars, {
      tb: 'person',
    });
  });

  test('should group the results by all of the columns in the table', function (assert) {
    const results = table('person', {
      group: ['name', 'age'],
    });

    assert.equal(results.text, 'SELECT * FROM table($tb) GROUP BY name,age');
    assert.deepEqual(results.vars, {
      tb: 'person',
    });
  });

  test('should handle empty options object', function (assert) {
    const results = table('person');

    assert.equal(results.text, 'SELECT * FROM table($tb)');
    assert.deepEqual(results.vars, {
      tb: 'person',
    });
  });
});
