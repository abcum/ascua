import { helper } from '@ember/component/helper';
import Date from 'dayjs';
import { createDateFormat } from '../utils/date-helpers';

export const dateFormat = createDateFormat(Date);

export default helper(dateFormat);
