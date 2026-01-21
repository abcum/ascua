import window from 'ember-window-mock';

export default function () {
  try {
    if (!window.localStorage) throw 'exception';
    if (!window.sessionStorage) throw 'exception';
    localStorage.setItem('test', 'OK');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    /**/
  }
  return false;
}
