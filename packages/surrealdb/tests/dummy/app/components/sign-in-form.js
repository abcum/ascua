import Component from '@glimmer/component';
import { inject } from '@ember/service';
import { action } from '@ember/object';
import config from '@ascua/config';

export default class SignInForm extends Component {
  @inject surreal;
  @inject router;

  email = 'email';
  pass = 'pass';

  @action async signin() {
    try {
      await this.surreal.signin({
        namespace: config.surreal.namespace,
        database: config.surreal.database,
        scope: 'account',
        email: this.email,
        pass: this.pass,
      });

      this.router.transitionTo('surreal.index');
    } catch (e) {
      // Signin failed
    }
  }
}
