import Property from './property';
import Field from '@ascua/surrealdb/field';
import { assert } from '@ember/debug';
import { setProperties } from '@ember/object';
import { DestroyedError } from '@ascua/surrealdb/errors';
import { RECORD } from '../model';

export default function (type) {
  return Property({
    get(key) {
      try {
        let model = this.store.lookup(type);

        if (model && model.class.prototype instanceof Field) {
          return (this[RECORD].data[key] =
            this[RECORD].data[key] || model.create({ parent: this }));
        }

        assert('An embedded object must be of type Field');
      } catch (e) {
        if (e instanceof DestroyedError) {
          // ignore
        } else {
          throw e;
        }
      }
    },
    set(key, value = {}) {
      try {
        let model = this.store.lookup(type);

        if (model && model.class.prototype instanceof Field) {
          switch (true) {
            case this[RECORD].data[key] !== undefined:
              setProperties(this[RECORD].data[key], value);
              return this[RECORD].data[key];
            case this[RECORD].data[key] === undefined:
              return (this[RECORD].data[key] = model.create({
                ...value,
                parent: this,
              }));
          }
        }

        assert('An embedded object must be of type Field');
      } catch (e) {
        if (e instanceof DestroyedError) {
          // ignore
        } else {
          throw e;
        }
      }
    },
  });
}
