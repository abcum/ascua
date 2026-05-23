import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { attempted } from '@ascua/surrealdb';
import Storage from '@ascua/surrealdb/classes/storage';

export default
@attempted
class ApplicationRoute extends Route {
  @service surreal;
  @service router;

  #ls = new Storage();

  beforeModel(transition) {
    this.token = this.#ls.get('surreal');

    let person_id = transition?.to?.params?.person_id;

    if (this.token && !this.surreal.authenticated) {
      return this.surreal
        .authenticate(this.token)
        .then(() => {
          if (person_id) {
            this.router.transitionTo('surreal.person', person_id);
          } else {
            this.router.transitionTo('surreal');
          }
        })
        .catch(() => {
          this.router.transitionTo('signin');
        });
    }

    this.router.transitionTo('signin');
  }
}
