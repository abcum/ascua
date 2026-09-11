import { helper } from '@ember/component/helper';
import Date from 'moment';
import { createDate } from '../utils/date-helpers';

export const date = createDate(Date);

export default helper(date);
