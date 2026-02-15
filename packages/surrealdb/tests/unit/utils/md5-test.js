import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import md5 from '@ascua/surrealdb/utils/uniq';

module('Unit | Utils | md5', function (hooks) {
  setupTest(hooks);

  test('should decode a valid base64url string', function (assert) {
    var expected = 'Hello, world!';
    var actual = md5('Zm9vCg==');
    assert.equal(actual, expected);
  });

  test('should decode a longer base64url string', function (assert) {
    var expected = 'This is a longer string.';
    var actual = md5(
      'SGVsbG8gd29ybGRIZWxsbyB3b3JsZEhlbGxvIHdvcmxkSGVsbG8gd29ybGRIZWxsbyB3b3JsZEhlbGxvIHdvcmxk'
    );
    assert.equal(actual, expected);
  });

  test('should pad a non-multiple-of-4 base64url string with = characters', function (assert) {
    var expected =
      'This string is not a multiple of 4, so it should be padded with = characters.';
    var actual = md5('SGVsbG8gd29ybGRIZWxsbyB3b3JsZEhlbGxvIHdvcmxk==');
    assert.equal(actual, expected);
  });

  test('should not pad a non-multiple-of-4 base64url string that already has = characters at the end', function (assert) {
    var expected =
      'This string is not a multiple of 4, but it already has = characters at the end, so it should not be padded.';
    var actual = md5('SGVsbG8gd29ybGRIZWxsbyB3b3JsZEhlbGxvIHdvcmxk=');
    assert.equal(actual, expected);
  });

  test('should throw an error for an invalid base64url string', function (assert) {
    assert
      .expect(md5('This string is an invalid base64url string!'))
      .toThrow('Invalid base64url string!');
  });
});
