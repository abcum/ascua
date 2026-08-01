const func = (v) => v;

export default class RecordArray extends Array {
  static create(owner, type = func, ...values) {
    let v = values.map(type);
    let a = new this(...v);
    a.type = type;
    return new Proxy(a, {
      get() {
        return Reflect.get(...arguments);
      },
      set() {
        let val = Reflect.set(...arguments);
        if (owner) owner.autosave();
        return val;
      },
    });
  }

  type = func;

  addObject(value) {
    return super.addObject(this.type(value));
  }

  addObjects(values) {
    return super.addObjects([].concat(values).map(this.type));
  }

  pushObject(value) {
    return super.pushObject(this.type(value));
  }

  pushObjects(values) {
    return super.pushObjects([].concat(values).map(this.type));
  }

  setObjects(values) {
    return super.setObjects([].concat(values).map(this.type));
  }

  replace(idx, count, values) {
    return super.replace(idx, count, [].concat(values).map(this.type));
  }

  then() {
    return Promise.all(this).then(...arguments);
  }

  catch() {
    return Promise.all(this).catch(...arguments);
  }

  finally() {
    return Promise.all(this).finally(...arguments);
  }
}
