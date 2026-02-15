import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import count from '@ascua/surrealdb/builders/count';

module('Unit | Builders | Count', function (hooks) {
  setupTest(hooks);

  test('should create a basic SQL query', function (assert) {
    const results = count('person');

    assert.equal(
      results.text,
      'SELECT count(*) AS count FROM table($tb) GROUP BY all'
    );
    assert.deepEqual(results.vars, {
      tb: 'person',
    });
  });

  test('should add a WHERE clause to the query', function (assert) {
    const results = count('person', {
      where: ['name = John Doe'],
    });

    assert.equal(
      results.text,
      'SELECT count(*) AS count FROM table($tb) WHERE name = John Doe GROUP BY all'
    );

    assert.deepEqual(results.vars, {
      tb: 'person',
    });
  });
});
