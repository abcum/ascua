import Property from './property';
import Any from '../types/any';
import { RECORD } from '../model';

export default Property({
  get(key) {
    return Any(this[RECORD].data[key]);
  },
  set(key, value) {
    return (this[RECORD].data[key] = Any(value));
  },
});
