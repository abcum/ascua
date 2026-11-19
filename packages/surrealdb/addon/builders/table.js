export default function (table, options = {}) {
  let bits = [];

  let vars = options.param || {};

  vars.tb = table;

  bits.push('SELECT');

  if (options.field) {
    bits.push(options.field.join(', '));
  } else {
    bits.push('*');
  }

  bits.push('FROM type::table($tb)');

  if (options.where && options.where.length) {
    bits.push(`WHERE ${options.where.join(' AND ')}`);
  }

  if (options.group) {
    bits.push(`GROUP BY ${options.group}`);
  }

  if (options.order) {
    bits.push(`ORDER BY ${options.order}`);
  }

  if (options.limit) {
    bits.push('LIMIT BY $limit');
    vars.limit = options.limit;
  }

  if (options.start) {
    bits.push('START AT $start');
    vars.start = options.start;
  }

  if (options.fetch && options.fetch.length) {
    bits.push(`FETCH ${options.fetch.join(', ')}`);
  }

  if (options.version) {
    bits.push('VERSION $versn');
    vars.versn = options.version;
  }

  return { text: bits.join(' '), vars };
}
