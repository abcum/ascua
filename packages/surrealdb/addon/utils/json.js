import meta from '../classes/meta';

export function full(object) {
  let json = {};

  json.id = object.id;

  meta.all(object).forEach((p) => {
    switch (true) {
      case typeof object[p.name] === 'object' &&
        object[p.name] !== null &&
        '_full' in object[p.name]:
        return (json[p.name] = object[p.name]._full);
      default:
        return (json[p.name] = object[p.name]);
    }
  });

  return JSON.parse(
    JSON.stringify(json, (k, v) => {
      return typeof v === 'undefined' ? null : v;
    })
  );
}

export function some(object) {
  let json = {};

  json.id = object.id;

  meta.all(object).forEach((p) => {
    switch (true) {
      case p.readonly:
        return;
      case typeof object[p.name] === 'object' &&
        object[p.name] !== null &&
        '_some' in object[p.name]:
        return (json[p.name] = object[p.name]._some);
      default:
        return (json[p.name] = object[p.name]);
    }
  });

  return JSON.parse(
    JSON.stringify(json, (k, v) => {
      return typeof v === 'undefined' ? null : v;
    })
  );
}
