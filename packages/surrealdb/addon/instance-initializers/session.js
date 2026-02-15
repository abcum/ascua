export default {
  name: 'session',

  initialize(instance) {
    // Instantiate the session service
    instance.lookup('service:session');
  },
};
