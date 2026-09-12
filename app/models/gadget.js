import Model from '@ascua/surreal/model';
import { autosave } from '@ascua/surreal';
import { string, array } from '@ascua/surreal/field';

// Test fixture model exercising @autosave - deliberately separate from
// Author/Book, which the other integration tests depend on saving only
// when explicitly asked to.

@autosave
export default class Gadget extends Model {

	@string name;

	@array('detail') parts;

}
