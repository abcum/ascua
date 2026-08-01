export default function (table, options = {}) {
  let bits = [];

  let vars = options.param || {};

  vars.tb = table;

  bits.push('SELECT');

  bits.push('count(*) AS count');

  bits.push('FROM type::table($tb)');

  if (options.where && options.where.length) {
    bits.push(`WHERE ${options.where.join(' AND ')}`);
  }

  bits.push(`GROUP BY all`);

  return { text: bits.join(' '), vars };
}
