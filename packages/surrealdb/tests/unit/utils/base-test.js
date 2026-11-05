import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import base from '@ascua/surrealdb/utils/base';

module('Unit | Utils | Base', function (hooks) {
  setupTest(hooks);

  test('should decode a valid base64url string', function (assert) {
    var expected = 'Hello, world!';

    var actual = base('SGVsbG8sIHdvcmxkIQ==');

    assert.equal(actual, expected);
  });

  test('should decode a longer base64url string', function (assert) {
    var expected = 'This is a longer string.';

    var actual = base('VGhpcyBpcyBhIGxvbmdlciBzdHJpbmcu');

    assert.equal(actual, expected);
  });

  test('should pad a non-multiple-of-4 base64url string with = characters', function (assert) {
    var expected =
      'This string is not a multiple of 4, so it should be padded with = characters.';

    var actual = base(
      'VGhpcyBzdHJpbmcgaXMgbm90IGEgbXVsdGlwbGUgb2YgNCwgc28gaXQgc2hvdWxkIGJlIHBhZGRlZCB3aXRoID0gY2hhcmFjdGVycy4='
    );

    assert.equal(actual, expected);
  });

  test('should not pad a non-multiple-of-4 base64url string that already has = characters at the end', function (assert) {
    var expected =
      'This string is not a multiple of 4, but it already has = characters at the end, so it should not be padded.';

    var actual = base(
      'VGhpcyBzdHJpbmcgaXMgbm90IGEgbXVsdGlwbGUgb2YgNCwgYnV0IGl0IGFscmVhZHkgaGFzID0gY2hhcmFjdGVycyBhdCB0aGUgZW5kLCBzbyBpdCBzaG91bGQgbm90IGJlIHBhZGRlZC4='
    );

    assert.equal(actual, expected);
  });

  test('should throw an error for an invalid base64url string', function (assert) {
    assert.throws(base, 'Illegal base64url string!');
  });
});
