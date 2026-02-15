export class DestroyedError extends Error {
  constructor() {
    super();
    this.name = 'DestroyedError';
  }
}

export default {
  DestroyedError: DestroyedError,
};
