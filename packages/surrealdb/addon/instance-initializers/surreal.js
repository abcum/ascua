export default {
  name: 'surreal',

  initialize(instance) {
    // Instantiate the surreal service
    instance.lookup('service:surreal');
  },
};
