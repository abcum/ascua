import localised from '../utils/localised';
import Date from 'dayjs';
import { createDateSub } from '../utils/date-helpers';

export const dateSub = createDateSub(Date);

export default localised(dateSub);
