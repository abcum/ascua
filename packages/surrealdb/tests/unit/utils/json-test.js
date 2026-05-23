import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { full, some } from '@ascua/surrealdb/utils/json';

module('Unit | Utils | Json', function (hooks) {
  setupTest(hooks);

  test('Returns a JSON object with all of the properties of the input object', function (assert) {
    const object = {
      id: 1,
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
      },
    };
    const expected = {
      id: 1,
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
      },
    };
    const result = full(object);
    assert.deepEqual(result, expected);
  });

  test('Returns a JSON object with the properties that are not marked as readonly', function (assert) {
    const object = {
      id: 1,
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
      },
      readonly: 'This property is readonly',
    };
    const expected = {
      id: 1,
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
      },
    };
    const result = some(object);
    assert.deepEqual(result, expected);
  });

  test('Returns the same JSON object if the input object does not have any readonly properties', function (assert) {
    const object = {
      id: 1,
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
      },
    };
    const result1 = full(object);
    const result2 = some(object);
    assert.deepEqual(result1, result2);
  });
});
