import { helper } from '@ember/component/helper';
import Date from 'moment';

export function dateDiff([ value = undefined, reference = undefined ], { precision = undefined, fraction = false }) {
	return Date(value).diff(reference, precision, fraction);
}

export default helper(dateDiff);
