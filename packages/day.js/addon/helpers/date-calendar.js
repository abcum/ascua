import localised from '../utils/localised';
import Date from 'dayjs';
import { createDateCalendar } from '../utils/date-helpers';

export const dateCalendar = createDateCalendar(Date);

export default localised(dateCalendar);
