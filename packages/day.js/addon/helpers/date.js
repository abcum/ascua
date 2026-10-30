import localised from '../utils/localised';
import Date from 'dayjs';
import { createDate } from '../utils/date-helpers';

export const date = createDate(Date);

export default localised(date);
