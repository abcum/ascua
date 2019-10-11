import { setModifierManager, capabilities } from '@ember/modifier';

function setup(state, owner, element, callback, debounce) {
	let fn = function(element) {
		state.timeout = setTimeout( () => callback(element), debounce);
	};
	owner.lookup('service:resize').setup(element, fn, { callOnAdd: false });
	return fn;
}

function clear(state, owner, element, callback) {
	clearTimeout(state.timeout);
	owner.lookup('service:resize').clear(element, fn);
}

export default setModifierManager(
	(owner) => ({

		capabilities: capabilities ? capabilities('3.13') : undefined,

		createModifier() {
			return {
				element: null,
				timeout: null,
				callback: null,
			};
		},

		installModifier(state, element, { positional: [callback], named: { debounce = 0 } }) {
			state.element = element;
			state.callback = setup(state, owner, state.element, callback, debounce);
		},

		updateModifier(state, { positional: [callback], named: { debounce = 0 } }) {
			clear(state, owner, state.element, state.callback);
			state.callback = setup(state, owner, state.element, callback, debounce);
		},

		destroyModifier(state) {
			clear(state, owner, state.element, state.callback);
		},

	}),
	class DidResizeModifier {}
);