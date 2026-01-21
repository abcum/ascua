import base64 from '../utils/base';

export default function (token, options = {}) {
  if (typeof token !== 'string') {
    return null;
  }

  let pos = options.header === true ? 0 : 1;

  try {
    return JSON.parse(base64(token.split('.')[pos]));
  } catch (e) {
    return null;
  }
}
