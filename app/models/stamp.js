import Model from '@ascua/surreal/model';
import { record, number } from '@ascua/surreal/field';

// Retry fixture: updating this record fires an UPDATE event that sleeps
// briefly before bumping its `beacon`, reproducing a genuine "Transaction
// conflict" for update()/upsert() the way `blip` does for create().

export default class Stamp extends Model {

	@record('beacon') beacon;

	@number seq;

}
