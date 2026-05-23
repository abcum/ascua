import Property from './property';
import String from '../types/string';
import { RECORD } from '../model';

export default Property({
  get(key) {
    return String(this[RECORD].data[key]);
  },
  set(key, value) {
    return (this[RECORD].data[key] = String(value));
  },
});
