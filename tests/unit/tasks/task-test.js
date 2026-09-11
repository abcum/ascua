import { module, test } from 'qunit';
import { get } from '@ember/object';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import Task from '@ascua/tasks/classes/task';

// `tasks` is a plain array, not `@tracked` (see the comment on the class) -
// a consumer (this addon's own docs page renders
// `{{this.mytask.tasks.length}}`) depends on its '[]' tag instead, same as
// the identity-cache array and RecordArray fixed alongside this in the same
// session. `pushObject`/`removeObject` used to dirty that tag as a side
// effect of Ember's Array prototype extensions; now that push/pop/splice
// are called directly, `run()` has to call `notifyPropertyChange('[]')`
// itself after each one - on start (push), on a restart superseding a
// pending task (pop), and once a task finishes (splice).

function tracked(tasks) {
	return createCache(() => {
		// eslint-disable-next-line ember/no-get
		get(tasks, '[]');
		return tasks.length;
	});
}

function deferred() {
	let resolve;
	let promise = new Promise((r) => (resolve = r));
	return { promise, resolve };
}

module('Unit | tasks | task', function () {
	test('push notifies a length consumer as soon as the task starts', async function (assert) {
		let d = deferred();
		let instance = new Task(
			{},
			function* (p) {
				yield p;
			},
			'task',
		);
		let cache = tracked(instance.tasks);

		assert.strictEqual(getValue(cache), 0, 'nothing running yet');

		let running = instance.run(d.promise);

		assert.strictEqual(
			getValue(cache),
			1,
			'the push notified before the task settles, not after',
		);

		d.resolve();
		await running;
	});

	test('splice notifies a length consumer once the task finishes', async function (assert) {
		let d = deferred();
		let instance = new Task(
			{},
			function* (p) {
				yield p;
			},
			'task',
		);
		let cache = tracked(instance.tasks);

		let running = instance.run(d.promise);
		assert.strictEqual(getValue(cache), 1, 'running');

		d.resolve();
		await running;

		assert.strictEqual(
			getValue(cache),
			0,
			'the splice notified once the task was removed',
		);
	});

	test('restarting pops the superseded task, notifying the consumer', async function (assert) {
		let instance = new Task(
			{},
			function* (p) {
				yield p;
			},
			'restart',
		);

		instance.run(new Promise(() => {})); // never settles - superseded before it could

		let calls = 0;
		let cache = createCache(() => {
			calls++;
			// eslint-disable-next-line ember/no-get
			get(instance.tasks, '[]');
			return instance.tasks.length;
		});

		assert.strictEqual(getValue(cache), 1, 'the first task is running');
		assert.strictEqual(calls, 1, 'primed');

		let d = deferred();
		let second = instance.run(d.promise);

		// The pop (cancelling the superseded first task) and the push
		// (starting the second) both happen synchronously inside run(),
		// before either promise settles, so the length comes out the same
		// on either side of this call - but the cache still had to
		// recompute to know that, which only happens if a
		// notifyPropertyChange('[]') actually fired for the pop.
		assert.strictEqual(
			getValue(cache),
			1,
			'still one task after the restart replaced it',
		);
		assert.strictEqual(
			calls,
			2,
			'the restart invalidated the cache even though the count came out the same',
		);

		d.resolve();
		await second;
	});
});
