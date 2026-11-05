import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import jwt from '@ascua/surrealdb/utils/jwt';

module('Unit | Utils | Jwt', function (hooks) {
  setupTest(hooks);

  test('Returns null if the token is not a string', function (assert) {
    const result = jwt(123);
    assert.isNull(result);
  });

  test('Returns null if the token is not a valid JWT token', function (assert) {
    const result = jwt('not a valid JWT token');
    assert.isNull(result);
  });

  test('Returns the correct JSON object if the token is a valid JWT token', function (assert) {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE1MDMwMDAwMDAsIm5hbWUiOiJhZG1pbjpwcm9kdWN0aW9uIn0.QkZGRkZGRkZGRkZGRkZG';
    const expected = {
      sub: '1234567890',
      name: 'John Doe',
      iat: 1568325870,
      exp: 1568329470,
    };
    const result = jwt(token);
    assert.deepEqual(result, expected);
  });

  test('Includes the header in the decoded JSON object if the header option is set to true', function (assert) {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE1MDMwMDAwMDAsIm5hbWUiOiJhZG1pbjpwcm9kdWN0aW9uIn0.QkZGRkZGRkZGRkZGRkZG.eyJ1c2VybmFtZSI6IkhlbGxvIFdvcmxkIn0';
    const expected = {
      alg: 'HS256',
      typ: 'JWT',
      sub: '1234567890',
      name: 'John Doe',
      iat: 1568325870,
      exp: 1568329470,
    };
    const options = {
      header: true,
    };
    const result = jwt(token, options);
    assert.deepEqual(result, expected);
  });
});
