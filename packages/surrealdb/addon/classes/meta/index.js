const META = Symbol('META');

export function init(target) {
  if (target[META] === undefined) {
    Object.defineProperty(target, META, {
      configurable: false,
      enumerable: false,
      writeable: false,
      value: {},
    });
  }
}

export function all(target) {
  init(target);
  return Object.keys(target[META]).map((k) => target[META][k]);
}

export function get(target, name) {
  init(target);
  return target[META][name];
}

export function set(target, name, opt) {
  init(target);
  target[META][name] = target[META][name] || { name };
  Object.assign(target[META][name], opt, { name });
}
