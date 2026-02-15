export default (v) => {
  switch (v) {
    case undefined:
      return null;
    case null:
      return null;
    default:
      return String(v);
  }
};
