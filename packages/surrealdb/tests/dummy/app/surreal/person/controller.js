import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SurrealPersonController extends Controller {
  @service store;

  @action
  async updatePerson(item) {
    await this.store.update(item.id, item);
  }

  @action
  async modifyPerson(item) {
    await this.store.modify(item, [
      { op: 'replace', path: '/name', value: item.name },
    ]);
  }
}
