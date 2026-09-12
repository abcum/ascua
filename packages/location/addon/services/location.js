import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { Promise } from 'rsvp';

function enabled() {
	try {
		if (typeof FastBoot !== 'undefined') throw "exception";
		if (!window) throw "exception";
		if (!window.navigator) throw "exception";
		if (!window.navigator.geolocation) throw "exception";
		return true;
	} catch (e) {
		return false;
	}
}

export default class extends Service {

	watchid = null;

	@tracked current = null;

	find({ enableHighAccuracy = false, timeout = Infinity, maximumAge = 0 }) {

		return new Promise( (resolve, reject) => {

			if (this.watchid) return resolve(this.current);

			if (enabled() === false) return reject("Geolocation not supported");

			window.navigator.geolocation.getCurrentPosition(
				(result) => {
					this.current = result;
					resolve(result);
				},
				(reason) => {
					reject(reason);
				},
				{
					enableHighAccuracy: enableHighAccuracy,
					maximumAge: maximumAge,
					timeout: timeout,
				}
			);

		});

	}

	watch({ enableHighAccuracy = false, timeout = Infinity, maximumAge = 0 }) {

		return new Promise( (resolve, reject) => {

			if (this.watchid) return resolve(this.current);

			if (enabled() === false) return reject("Geolocation not supported");

			this.watchid = window.navigator.geolocation.watchPosition(
				(result) => {
					this.current = result;
					resolve(result);
				},
				(reason) => {
					reject(reason);
				},
				{
					enableHighAccuracy: enableHighAccuracy,
					maximumAge: maximumAge,
					timeout: timeout,
				}
			);

		});

	}

	clear() {

		if (this.watchid) navigator.geolocation.clearWatch(this.watchid);

	}

}
