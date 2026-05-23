import md5 from '../utils/md5';

export default function (table, options = {}) {
  let bits = [];

  bits.push('SELECT');

  if (options.field) {
    bits.push(options.field.join(', '));
  } else {
    bits.push('*');
  }

  bits.push(`FROM ${table}`);

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
    bits.push(`LIMIT BY ${options.limit}`);
  }

  if (options.start) {
    bits.push(`START AT ${options.start}`);
  }

  if (options.fetch && options.fetch.length) {
    bits.push(`FETCH ${options.fetch.join(', ')}`);
  }

  if (options.version) {
    bits.push(`VERSION ${options.version}`);
  }

  let sql = bits.join(' ');

  if (options.param) {
    Object.keys(options.param).forEach((k) => {
      sql = sql.replace(`$${k}`, JSON.stringify(options.param[k]));
    });
  }

  return md5(sql);
}
