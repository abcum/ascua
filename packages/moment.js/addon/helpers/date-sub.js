import { helper } from '@ember/component/helper';
import Date from 'moment';
import { createDateSub } from '../utils/date-helpers';

export const dateSub = createDateSub(Date);

export default helper(dateSub);
