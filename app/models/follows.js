import Model from '@ascua/surreal/model';
import { datetime } from '@ascua/surreal/field';

// relate() fixture: a minimal graph edge between two `author` records.

export default class Follows extends Model {

	@datetime since;

}
