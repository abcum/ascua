import { helper } from '@ember/component/helper';
import Date from 'dayjs';
import { createDate } from '../utils/date-helpers';

export const date = createDate(Date);

export default helper(date);
