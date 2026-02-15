import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { authenticated } from '@ascua/surrealdb';

export default
@authenticated
class SurrealPersonRoute extends Route {
  redirectIfInvalidated = 'signin';

  @service store;
  @service surreal;

  model({ person_id }) {
    return this.store.select(person_id, { reload: true }).then((person) => {
      return person;
    });
  }
}
