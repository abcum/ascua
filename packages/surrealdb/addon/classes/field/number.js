import Property from './property';
import Number from '../types/number';
import { RECORD } from '../model';

export default Property({
  get(key) {
    return Number(this[RECORD].data[key]);
  },
  set(key, value) {
    return (this[RECORD].data[key] = Number(value));
  },
});
