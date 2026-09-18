import Model from '@ascua/surreal/model';
import { autosave } from '@ascua/surreal';
import { number } from '@ascua/surreal/field';

// Retry fixture: the shared record several concurrent `blip` CREATEs race
// to bump, reproducing a genuine "Transaction conflict".

@autosave
export default class Beacon extends Model {

	@number hits;

}
