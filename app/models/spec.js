import Field from '@ascua/surreal/field';
import { array, object, string } from '@ascua/surreal/field';

// Test fixture embedded object (Field) which itself contains an array and a
// further embedded object, so a `spec` can be exercised both on its own
// (`gizmo.spec`) and as an element of an array (`gizmo.specs`).

export default class Spec extends Field {

	@string code;

	@array('string') tags;

	@object('note') note;

}
