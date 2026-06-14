import Model from '@ascua/surreal/model';
import { string, datetime, record, array, object } from '@ascua/surreal/field';

// Test fixture model exercising a single record link, an array of record
// links, an embedded object (Field), and a datetime.

export default class Book extends Model {

	@string title;

	@datetime published;

	@record('author') author;

	@array('author') contributors;

	@object('detail') detail;

}
