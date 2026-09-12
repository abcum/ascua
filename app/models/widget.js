import Model from '@ascua/surreal/model';
import { string } from '@ascua/surreal/field';

// Test fixture model backing tests/fixtures/schema.surql's `widget` table -
// deliberately separate from Author/Book/Gadget: its own `FOR delete WHERE
// false` permission exists purely to reproduce a delete denied server-side
// (see tests/integration/surreal/delete-test.js).

export default class Widget extends Model {

	@string name;

}
