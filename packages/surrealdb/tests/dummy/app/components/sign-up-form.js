import Component from '@glimmer/component';
import { inject } from '@ember/service';
import { action } from '@ember/object';
import config from '@ascua/config';

export default class SignUpForm extends Component {
  @inject surreal;
  @inject router;

  email = '';
  pass = '';

  @action async signup() {
    try {
      await this.surreal.signup({
        namespace: config.surreal.namespace,
        database: config.surreal.database,
        scope: 'account',
        email: this.email,
        pass: this.pass,
      });

      this.router.transitionTo('surreal.index');
    } catch (e) {
      // Signup failed
    }
  }
}
