import Property from './property';
import Datetime from '../types/datetime';
import { RECORD } from '../model';

export default Property({
  get(key) {
    return Datetime(this[RECORD].data[key]);
  },
  set(key, value) {
    return (this[RECORD].data[key] = Datetime(value));
  },
});
