import { helper } from '@ember/component/helper';
import Date from 'moment';
import { createUtc } from '../utils/date-helpers';

export const utc = createUtc(Date);

export default helper(utc);
