import Queue from './classes/queue';
import Defer from './classes/defer';
import { assert } from '@ember/debug';

export { timeout } from '@ascua/promise';

export function queue(target, key, desc) {

	assert(
		'The queue decorator must only be applied to a function',
		desc.value && typeof desc.value === 'function',
	);

	let s = Symbol(key);

	return {
		enumerable: true,
		configurable: true,
		get() {
			return this[s] ? this[s] : this[s] = new Queue(this, desc.value);
		},
	};

}

export function defer(target, key, desc) {

	assert(
		'The defer decorator must only be applied to a function',
		desc.value && typeof desc.value === 'function',
	);

	let s = Symbol(key);

	return {
		enumerable: true,
		configurable: true,
		get() {
			return this[s] ? this[s] : this[s] = new Defer(this, desc.value);
		},
	};

}
