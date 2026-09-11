import { helper } from '@ember/component/helper';
import Date from 'dayjs';
import { createDateAdd } from '../utils/date-helpers';

export const dateAdd = createDateAdd(Date);

export default helper(dateAdd);
