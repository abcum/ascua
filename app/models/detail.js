import Field from '@ascua/surreal/field';
import { string, number } from '@ascua/surreal/field';

// Test fixture embedded object (Field) used by the `book` model.

export default class Detail extends Field {

	@string isbn;

	@number pages;

}
