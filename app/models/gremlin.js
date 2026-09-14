import Model from '@ascua/surreal/model';
import { autosave } from '@ascua/surreal';
import { string } from '@ascua/surreal/field';

// Test fixture whose `name` field carries a server-side ASSERT, so a write
// can be made to fail for real - used to exercise rollback, error reporting
// and the record's state after a rejected save.

@autosave
export default class Gremlin extends Model {

	@string name;

	@string note;

}
