import uniq from './uniq';
import test from './test';

import window from 'ember-window-mock';

const persisted = test();

export default function () {
  if (persisted === false) {
    return uniq(64);
  }

  if (persisted === true) {
    let session = window.localStorage.getItem('session');

    if (session === null || session.length != 64) {
      session = uniq(64);
    }

    window.localStorage.setItem('session', session);

    return session;
  }
}
