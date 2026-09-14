import Model from '@ascua/surreal/model';
import { autosave } from '@ascua/surreal';
import { any, array, boolean, datetime, number, object, record, string } from '@ascua/surreal/field';

// Type-coverage fixture: every field kind the connector supports, as a bare
// value, inside an array, and inside an embedded object.

@autosave
export default class Doodad extends Model {

	@string text;

	@number count;

	@boolean flag;

	@datetime when;

	@any blob;

	@any blobs;

	@array('string') texts;

	@array('number') counts;

	@array('boolean') flags;

	@array('datetime') whens;

	@record('author') link;

	@array('author') links;

	@object('bits') bits;

	@array('bits') bitses;

}
