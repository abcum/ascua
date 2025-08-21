import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('surreal', function () {
    this.route('person', { path: '/:person_id' });
  });
  this.route('signup');
  this.route('signin');
});
