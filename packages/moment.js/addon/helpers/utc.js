import { helper } from '@ember/component/helper';
import Date from 'moment';

export function utc([ value = undefined ]) {
	return Date(value).utc();
}

export default helper(utc);
