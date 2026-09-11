import { helper } from '@ember/component/helper';
import Date from 'dayjs';
import { createUtc } from '../utils/date-helpers';

export const utc = createUtc(Date);

export default helper(utc);
