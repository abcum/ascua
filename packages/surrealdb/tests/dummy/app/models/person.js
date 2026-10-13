import Model from '@ascua/surrealdb/model';
import { string } from '@ascua/surrealdb/field';

export default class Person extends Model {
  @string name;
}
