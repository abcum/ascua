import { helper } from '@ember/component/helper';
import Date from 'moment';
import { createDateFormat } from '../utils/date-helpers';

export const dateFormat = createDateFormat(Date);

export default helper(dateFormat);
