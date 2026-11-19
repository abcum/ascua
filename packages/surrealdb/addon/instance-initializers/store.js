export default {
  name: 'store',

  initialize(instance) {
    // Instantiate the store service
    instance.lookup('service:store');
  },
};
