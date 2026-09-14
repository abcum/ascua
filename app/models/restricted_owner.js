import Model from '@ascua/surreal/model';
import { string } from '@ascua/surreal/field';

// Test fixture backing the `restricted_owner` table, which the `restricted`
// record access signs in as - so a record-access session has a model to
// inject its `$auth` record into, the way a real app's user model does.

export default class RestrictedOwner extends Model {

	@string name;

}
