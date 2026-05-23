const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
import window from 'ember-window-mock';

const crypto = window.crypto || window.msCrypto;

const uint32 = 4294967295;

const random = function (size) {
  if (crypto !== undefined && crypto.getRandomValues !== undefined) {
    return crypto.getRandomValues(new Uint32Array(size));
  }

  return [...Array(size)].map(() => {
    return Math.abs((Math.random() * uint32) | 0);
  });
};

export default function (size = 64) {
  return [].slice
    .call(random(size))
    .map((v) => {
      return chars[v % chars.length];
    })
    .join('');
}
