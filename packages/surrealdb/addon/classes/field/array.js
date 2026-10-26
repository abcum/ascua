import Property from './property';
import Array from '../types/array';
import Any from '../types/any';
import String from '../types/string';
import Number from '../types/number';
import Boolean from '../types/boolean';
import Datetime from '../types/datetime';
import Record from '../types/record';
import Model from '@ascua/surrealdb/model';
import Field from '@ascua/surrealdb/field';
import { assert } from '@ember/debug';
import { DestroyedError } from '@ascua/surrealdb/errors';
import { RECORD } from '../model';

const json = (v) => {
  try {
    let o = JSON.parse(JSON.stringify(v));
    return JSON.stringify(o, Object.keys(o).sort());
  } catch (e) {
    return JSON.stringify(v);
  }
};

export default function (type) {
  return Property({
    get(key) {
      switch (type) {
        case undefined:
          return (this[RECORD].data[key] =
            this[RECORD].data[key] || Array.create(this, Any));
        case 'string':
          return (this[RECORD].data[key] =
            this[RECORD].data[key] || Array.create(this, String));
        case 'number':
          return (this[RECORD].data[key] =
            this[RECORD].data[key] || Array.create(this, Number));
        case 'boolean':
          return (this[RECORD].data[key] =
            this[RECORD].data[key] || Array.create(this, Boolean));
        case 'datetime':
          return (this[RECORD].data[key] =
            this[RECORD].data[key] || Array.create(this, Datetime));
        default:
          let value = this[RECORD].data[key] || [];

          try {
            let model = this.store.lookup(type);

            if (model && model.class.prototype instanceof Field) {
              return (this[RECORD].data[key] =
                this[RECORD].data[key] ||
                Array.create(
                  this,
                  (v) => {
                    return model.create({
                      ...v,
                      parent: this,
                    });
                  },
                  ...value
                ));
            }

            if (model && model.class.prototype instanceof Model) {
              return (this[RECORD].data[key] =
                this[RECORD].data[key] ||
                Array.create(
                  this,
                  (v) => {
                    switch (true) {
                      case v === null:
                        return v;
                      case v === undefined:
                        return v;
                      case v instanceof Record:
                        return v;
                      case v instanceof Model:
                        return this.store.proxy({
                          id: v.id,
                          content: v,
                        });
                      case v instanceof Object:
                        return this.store.proxy({
                          id: v.id,
                          content: this.store.inject(v),
                        });
                      default:
                        let cached = this.store.cached(type, v);
                        if (cached) {
                          return this.store.proxy({
                            id: v,
                            content: cached,
                          });
                        } else {
                          return this.store.proxy({
                            id: v,
                            promise: () => this.store.select(type, v),
                          });
                        }
                    }
                  },
                  ...value
                ));
            }

            assert('An embedded object must be of type Model or Field');
          } catch (e) {
            if (e instanceof DestroyedError) {
              // ignore
            } else {
              throw e;
            }
          }
      }
    },
    set(key, value = []) {
      if (this[RECORD].data[key] !== undefined) {
        value.forEach((v, k) => {
          switch (true) {
            case this[RECORD].data[key][k] === undefined: {
              this[RECORD].data[key].pushObject(v);
            }
            case this[RECORD].data[key][k] !== undefined: {
              switch (true) {
                case this[RECORD].data[key][k] === null:
                  this[RECORD].data[key].replace(k, 1, [v]);
                  break;
                case this[RECORD].data[key][k].constructor === Object:
                  this[RECORD].data[key].replace(k, 1, [v]);
                  break;
                case json(this[RECORD].data[key][k]) !== json(v):
                  this[RECORD].data[key].replace(k, 1, [v]);
                  break;
              }
            }
          }
        });
        for (let i = this[RECORD].data[key].length; i > value.length; i--) {
          this[RECORD].data[key].popObject();
        }
        return this[RECORD].data[key];
      }

      switch (type) {
        case undefined:
          return (this[RECORD].data[key] = Array.create(this, Any, ...value));
        case 'string':
          return (this[RECORD].data[key] = Array.create(
            this,
            String,
            ...value
          ));
        case 'number':
          return (this[RECORD].data[key] = Array.create(
            this,
            Number,
            ...value
          ));
        case 'boolean':
          return (this[RECORD].data[key] = Array.create(
            this,
            Boolean,
            ...value
          ));
        case 'datetime':
          return (this[RECORD].data[key] = Array.create(
            this,
            Datetime,
            ...value
          ));
        default:
          try {
            let model = this.store.lookup(type);

            if (model && model.class.prototype instanceof Field) {
              return (this[RECORD].data[key] = Array.create(
                this,
                (v) => {
                  return model.create({ ...v, parent: this });
                },
                ...value
              ));
            }

            if (model && model.class.prototype instanceof Model) {
              return (this[RECORD].data[key] = Array.create(
                this,
                (v) => {
                  switch (true) {
                    case v === null:
                      return v;
                    case v === undefined:
                      return v;
                    case v instanceof Record:
                      return v;
                    case v instanceof Model:
                      return this.store.proxy({
                        id: v.id,
                        content: v,
                      });
                    case v instanceof Object:
                      return this.store.proxy({
                        id: v.id,
                        content: this.store.inject(v),
                      });
                    default:
                      let cached = this.store.cached(type, v);
                      if (cached) {
                        return this.store.proxy({
                          id: v,
                          content: cached,
                        });
                      } else {
                        return this.store.proxy({
                          id: v,
                          promise: () => this.store.select(type, v),
                        });
                      }
                  }
                },
                ...value
              ));
            }

            assert('An embedded object must be of type Model or Field');
          } catch (e) {
            if (e instanceof DestroyedError) {
              // ignore
            } else {
              throw e;
            }
          }
      }
    },
  });
}
