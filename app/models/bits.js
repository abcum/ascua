import Field from '@ascua/surreal/field';
import { array, boolean, datetime, number, string } from '@ascua/surreal/field';

// Test fixture embedded object (Field) carrying one of every scalar kind,
// plus primitive arrays, so the same shape can be exercised both as a single
// embedded object (`doodad.bits`) and as an array element (`doodad.bitses`).

export default class Bits extends Field {

	@string text;

	@number count;

	@boolean flag;

	@datetime when;

	@array('string') texts;

	@array('number') counts;

}
