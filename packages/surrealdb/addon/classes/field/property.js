import meta from '../meta';
import { RECORD } from '../model';

const json = (v) => JSON.stringify(v);

export default function (obj) {
  return function (target, key, desc) {
    meta.set(target, key);

    return {
      configurable: false,
      enumerable: true,
      writeable: false,
      get() {
        return obj.get.apply(this, [key]);
      },
      set(value) {
        let old = json(this[RECORD].data[key]);
        let val = obj.set.apply(this, [key, value]);
        let now = json(val);

        if (old !== now) {
          this[RECORD].data = this[RECORD].data;
          this.autosave();
        }

        return val;
      },
    };
  };
}
