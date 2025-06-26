var __ember_auto_import__;(()=>{var e={81:(e,t,i)=>{"use strict"
function r(e,t,i){return(t="symbol"==typeof(r=function(e){if("object"!=typeof e||!e)return e
var t=e[Symbol.toPrimitive]
if(void 0!==t){var i=t.call(e,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(t))?r:String(r))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e
var r}function n(e,t,i,r){i&&Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function o(e,t,i,r,n){var o={}
return Object.keys(r).forEach((function(e){o[e]=r[e]})),o.enumerable=!!o.enumerable,o.configurable=!!o.configurable,("value"in o||o.initializer)&&(o.writable=!0),o=i.slice().reverse().reduce((function(i,r){return r(e,t,i)||i}),o),n&&void 0!==o.initializer&&(o.value=o.initializer?o.initializer.call(n):void 0,o.initializer=void 0),void 0===o.initializer&&(Object.defineProperty(e,t,o),o=null),o}i.d(t,{_:()=>o,a:()=>n,b:()=>r})},201:(e,t,i)=>{"use strict"
i.r(t),i.d(t,{default:()=>m})
var r=i(81)
const n=require("@ember/runloop")
var o=i(735),s=i.n(o)
const l=require("@ember/utils"),a=require("@ember/debug")
var u,c,p,d,h
const f="undefined"!=typeof FastBoot,b="routeDidChange",v=["separator","prepend","replace"]
let m=(u=(0,o.inject)("router"),c=(0,o.inject)("-document"),p=class extends(s()){constructor(e){if(super(e),(0,r.a)(this,"router",d,this),(0,r.a)(this,"document",h,this),(0,r.b)(this,"tokens",[]),(0,r.b)(this,"_defaultConfig",{separator:" | ",prepend:!0,replace:null}),(0,r.b)(this,"scheduleTitleUpdate",(()=>{(0,n.scheduleOnce)("afterRender",this,this._updateTitle)})),this._validateExistingTitleElement(),function(e){return"resolveRegistration"in e}(e)){const i=e.resolveRegistration("config:environment")
"object"==typeof(t=i)&&null!==t&&"pageTitle"in t&&v.forEach((e=>{if(!(0,l.isEmpty)(i.pageTitle[e])){const t=i.pageTitle[e]
this._defaultConfig[e]=t}}))}var t
this.router.on(b,this.scheduleTitleUpdate)}applyTokenDefaults(e){const t=this._defaultConfig.separator,i=this._defaultConfig.prepend,r=this._defaultConfig.replace
e.previous??=null,e.next??=null,null==e.separator&&(e.separator=t),null==e.prepend&&null!=i&&(e.prepend=i),null==e.replace&&null!=r&&(e.replace=r)}inheritFromPrevious(e){const t=e.previous
t&&(null==e.separator&&(e.separator=t.separator),null==e.prepend&&(e.prepend=t.prepend))}push(e){const t=this._findTokenById(e.id)
if(t){const i=this.tokens.indexOf(t),r=[...this.tokens],n=t.previous
return e.previous=n,e.next=t.next,this.inheritFromPrevious(e),this.applyTokenDefaults(e),r.splice(i,1,e),void(this.tokens=r)}const i=this.tokens.slice(-1)[0]
i&&(e.previous=i??null,i.next=e,this.inheritFromPrevious(e)),this.applyTokenDefaults(e),this.tokens=[...this.tokens,e]}remove(e){const t=this._findTokenById(e)
if(!t)return
const{next:i,previous:r}=t
i&&(i.previous=r),r&&(r.next=i),t.previous=t.next=null
const n=[...this.tokens]
n.splice(n.indexOf(t),1),this.tokens=n}get visibleTokens(){const e=this.tokens
let t=e?e.length:0
const i=[]
for(;t--;){const r=e[t]
if(r){if(r.replace){i.unshift(r)
break}i.unshift(r)}}return i}get sortedTokens(){const e=this.visibleTokens
if(!e)return[]
let t=!0,i=[]
const r=[i],n=[]
return e.forEach((e=>{if(e.front)n.unshift(e)
else if(e.prepend){t&&(t=!1,i=[],r.push(i))
const n=i[0]
n&&((e={...e}).separator=n.separator),i.unshift(e)}else t||(t=!0,i=[],r.push(i)),i.push(e)})),n.concat(r.reduce(((e,t)=>e.concat(t)),[]))}toString(){const e=this.sortedTokens,t=[]
for(let i=0,r=e.length;i<r;i++){const n=e[i]
n&&n.title&&(t.push(n.title),i+1<r&&t.push(n.separator))}return t.join("")}willDestroy(){super.willDestroy(),this.router.off(b,this.scheduleTitleUpdate)}_updateTitle(){const e=this.toString()
f?this.updateFastbootTitle(e):this.document.title=e,this.titleDidUpdate(e)}_validateExistingTitleElement(){f||(0,a.assert)("[ember-page-title]: Multiple title elements found. Check for other addons like ember-cli-head updating <title> as well.",document.head.querySelectorAll("title").length<=1)}_findTokenById(e){return this.tokens.find((t=>t.id===e))}updateFastbootTitle(e){if(!f)return
const t=this.document.head,i=t.childNodes
for(let o=0;o<i.length;o++){const e=i[o]
e&&"title"===e.nodeName.toLowerCase()&&t.removeChild(e)}const r=this.document.createElement("title"),n=this.document.createTextNode(e)
r.appendChild(n),t.appendChild(r)}titleDidUpdate(e){}},d=(0,r._)(p.prototype,"router",[u],{configurable:!0,enumerable:!0,writable:!0,initializer:null}),h=(0,r._)(p.prototype,"document",[c],{configurable:!0,enumerable:!0,writable:!0,initializer:null}),p)},205:function(e,t){window._eai_r=require,window._eai_d=define},520:(e,t,i)=>{e.exports=function(){var e=_eai_d,t=_eai_r
function r(e){return e&&e.__esModule?e:Object.assign({default:e},e)}window.emberAutoImportDynamic=function(e){return 1===arguments.length?t("_eai_dyn_"+e):t("_eai_dynt_"+e)(Array.prototype.slice.call(arguments,1))},window.emberAutoImportSync=function(e){return t("_eai_sync_"+e)(Array.prototype.slice.call(arguments,1))},e("ember-page-title/helpers/page-title",["@ember/service"],(function(){return r(i(887))})),e("ember-page-title/services/page-title",["@ember/service"],(function(){return r(i(201))}))}()},735:e=>{"use strict"
e.exports=require("@ember/service")},887:(e,t,i)=>{"use strict"
i.r(t),i.d(t,{default:()=>p})
var r=i(81),n=i(735)
const o=require("@ember/component/helper")
var s=i.n(o)
const l=require("@ember/object/internals")
var a,u,c
let p=(a=(0,n.inject)("page-title"),u=class extends(s()){constructor(e){super(e),(0,r.a)(this,"tokens",c,this),(0,r.b)(this,"tokenId",(0,l.guidFor)(this)),this.tokens.push({id:this.tokenId})}compute(e,t){const i={...t,id:this.tokenId,title:e.join("")}
return this.tokens.push(i),this.tokens.scheduleTitleUpdate(),""}willDestroy(){super.willDestroy(),this.tokens.remove(this.tokenId),this.tokens.scheduleTitleUpdate()}},c=(0,r._)(u.prototype,"tokens",[a],{configurable:!0,enumerable:!0,writable:!0,initializer:null}),u)}},t={}
function i(r){var n=t[r]
if(void 0!==n)return n.exports
var o=t[r]={exports:{}}
return e[r].call(o.exports,o,o.exports,i),o.exports}i.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e
return i.d(t,{a:t}),t},i.d=(e,t)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i(205)
var r=i(520)
__ember_auto_import__=r})()
