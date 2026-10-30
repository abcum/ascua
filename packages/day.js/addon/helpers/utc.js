import localised from '../utils/localised';
import Date from 'dayjs';
import { createUtc } from '../utils/date-helpers';

export const utc = createUtc(Date);

export default localised(utc);
