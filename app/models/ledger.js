import Model from '@ascua/surreal/model';
import { datetime, number } from '@ascua/surreal/field';

// .content() vs .replace() fixture: `opened` is READONLY.

export default class Ledger extends Model {

	@datetime opened;

	@number balance;

}
