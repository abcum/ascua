import { typeOf } from '@ember/utils';
import DMP from 'dmp';

const regex =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

function route(path, part) {
  if (path.length === 0) {
    return '/' + part;
  } else {
    if (part[0] === '/') {
      return path + part;
    } else {
      return path + '/' + part;
    }
  }
}

export default class Diff {
  constructor(old = {}, now = {}) {
    this.ops = [];

    this.obj(old, now, '');
  }

  output() {
    return this.ops;
  }

  op(op, path, value) {
    this.ops.push({ op, path, value });
  }

  val(old, now, path = '') {
    if (old === now) {
      return;
    }

    if (typeOf(old) !== typeOf(now)) {
      this.op('replace', path, now);
      return;
    }

    switch (typeof old) {
      case 'string':
        let v = regex.exec(now);
        if (v) {
          this.op('replace', path, now);
        } else {
          this.txt(old, now, path);
        }
        return;
      case 'object':
        if (old.constructor === Array) {
          this.arr(old, now, path);
        }
        if (old.constructor === Object) {
          this.obj(old, now, path);
        }
        return;
      default:
        this.op('replace', path, now);
        return;
    }
  }

  obj(old = {}, now = {}, path = '') {
    for (let k in old) {
      let p = route(path, k);

      // Value no longer exists
      if (k in now === false) {
        this.op('remove', p, now[k]);
        continue;
      }
    }

    for (let k in now) {
      let a = now[k];
      let b = old[k];
      let p = route(path, k);

      // Value did not previously exist
      if (k in old === false) {
        this.op('add', p, a);
        continue;
      }

      // Value is now completely different
      if (typeOf(a) !== typeOf(b)) {
        this.op('replace', p, a);
        continue;
      }

      // Check whether the values have changed
      this.val(b, a, p);
    }
  }

  arr(old = [], now = [], path = '') {
    let i = 0;

    for (i = 0; i < old.length && i < now.length; i++) {
      let p = route(path, i);
      this.val(old[i], now[i], p);
    }

    for (let j = old.length; j < now.length; j++) {
      let p = route(path, j);
      let v = now[j];
      this.op('add', p, v);
    }

    for (let j = old.length - 1; j >= now.length; j--) {
      let p = route(path, j);
      let v = undefined;
      this.op('remove', p, v);
    }
  }

  txt(old = '', now = '', path = '') {
    let dmp = new DMP();

    let pch = dmp.patch_make(old, now);

    let txt = dmp.patch_toText(pch);

    this.op('change', path, txt);
  }
}
