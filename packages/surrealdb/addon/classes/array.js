export default class extends Array {
  remove(callback, target) {
    let arr = this.filter(callback, target);
    return this.removeObjects(arr);
  }

  removeBy(key, value) {
    let arr = this.filterBy(key, value);
    return this.removeObjects(arr);
  }
}
