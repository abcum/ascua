// The pseudo-locale pads and accents every string, so unextracted text and tight layouts are obvious.
export const PSEUDO = 'en-XA';

const ACCENTS = {
	a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'ý',
	A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', Y: 'Ý',
};

// Turns `pt_pt` or `PT-pt` into `pt-PT`.
export function normalise(locale) {
	let [ language, ...rest ] = String(locale).replace(/_/g, '-').split('-');
	rest = rest.map(part => part.length === 2 ? part.toUpperCase() : part.length === 4 ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part);
	return [ language.toLowerCase(), ...rest ].join('-');
}

// Lists every locale to try for a message, most specific first.
export function chain(locale, fallback = 'en') {
	let parts = normalise(locale).split('-');
	let list = [];
	while (parts.length) {
		list.push(parts.join('-'));
		parts.pop();
	}
	if (fallback && !list.includes(fallback)) {
		list.push(fallback);
	}
	return list;
}

// Picks the best supported locale for a preference-ordered list such as `navigator.languages`.
export function negotiate(requested, supported, fallback = 'en') {
	let wanted = supported.map(normalise);
	for (let request of [].concat(requested || [])) {
		for (let candidate of chain(request, null)) {
			let index = wanted.indexOf(candidate);
			if (index !== -1) {
				return supported[index];
			}
		}
		let language = normalise(request).split('-')[0];
		let index = wanted.findIndex(locale => locale.split('-')[0] === language);
		if (index !== -1) {
			return supported[index];
		}
	}
	return fallback;
}

// Accents letters and doubles vowels, giving roughly 30% extra length.
export function pseudo(text) {
	return text.replace(/[aeiouyAEIOUY]/g, char => ACCENTS[char] + (/[aeiou]/.test(char) ? ACCENTS[char] : ''));
}
