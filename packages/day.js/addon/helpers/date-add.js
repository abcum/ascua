import localised from '../utils/localised';
import Date from 'dayjs';
import { createDateAdd } from '../utils/date-helpers';

export const dateAdd = createDateAdd(Date);

export default localised(dateAdd);
