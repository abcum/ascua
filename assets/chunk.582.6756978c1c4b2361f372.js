var __ember_auto_import__;(()=>{var e={81:(e,t,r)=>{"use strict"
function i(e,t,r){return(t="symbol"==typeof(i=function(e){if("object"!=typeof e||!e)return e
var t=e[Symbol.toPrimitive]
if(void 0!==t){var r=t.call(e,"string")
if("object"!=typeof r)return r
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(t))?i:String(i))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e
var i}function n(e,t,r,i){r&&Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(i):void 0})}function o(e,t,r,i,n){var o={}
return Object.keys(i).forEach((function(e){o[e]=i[e]})),o.enumerable=!!o.enumerable,o.configurable=!!o.configurable,("value"in o||o.initializer)&&(o.writable=!0),o=r.slice().reverse().reduce((function(r,i){return i(e,t,r)||r}),o),n&&void 0!==o.initializer&&(o.value=o.initializer?o.initializer.call(n):void 0,o.initializer=void 0),void 0===o.initializer&&(Object.defineProperty(e,t,o),o=null),o}r.d(t,{_:()=>o,a:()=>n,b:()=>i})},170:(e,t,r)=>{var i,n
e.exports=(i=_eai_d,n=_eai_r,window.emberAutoImportDynamic=function(e){return 1===arguments.length?n("_eai_dyn_"+e):n("_eai_dynt_"+e)(Array.prototype.slice.call(arguments,1))},window.emberAutoImportSync=function(e){return n("_eai_sync_"+e)(Array.prototype.slice.call(arguments,1))},i("dom-element-descriptors",[],(function(){return(e=r(994))&&e.__esModule?e:Object.assign({default:e},e)
var e})),void r(520))},201:(e,t,r)=>{"use strict"
r.r(t),r.d(t,{default:()=>b})
var i=r(81)
const n=require("@ember/runloop")
var o=r(735),s=r.n(o)
const l=require("@ember/utils"),u=require("@ember/debug")
var a,c,p,d,f
const h="undefined"!=typeof FastBoot,m="routeDidChange",_=["separator","prepend","replace"]
let b=(a=(0,o.inject)("router"),c=(0,o.inject)("-document"),p=class extends(s()){constructor(e){if(super(e),(0,i.a)(this,"router",d,this),(0,i.a)(this,"document",f,this),(0,i.b)(this,"tokens",[]),(0,i.b)(this,"_defaultConfig",{separator:" | ",prepend:!0,replace:null}),(0,i.b)(this,"scheduleTitleUpdate",(()=>{(0,n.scheduleOnce)("afterRender",this,this._updateTitle)})),this._validateExistingTitleElement(),function(e){return"resolveRegistration"in e}(e)){const r=e.resolveRegistration("config:environment")
"object"==typeof(t=r)&&null!==t&&"pageTitle"in t&&_.forEach((e=>{if(!(0,l.isEmpty)(r.pageTitle[e])){const t=r.pageTitle[e]
this._defaultConfig[e]=t}}))}var t
this.router.on(m,this.scheduleTitleUpdate)}applyTokenDefaults(e){const t=this._defaultConfig.separator,r=this._defaultConfig.prepend,i=this._defaultConfig.replace
e.previous??=null,e.next??=null,null==e.separator&&(e.separator=t),null==e.prepend&&null!=r&&(e.prepend=r),null==e.replace&&null!=i&&(e.replace=i)}inheritFromPrevious(e){const t=e.previous
t&&(null==e.separator&&(e.separator=t.separator),null==e.prepend&&(e.prepend=t.prepend))}push(e){const t=this._findTokenById(e.id)
if(t){const r=this.tokens.indexOf(t),i=[...this.tokens],n=t.previous
return e.previous=n,e.next=t.next,this.inheritFromPrevious(e),this.applyTokenDefaults(e),i.splice(r,1,e),void(this.tokens=i)}const r=this.tokens.slice(-1)[0]
r&&(e.previous=r??null,r.next=e,this.inheritFromPrevious(e)),this.applyTokenDefaults(e),this.tokens=[...this.tokens,e]}remove(e){const t=this._findTokenById(e)
if(!t)return
const{next:r,previous:i}=t
r&&(r.previous=i),i&&(i.next=r),t.previous=t.next=null
const n=[...this.tokens]
n.splice(n.indexOf(t),1),this.tokens=n}get visibleTokens(){const e=this.tokens
let t=e?e.length:0
const r=[]
for(;t--;){const i=e[t]
if(i){if(i.replace){r.unshift(i)
break}r.unshift(i)}}return r}get sortedTokens(){const e=this.visibleTokens
if(!e)return[]
let t=!0,r=[]
const i=[r],n=[]
return e.forEach((e=>{if(e.front)n.unshift(e)
else if(e.prepend){t&&(t=!1,r=[],i.push(r))
const n=r[0]
n&&((e={...e}).separator=n.separator),r.unshift(e)}else t||(t=!0,r=[],i.push(r)),r.push(e)})),n.concat(i.reduce(((e,t)=>e.concat(t)),[]))}toString(){const e=this.sortedTokens,t=[]
for(let r=0,i=e.length;r<i;r++){const n=e[r]
n&&n.title&&(t.push(n.title),r+1<i&&t.push(n.separator))}return t.join("")}willDestroy(){super.willDestroy(),this.router.off(m,this.scheduleTitleUpdate)}_updateTitle(){const e=this.toString()
h?this.updateFastbootTitle(e):this.document.title=e,this.titleDidUpdate(e)}_validateExistingTitleElement(){h||(0,u.assert)("[ember-page-title]: Multiple title elements found. Check for other addons like ember-cli-head updating <title> as well.",document.head.querySelectorAll("title").length<=1)}_findTokenById(e){return this.tokens.find((t=>t.id===e))}updateFastbootTitle(e){if(!h)return
const t=this.document.head,r=t.childNodes
for(let o=0;o<r.length;o++){const e=r[o]
e&&"title"===e.nodeName.toLowerCase()&&t.removeChild(e)}const i=this.document.createElement("title"),n=this.document.createTextNode(e)
i.appendChild(n),t.appendChild(i)}titleDidUpdate(e){}},d=(0,i._)(p.prototype,"router",[a],{configurable:!0,enumerable:!0,writable:!0,initializer:null}),f=(0,i._)(p.prototype,"document",[c],{configurable:!0,enumerable:!0,writable:!0,initializer:null}),p)},205:function(e,t){window._eai_r=require,window._eai_d=define},520:(e,t,r)=>{e.exports=function(){var e=_eai_d,t=_eai_r
function i(e){return e&&e.__esModule?e:Object.assign({default:e},e)}window.emberAutoImportDynamic=function(e){return 1===arguments.length?t("_eai_dyn_"+e):t("_eai_dynt_"+e)(Array.prototype.slice.call(arguments,1))},window.emberAutoImportSync=function(e){return t("_eai_sync_"+e)(Array.prototype.slice.call(arguments,1))},e("ember-page-title/helpers/page-title",["@ember/service"],(function(){return i(r(887))})),e("ember-page-title/services/page-title",["@ember/service"],(function(){return i(r(201))}))}()},735:e=>{"use strict"
e.exports=require("@ember/service")},887:(e,t,r)=>{"use strict"
r.r(t),r.d(t,{default:()=>p})
var i=r(81),n=r(735)
const o=require("@ember/component/helper")
var s=r.n(o)
const l=require("@ember/object/internals")
var u,a,c
let p=(u=(0,n.inject)("page-title"),a=class extends(s()){constructor(e){super(e),(0,i.a)(this,"tokens",c,this),(0,i.b)(this,"tokenId",(0,l.guidFor)(this)),this.tokens.push({id:this.tokenId})}compute(e,t){const r={...t,id:this.tokenId,title:e.join("")}
return this.tokens.push(r),this.tokens.scheduleTitleUpdate(),""}willDestroy(){super.willDestroy(),this.tokens.remove(this.tokenId),this.tokens.scheduleTitleUpdate()}},c=(0,i._)(a.prototype,"tokens",[u],{configurable:!0,enumerable:!0,writable:!0,initializer:null}),a)},994:(e,t,r)=>{"use strict"
r.r(t),r.d(t,{IS_DESCRIPTOR:()=>i,createDescriptor:()=>p,isDescriptor:()=>n,lookupDescriptorData:()=>l,registerDescriptorData:()=>s,resolveDOMElement:()=>u,resolveDOMElements:()=>a,resolveDescription:()=>c})
const i="__dom_element_descriptor_is_descriptor__"
function n(e){return Boolean("object"==typeof e&&e&&i in e)}function o(){const e=window
return e.domElementDescriptorsRegistry=e.domElementDescriptorsRegistry||new WeakMap,e.domElementDescriptorsRegistry}function s(e,t){t?o().set(e,t):o().delete(e)}function l(e){return o().get(e)||null}function u(e){let t=n(e)?l(e):e
if(!t)return null
if(void 0!==t.element)return t.element
for(let r of t.elements||[])return r
return null}function a(e){let t=n(e)?l(e):e
if(!t)return[]
if(t.elements)return Array.from(t.elements)
{let e=t.element
return e?[e]:[]}}function c(e){let t=n(e)?l(e):e
return t?.description}function p(e){let t={[i]:!0}
return s(t,e),t}}},t={}
function r(i){var n=t[i]
if(void 0!==n)return n.exports
var o=t[i]={exports:{}}
return e[i].call(o.exports,o,o.exports,r),o.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e
return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var i in t)r.o(t,i)&&!r.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r(205)
var i=r(170)
__ember_auto_import__=i})()
