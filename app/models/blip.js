import Model from '@ascua/surreal/model';
import { autosave } from '@ascua/surreal';
import { record } from '@ascua/surreal/field';

// Retry fixture: creating one of these fires a `notify` event that sleeps
// briefly before bumping its `beacon`, the same shape as the schema events
// this addon's `.retry()` support exists for.

@autosave
export default class Blip extends Model {

	@record('beacon') beacon;

}
