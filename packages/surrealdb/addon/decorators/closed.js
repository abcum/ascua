import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { inject } from '@ember/service';

export default function (target) {
  assert(
    'The @closed decorator can only be applied to a Route',
    !target || (target && target.prototype instanceof Route)
  );
  return target
    ? func(target)
    : (target) => {
        assert(
          'The @closed decorator can only be applied to a Route',
          target && target.prototype instanceof Route
        );
        return func(target);
      };
}

function func(target) {
  target.reopen({
    surreal: inject(),

    closed: () => {},

    activate() {
      this._super(...arguments);
      // Enable listening to closed events.
      this.surreal.on('closed', this, this.closed);
    },

    deactivate() {
      this._super(...arguments);
      // Disable listening to closed events.
      this.surreal.off('closed', this, this.closed);
    },
  });
}
