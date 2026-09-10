import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Remote from '@electron/remote';
import Electron from 'electron';

const list = (item) => {
	return {
		role: item.role,
		type: item.type,
		label: item.label,
		enabled: !!item.enabled,
		visible: !!item.visible,
		checked: !!item.checked,
		sublabel: item.sublabel,
		accelerator: item.accelerator,
		click: () => item.click(),
	};
}

function enabled() {
	try {
		if (!window) throw "exception";
		if (!window.addEventListener) throw "exception";
		return true;
	} catch (e) {
		return false;
	}
}

export default class extends Service {

	@tracked enabled = false;

	@tracked x = 0;

	@tracked y = 0;

	// The name and model of the menu currently mounted, read by
	// `<Ascua::Render>` to pick which component to invoke. `null` means
	// nothing is showing — see `load`/`hide`.

	@tracked menuName = null;

	@tracked menuModel = null;

	// Shared with `campaigns/campaign/{candidates,screening}` menus' "copy to
	// another campaign" item. That action lives in a menu component mounted
	// under `<Ascua::Render>`, nowhere near the candidates/screening route it
	// needs to show a modal over — the two were previously bridged by
	// classic Ember's implicit nested-controller access
	// (`candidates`'s controller reaching a `menu` child controller by name),
	// which depended on the same named-outlet render this service no longer
	// does, and had already stopped working for that reason. The service is
	// the one thing both sides already inject, so it carries the state
	// instead.

	@tracked showDuplicateModal = false;

	@tracked duplicateModel = null;

	@action openDuplicateModal(model) {

		this.duplicateModel = model;

		this.showDuplicateModal = true;

	}

	@action closeDuplicateModal() {

		this.showDuplicateModal = false;

		this.duplicateModel = null;

	}

	// Shared with the contacts/organisations/campaigns list menus' "Delete"
	// item. Those menus are mounted under `<Ascua::Render>`, nowhere near the
	// list route whose confirmation modal needs to show - the same gap
	// `showDuplicateModal` above bridges, for the same reason.

	@tracked deleteTarget = null;

	@action confirmDelete(model) {

		this.deleteTarget = model;

	}

	@action cancelDelete() {

		this.deleteTarget = null;

	}

	items = [];

	constructor() {

		super(...arguments);

		if (enabled() === false) return;

		document.addEventListener('contextmenu', (e) => {
			try {
				switch (true) {
					case e.target.isContentEditable:
						this.prep(document.body, e, {}, 'application/menu/text');
						this.show(document.body, e, {}, 'application/menu/text');
						break;
					case e.target.matches('input,textarea'):
						this.prep(document.body, e, {}, 'application/menu/text');
						this.show(document.body, e, {}, 'application/menu/text');
						break;
					default:
						this.prep(document.body, e, {}, 'application/menu/main');
						this.show(document.body, e, {}, 'application/menu/main');
						break;
				}
			} catch (e) {
				// Ignore
			}
		});

		document.addEventListener('mousedown', (e) => {
			if (!e.target.matches('context-menu-item')) {
				this.hide();
			}
		});

		document.addEventListener('keydown', (e) => {
			if (e.which == 27) this.hide();
		});

	}

	load(name, model) {

		this.items = [];

		// `@menu` is written both dotted (`contacts.contact.menu.email`, the
		// old route-name convention) and slashed
		// (`campaigns/campaign/candidates/menu`) across the app's existing
		// templates. A dynamic `{{component}}` invocation needs the slashed
		// form; normalising here means neither convention has to change at
		// the 20-odd call sites that already use one or the other.

		this.menuName = name.replace(/\./g, '/');

		this.menuModel = model;

	}

	hide() {

		this.menuName = null;

		this.menuModel = null;

		this.enabled = false;

		this.element = null;

	}

	prep(element, event, vars, name, model) {

		this.element = element;

		return false;

	}

	show(element, event, vars, name, model) {

		if (Electron) {
			return this.showDesktop(element, event, vars, name, model);
		} else {
			return this.showBrowser(element, event, vars, name, model);
		}

	}

	showBrowser(element, event, vars, name, model) {

		if (event.target.matches('input,textarea'))
			return true;

		if (event.target.isContentEditable)
			return true;

		this.x = event.clientX;
		this.y = event.clientY;

		this.enabled = true;

		this.load(name, model);

		event.preventDefault();

		return false;

	}

	showDesktop(element, event, vars, name, model) {

		if (this.element !== element)
			return true;

		this.load(name, model);

		setTimeout(() => {

			// Fetch remote variables
			const window = Remote.getCurrentWindow();
			const session = window.webContents.session;

			// Build the menu from the template.
			let menu = Remote.Menu.buildFromTemplate(this.items.map(list));

			// Check to see if there are dictionary suggestions
			if (vars.dictionarySuggestions && vars.dictionarySuggestions.length > 0) {

				// Add a separator at the top of the menu.
				menu.insert(0, new Remote.MenuItem({
					type: 'separator',
				}));

				// Enable add-to-dictionary for misspelling.
				if (vars.misspelledWord) {
					menu.insert(0, new Remote.MenuItem({
						label: 'Add to dictionary',
						click: () => session.addWordToSpellCheckerDictionary(vars.misspelledWord)
					}));
					menu.insert(0, new Remote.MenuItem({
						type: 'separator',
					}));
				}

				// List spelling suggestions at top of menu.
				for (const [i, v] of vars.dictionarySuggestions.entries()) {
					menu.insert(i, new Remote.MenuItem({
						label: v,
						click: () => window.webContents.replaceMisspelling(v)
					}));
				}

			}

			// Display the contextmenu in the window.
			menu.popup({
				window: window,
				callback: () => {
					this.hide()
				},
			});

		});

		event.preventDefault();

		return false;

	}

}
