import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { inject } from '@ember/service';

export default function (target) {
  assert(
    'The @authenticated decorator can only be applied to a Route',
    !target || (target && target.prototype instanceof Route)
  );
  return target
    ? func(target)
    : (target) => {
        assert(
          'The @authenticated decorator can only be applied to a Route',
          target && target.prototype instanceof Route
        );
        return func(target);
      };
}

function func(target) {
  let enter = target.prototype.activate;

  let leave = target.prototype.deactivate;

  let before = target.prototype.beforeModel;

  target.reopen({
    router: inject(),
    surreal: inject(),
    session: inject(),

    redirectIfInvalidated: 'signin',

    activate() {
      enter.apply(this, ...arguments);
      // Enable listening to invalidated events.
      this.surreal.on('invalidated', this, this.invalidate);
    },

    deactivate() {
      leave.apply(this, ...arguments);
      // Disable listening to invalidated events.
      this.surreal.off('invalidated', this, this.invalidate);
    },

    invalidate() {
      this.router.transitionTo(this.redirectIfInvalidated);
    },

    beforeModel(transition) {
      // Store the current desired route.
      this.surreal.transition = transition;
      // Redirect if connection is invalidated.
      if (this.surreal.invalidated === true) {
        return this.router.replaceWith(this.redirectIfInvalidated);
      }
      // Wait for session identification.
      return this.session.ready.then(() => {
        // Continue with original hook.
        return before.apply(this, ...arguments);
      });
    },
  });
}
