import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { inject } from '@ember/service';

export default function (target) {
  assert(
    'The @attempted decorator can only be applied to a Route',
    !target || (target && target.prototype instanceof Route)
  );
  return target
    ? func(target)
    : (target) => {
        assert(
          'The @attempted decorator can only be applied to a Route',
          target && target.prototype instanceof Route
        );
        return func(target);
      };
}

function func(target) {
  let before = target.prototype.beforeModel;

  target.reopen({
    surreal: inject(),

    beforeModel() {
      // Wait for authentication attempt.
      return this.surreal.wait().then(() => {
        // Continue with original hook.
        return before.apply(this, ...arguments);
      });
    },
  });
}
