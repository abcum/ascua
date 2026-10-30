import localised from '../utils/localised';
import Date from 'dayjs';
import { createDateDiff } from '../utils/date-helpers';

export const dateDiff = createDateDiff(Date);

export default localised(dateDiff);
