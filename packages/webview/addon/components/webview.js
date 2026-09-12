import Iframe from '@ascua/iframe/components/iframe';

export default class extends Iframe {

	get partition() {
		return Math.random().toString(36).substr(2, 10);
	}

}
