import EmberRouter from '@ember/routing/router';
import config from 'ascua/config/environment';

export default class Router extends EmberRouter {
	location = config.locationType;
	rootURL = config.rootURL;
}

Router.map(function() {

	this.route('guides', function() {
		this.route('styling');
		this.route('electron');
		this.route('bigdata', function() {
			this.route('sparse');
			this.route('infinite');
		});
		this.route('webapps', function() {
			this.route('images');
			this.route('fastboot');
			this.route('minification');
		});
		this.route('tasks', function() {
			this.route('defining');
			this.route('running');
			this.route('catching');
			this.route('cancelling');
		});
		this.route('surreal', function() {
			this.route('routing');
			this.route('authing');
			this.route('defining');
			this.route('selecting');
			this.route('modifying');
		});
	});

	this.route('services', function() {
		this.route('clock');
		this.route('electron');
		this.route('internet');
		this.route('location');
		this.route('metrics');
		this.route('storage');
		this.route('store');
		this.route('surreal');
		this.route('update');
		this.route('worker');
	});

	this.route('elements', function() {
		this.route('calendar');
		this.route('codemirror');
		this.route('contextmenu');
		this.route('dragdrop');
		this.route('dropdown');
		this.route('editable');
		this.route('iframe');
		this.route('gravatar');
		this.route('gridlist');
		this.route('initials');
		this.route('image');
		this.route('input');
		this.route('link');
		this.route('masonry');
		this.route('modal');
		this.route('select');
		this.route('social');
		this.route('label');
		this.route('tooltip');
		this.route('uploader');
		this.route('webview');
	});

	this.route('helpers', function() {
		this.route('arrays');
		this.route('dom');
		this.route('events');
		this.route('format');
		this.route('keyboard');
		this.route('logic');
		this.route('maths');
		this.route('promise');
		this.route('routing');
		this.route('strings');
	});

	this.route('libraries', function() {
		this.route('aos');
		this.route('apexcharts', function() {
			this.route('elements');
		});
		this.route('big');
		this.route('bignumber');
		this.route('chart', function() {
			this.route('elements');
		});
		this.route('codemirror', function() {
			this.route('elements');
		});
		this.route('cropper', function() {
			this.route('elements');
		});
		this.route('day', function() {
			this.route('helpers');
		});
		this.route('decimal');
		this.route('facebook', function() {
			this.route('elements');
		});
		this.route('handsontable', function() {
			this.route('elements');
		});
		this.route('jsoneditor', function() {
			this.route('elements');
		});
		this.route('mapbox-gl');
		this.route('marked', function() {
			this.route('helpers');
		});
		this.route('moment', function() {
			this.route('helpers');
		});
		this.route('pdf-lib');
		this.route('pdf', function() {
			this.route('elements');
		});
		this.route('prism', function() {
			this.route('elements');
		});
		this.route('quill', function() {
			this.route('elements');
			this.route('helpers');
		});
		this.route('sheet');
		this.route('sortable', function() {
			this.route('elements');
		});
		this.route('stripe', function() {
			this.route('elements');
		});
		this.route('zip');
	});

});
