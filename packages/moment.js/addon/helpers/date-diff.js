import { helper } from '@ember/component/helper';
import Date from 'moment';
import { createDateDiff } from '../utils/date-helpers';

export const dateDiff = createDateDiff(Date);

export default helper(dateDiff);
