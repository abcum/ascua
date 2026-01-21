import Route from '@ember/routing/route';
import { invalidated } from '@ascua/surrealdb';

export default
@invalidated
class extends Route {
  redirectIfAuthenticated = 'surreal';
}
