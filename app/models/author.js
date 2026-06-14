import Model from '@ascua/surreal/model';
import { string, datetime, array } from '@ascua/surreal/field';

// Test fixture model exercising scalar, datetime and primitive-array fields.

export default class Author extends Model {

	@string name;

	@datetime created;

	@array('string') tags;

}
