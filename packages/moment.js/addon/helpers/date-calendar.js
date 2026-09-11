import { helper } from '@ember/component/helper';
import Date from 'moment';
import { createDateCalendar } from '../utils/date-helpers';

export const dateCalendar = createDateCalendar(Date);

export default helper(dateCalendar);
