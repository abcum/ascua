import { helper } from '@ember/component/helper';
import Date from 'moment';
import { createDateRelative } from '../utils/date-helpers';

export const dateRelative = createDateRelative(Date);

export default helper(dateRelative);
