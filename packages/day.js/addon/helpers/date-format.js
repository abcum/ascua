import localised from '../utils/localised';
import Date from 'dayjs';
import { createDateFormat } from '../utils/date-helpers';

export const dateFormat = createDateFormat(Date);

export default localised(dateFormat);
