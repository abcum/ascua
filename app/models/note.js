import Field from '@ascua/surreal/field';
import { string } from '@ascua/surreal/field';

// Test fixture embedded object (Field), nested one level deeper inside
// `spec` — mirrors the doubly-nested shapes app.hireinsight.io uses.

export default class Note extends Field {

	@string text;

}
