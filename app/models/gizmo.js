import Model from '@ascua/surreal/model';
import { autosave } from '@ascua/surreal';
import { array, object, record, string } from '@ascua/surreal/field';

// Test fixture model exercising @autosave across every field kind at once:
// a scalar, a single record link, an array of record links, a nested
// embedded object (which itself holds an array and another embedded
// object), and an array of those embedded objects.

@autosave
export default class Gizmo extends Model {

	@string name;

	@record('author') owner;

	@array('author') owners;

	@object('spec') spec;

	@array('spec') specs;

}
