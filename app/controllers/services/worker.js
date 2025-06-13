import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class extends Controller {
	@service worker;
}
