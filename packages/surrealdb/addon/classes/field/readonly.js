import meta from '../meta';

export default function (target, key, desc) {
  meta.set(target, key, {
    readonly: true,
  });

  return desc;
}
