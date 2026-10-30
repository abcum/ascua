import localised from '../utils/localised';
import Date from 'dayjs';
import { createDateRelative } from '../utils/date-helpers';

export const dateRelative = createDateRelative(Date);

export default localised(dateRelative);
