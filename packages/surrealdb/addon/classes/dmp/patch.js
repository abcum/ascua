import DMP from 'dmp';

function getByPath(obj, path) {
  var parts = path.split('.');
  var o = obj;
  if (parts.length > 1) {
    for (var i = 0; i < parts.length - 1; i++) {
      if (!o[parts[i]]) {
        o[parts[i]] = {};
      }
      o = o[parts[i]];
    }
  }
  return o[parts[parts.length - 1]];
}

function setByPath(obj, path, value) {
  var parts = path.split('.');
  var o = obj;
  if (parts.length > 1) {
    for (var i = 0; i < parts.length - 1; i++) {
      if (!o[parts[i]]) {
        o[parts[i]] = {};
      }
      o = o[parts[i]];
    }
  }
  o[parts[parts.length - 1]] = value;
}

function delByPath(obj, path) {
  var parts = path.split('.');
  var o = obj;
  if (parts.length > 1) {
    for (var i = 0; i < parts.length - 1; i++) {
      if (!o[parts[i]]) {
        o[parts[i]] = {};
      }
      o = o[parts[i]];
    }
  }
  delete o[parts[parts.length - 1]];
}

export default class Patch {
  constructor(old = {}, ops = []) {
    this.obj = old;

    this.pch(ops);
  }

  output() {
    return this.obj;
  }

  pch(ops = []) {
    ops.forEach((v) => {
      let p = v.path.split('/').join('.').slice(1);

      switch (v.op) {
        case 'add':
          setByPath(this.obj, p, v.value);
          return;
        case 'remove':
          delByPath(this.obj, p, v.value);
          return;
        case 'replace':
          setByPath(this.obj, p, v.value);
          return;
        case 'change': {
          let dmp = new DMP();
          let txt = getByPath(this.obj, p);
          let pch = dmp.patch_fromText(v.value);
          let [done] = dmp.patch_apply(pch, txt);
          setByPath(this.obj, p, done);
          return;
        }
      }
    });
  }
}
