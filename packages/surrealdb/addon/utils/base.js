import window from 'ember-window-mock';

export default function (str) {
  var output = str.replace(/-/g, '+').replace(/_/g, '/');

  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }

  try {
    return decodeURIComponent(
      window.atob(str).replace(/(.)/g, (m, p) => {
        var code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) code = '0' + code;
        return '%' + code;
      })
    );
  } catch (err) {
    return window.atob(output);
  }
}
