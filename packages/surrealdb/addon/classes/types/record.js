import Ember from 'ember';
import { get, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
const { combine, updateTag, tagFor, tagMetaFor } =
  Ember.__loader.require('@glimmer/validator');
const { CUSTOM_TAG_FOR, tagForObject, tagForProperty } = Ember.__loader.require(
  '@ember/-internals/metal'
);

// https://github.com/emberjs/ember.js/blob/master/packages/%40ember/-internals/runtime/lib/mixins/-proxy.js

export function contentFor(proxy) {
  let content = proxy.content;
  updateTag(tagForObject(proxy), tagForObject(content));
  return content;
}

export default class Remote {
  static initiate(data) {
    return new Proxy(new Remote(data), {
      get(target, key) {
        switch (true) {
          case key in target && typeof target[key] === 'function':
            return target[key].bind(target);
          case typeof key === 'symbol':
            return target[key];
          case key in target:
            return target[key];
          case target.content && typeof target.content[key] === 'function':
            return target.content[key].bind(target.content);
          default:
            target.setup();
            return get(target, `content.${key}`);
        }
      },
      set(target, key, val) {
        switch (true) {
          case key in target:
            target[key] = val;
            return true;
          default:
            target.setup();
            set(target, `content.${key}`, val);
            return true;
        }
      },
    });
  }

  #id = undefined;

  #content = undefined;

  #promise = undefined;

  @tracked content = undefined;

  toJSON() {
    return this.#id;
  }

  toString() {
    return this.#id;
  }

  constructor(params) {
    this.#id = params.id;
    this.content = params.content;
    this.#content = params.content;
    this.#promise = params.promise;
  }

  [CUSTOM_TAG_FOR](key) {
    let meta = tagMetaFor(this);
    let tag = tagFor(this, key, meta);
    if (key in this) {
      return tag;
    } else {
      let tags = [tag, tagFor(this, 'content', meta)];
      let content = contentFor(this);
      if (content && typeof content === 'object') {
        tags.push(tagForProperty(content, key));
      }
      return combine(tags);
    }
  }

  then() {
    this.setup();
    return Promise.resolve(this.#promise || this.#content).then(...arguments);
  }

  catch() {
    this.setup();
    return Promise.resolve(this.#promise || this.#content).catch(...arguments);
  }

  finally() {
    this.setup();
    return Promise.resolve(this.#promise || this.#content).finally(
      ...arguments
    );
  }

  setup() {
    if (this.#promise && this.#promise instanceof Function) {
      this.#promise = this.#promise();

      Promise.resolve(this.#promise).then(
        (content) => {
          this.content = content;
          return content;
        },
        (failure) => {
          this.failure = failure;
          throw failure;
        }
      );
    }
  }
}
