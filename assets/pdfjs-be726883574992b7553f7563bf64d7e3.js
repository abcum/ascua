/**
 * @licstart The following is the entire license notice for the
 * Javascript code in this page
 *
 * Copyright 2020 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @licend The above is the entire license notice for the
 * Javascript code in this page
 */
(function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("pdfjs-dist/build/pdf",[],t):"object"==typeof exports?exports["pdfjs-dist/build/pdf"]=t():e["pdfjs-dist/build/pdf"]=e.pdfjsLib=t()})(this,(function(){return function(e){var t={}
function r(s){if(t[s])return t[s].exports
var n=t[s]={i:s,l:!1,exports:{}}
return e[s].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=e,r.c=t,r.d=function(e,t,s){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e
if(4&t&&"object"==typeof e&&e&&e.__esModule)return e
var s=Object.create(null)
if(r.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(s,n,function(t){return e[t]}.bind(null,n))
return s},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e}
return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"addLinkAttributes",{enumerable:!0,get:function(){return s.addLinkAttributes}}),Object.defineProperty(t,"getFilenameFromUrl",{enumerable:!0,get:function(){return s.getFilenameFromUrl}}),Object.defineProperty(t,"LinkTarget",{enumerable:!0,get:function(){return s.LinkTarget}}),Object.defineProperty(t,"loadScript",{enumerable:!0,get:function(){return s.loadScript}}),Object.defineProperty(t,"PDFDateString",{enumerable:!0,get:function(){return s.PDFDateString}}),Object.defineProperty(t,"RenderingCancelledException",{enumerable:!0,get:function(){return s.RenderingCancelledException}}),Object.defineProperty(t,"build",{enumerable:!0,get:function(){return n.build}}),Object.defineProperty(t,"getDocument",{enumerable:!0,get:function(){return n.getDocument}}),Object.defineProperty(t,"LoopbackPort",{enumerable:!0,get:function(){return n.LoopbackPort}}),Object.defineProperty(t,"PDFDataRangeTransport",{enumerable:!0,get:function(){return n.PDFDataRangeTransport}}),Object.defineProperty(t,"PDFWorker",{enumerable:!0,get:function(){return n.PDFWorker}}),Object.defineProperty(t,"version",{enumerable:!0,get:function(){return n.version}}),Object.defineProperty(t,"CMapCompressionType",{enumerable:!0,get:function(){return i.CMapCompressionType}}),Object.defineProperty(t,"createObjectURL",{enumerable:!0,get:function(){return i.createObjectURL}}),Object.defineProperty(t,"createPromiseCapability",{enumerable:!0,get:function(){return i.createPromiseCapability}}),Object.defineProperty(t,"createValidAbsoluteUrl",{enumerable:!0,get:function(){return i.createValidAbsoluteUrl}}),Object.defineProperty(t,"InvalidPDFException",{enumerable:!0,get:function(){return i.InvalidPDFException}}),Object.defineProperty(t,"MissingPDFException",{enumerable:!0,get:function(){return i.MissingPDFException}}),Object.defineProperty(t,"OPS",{enumerable:!0,get:function(){return i.OPS}}),Object.defineProperty(t,"PasswordResponses",{enumerable:!0,get:function(){return i.PasswordResponses}}),Object.defineProperty(t,"PermissionFlag",{enumerable:!0,get:function(){return i.PermissionFlag}}),Object.defineProperty(t,"removeNullCharacters",{enumerable:!0,get:function(){return i.removeNullCharacters}}),Object.defineProperty(t,"shadow",{enumerable:!0,get:function(){return i.shadow}}),Object.defineProperty(t,"UnexpectedResponseException",{enumerable:!0,get:function(){return i.UnexpectedResponseException}}),Object.defineProperty(t,"UNSUPPORTED_FEATURES",{enumerable:!0,get:function(){return i.UNSUPPORTED_FEATURES}}),Object.defineProperty(t,"Util",{enumerable:!0,get:function(){return i.Util}}),Object.defineProperty(t,"VerbosityLevel",{enumerable:!0,get:function(){return i.VerbosityLevel}}),Object.defineProperty(t,"AnnotationLayer",{enumerable:!0,get:function(){return a.AnnotationLayer}}),Object.defineProperty(t,"apiCompatibilityParams",{enumerable:!0,get:function(){return o.apiCompatibilityParams}})
Object.defineProperty(t,"GlobalWorkerOptions",{enumerable:!0,get:function(){return l.GlobalWorkerOptions}}),Object.defineProperty(t,"renderTextLayer",{enumerable:!0,get:function(){return c.renderTextLayer}}),Object.defineProperty(t,"SVGGraphics",{enumerable:!0,get:function(){return h.SVGGraphics}})
var s=r(1),n=r(5),i=r(2),a=r(16),o=r(7),l=r(10),c=r(17),h=r(18)
{const{isNodeJS:e}=r(4)
if(e){const e=r(19).PDFNodeStream;(0,n.setPDFNetworkStreamFactory)((t=>new e(t)))}else{const e=r(22).PDFNetworkStream
let t;(0,s.isFetchSupported)()&&(t=r(23).PDFFetchStream),(0,n.setPDFNetworkStreamFactory)((r=>t&&(0,s.isValidFetchUrl)(r.url)?new t(r):new e(r)))}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.addLinkAttributes=function(e,{url:t,target:r,rel:i,enabled:a=!0}={}){(0,s.assert)(t&&"string"==typeof t,'addLinkAttributes: A valid "url" parameter must provided.')
const o=(0,s.removeNullCharacters)(t)
a?e.href=e.title=o:(e.href="",e.title="Disabled: "+o,e.onclick=()=>!1)
let c=""
switch(r){case l.NONE:break
case l.SELF:c="_self"
break
case l.BLANK:c="_blank"
break
case l.PARENT:c="_parent"
break
case l.TOP:c="_top"}e.target=c,e.rel="string"==typeof i?i:n},t.getFilenameFromUrl=function(e){const t=e.indexOf("#"),r=e.indexOf("?"),s=Math.min(t>0?t:e.length,r>0?r:e.length)
return e.substring(e.lastIndexOf("/",s)+1,s)},t.isFetchSupported=c,t.isValidFetchUrl=h,t.loadScript=function(e){return new Promise(((t,r)=>{const s=document.createElement("script")
s.src=e,s.onload=t,s.onerror=function(){r(new Error("Cannot load script at: "+s.src))},(document.head||document.documentElement).appendChild(s)}))},t.deprecated=function(e){console.log("Deprecated API usage: "+e)},t.PDFDateString=t.StatTimer=t.DOMSVGFactory=t.DOMCMapReaderFactory=t.DOMCanvasFactory=t.DEFAULT_LINK_REL=t.LinkTarget=t.RenderingCancelledException=t.PageViewport=void 0
var s=r(2)
const n="noopener noreferrer nofollow"
t.DEFAULT_LINK_REL=n
const i="http://www.w3.org/2000/svg"
t.DOMCanvasFactory=class{create(e,t){if(e<=0||t<=0)throw new Error("Invalid canvas size")
const r=document.createElement("canvas"),s=r.getContext("2d")
return r.width=e,r.height=t,{canvas:r,context:s}}reset(e,t,r){if(!e.canvas)throw new Error("Canvas is not specified")
if(t<=0||r<=0)throw new Error("Invalid canvas size")
e.canvas.width=t,e.canvas.height=r}destroy(e){if(!e.canvas)throw new Error("Canvas is not specified")
e.canvas.width=0,e.canvas.height=0,e.canvas=null,e.context=null}}
t.DOMCMapReaderFactory=class{constructor({baseUrl:e=null,isCompressed:t=!1}){this.baseUrl=e,this.isCompressed=t}async fetch({name:e}){if(!this.baseUrl)throw new Error('The CMap "baseUrl" parameter must be specified, ensure that the "cMapUrl" and "cMapPacked" API parameters are provided.')
if(!e)throw new Error("CMap name must be specified.")
const t=this.baseUrl+e+(this.isCompressed?".bcmap":""),r=this.isCompressed?s.CMapCompressionType.BINARY:s.CMapCompressionType.NONE
return c()&&h(t,document.baseURI)?fetch(t).then((async e=>{if(!e.ok)throw new Error(e.statusText)
let t
return t=this.isCompressed?new Uint8Array(await e.arrayBuffer()):(0,s.stringToBytes)(await e.text()),{cMapData:t,compressionType:r}})).catch((e=>{throw new Error("Unable to load "+(this.isCompressed?"binary ":"")+"CMap at: "+t)})):new Promise(((e,n)=>{const i=new XMLHttpRequest
i.open("GET",t,!0),this.isCompressed&&(i.responseType="arraybuffer"),i.onreadystatechange=()=>{if(i.readyState===XMLHttpRequest.DONE){if(200===i.status||0===i.status){let t
if(this.isCompressed&&i.response?t=new Uint8Array(i.response):!this.isCompressed&&i.responseText&&(t=(0,s.stringToBytes)(i.responseText)),t)return void e({cMapData:t,compressionType:r})}n(new Error(i.statusText))}},i.send(null)})).catch((e=>{throw new Error("Unable to load "+(this.isCompressed?"binary ":"")+"CMap at: "+t)}))}}
t.DOMSVGFactory=class{create(e,t){(0,s.assert)(e>0&&t>0,"Invalid SVG dimensions")
const r=document.createElementNS(i,"svg:svg")
return r.setAttribute("version","1.1"),r.setAttribute("width",e+"px"),r.setAttribute("height",t+"px"),r.setAttribute("preserveAspectRatio","none"),r.setAttribute("viewBox","0 0 "+e+" "+t),r}createElement(e){return(0,s.assert)("string"==typeof e,"Invalid SVG element type"),document.createElementNS(i,e)}}
class a{constructor({viewBox:e,scale:t,rotation:r,offsetX:s=0,offsetY:n=0,dontFlip:i=!1}){this.viewBox=e,this.scale=t,this.rotation=r,this.offsetX=s,this.offsetY=n
const a=(e[2]+e[0])/2,o=(e[3]+e[1])/2
let l,c,h,d,u,p,g,f
switch(r=(r%=360)<0?r+360:r){case 180:l=-1,c=0,h=0,d=1
break
case 90:l=0,c=1,h=1,d=0
break
case 270:l=0,c=-1,h=-1,d=0
break
case 0:l=1,c=0,h=0,d=-1
break
default:throw new Error("PageViewport: Invalid rotation, must be a multiple of 90 degrees.")}i&&(h=-h,d=-d),0===l?(u=Math.abs(o-e[1])*t+s,p=Math.abs(a-e[0])*t+n,g=Math.abs(e[3]-e[1])*t,f=Math.abs(e[2]-e[0])*t):(u=Math.abs(a-e[0])*t+s,p=Math.abs(o-e[1])*t+n,g=Math.abs(e[2]-e[0])*t,f=Math.abs(e[3]-e[1])*t),this.transform=[l*t,c*t,h*t,d*t,u-l*t*a-h*t*o,p-c*t*a-d*t*o],this.width=g,this.height=f}clone({scale:e=this.scale,rotation:t=this.rotation,offsetX:r=this.offsetX,offsetY:s=this.offsetY,dontFlip:n=!1}={}){return new a({viewBox:this.viewBox.slice(),scale:e,rotation:t,offsetX:r,offsetY:s,dontFlip:n})}convertToViewportPoint(e,t){return s.Util.applyTransform([e,t],this.transform)}convertToViewportRectangle(e){const t=s.Util.applyTransform([e[0],e[1]],this.transform),r=s.Util.applyTransform([e[2],e[3]],this.transform)
return[t[0],t[1],r[0],r[1]]}convertToPdfPoint(e,t){return s.Util.applyInverseTransform([e,t],this.transform)}}t.PageViewport=a
class o extends s.BaseException{constructor(e,t){super(e),this.type=t}}t.RenderingCancelledException=o
const l={NONE:0,SELF:1,BLANK:2,PARENT:3,TOP:4}
t.LinkTarget=l
function c(){return"undefined"!=typeof fetch&&"undefined"!=typeof Response&&"body"in Response.prototype&&"undefined"!=typeof ReadableStream}function h(e,t){try{const{protocol:r}=t?new URL(e,t):new URL(e)
return"http:"===r||"https:"===r}catch(r){return!1}}let d
t.StatTimer=class{constructor(){this.started=Object.create(null),this.times=[]}time(e){e in this.started&&(0,s.warn)("Timer is already running for "+e),this.started[e]=Date.now()}timeEnd(e){e in this.started||(0,s.warn)("Timer has not been started for "+e),this.times.push({name:e,start:this.started[e],end:Date.now()}),delete this.started[e]}toString(){const e=[]
let t=0
for(const r of this.times){const e=r.name
e.length>t&&(t=e.length)}for(const r of this.times){const s=r.end-r.start
e.push(`${r.name.padEnd(t)} ${s}ms\n`)}return e.join("")}}
t.PDFDateString=class{static toDateObject(e){if(!e||!(0,s.isString)(e))return null
d||(d=new RegExp("^D:(\\d{4})(\\d{2})?(\\d{2})?(\\d{2})?(\\d{2})?(\\d{2})?([Z|+|-])?(\\d{2})?'?(\\d{2})?'?"))
const t=d.exec(e)
if(!t)return null
const r=parseInt(t[1],10)
let n=parseInt(t[2],10)
n=n>=1&&n<=12?n-1:0
let i=parseInt(t[3],10)
i=i>=1&&i<=31?i:1
let a=parseInt(t[4],10)
a=a>=0&&a<=23?a:0
let o=parseInt(t[5],10)
o=o>=0&&o<=59?o:0
let l=parseInt(t[6],10)
l=l>=0&&l<=59?l:0
const c=t[7]||"Z"
let h=parseInt(t[8],10)
h=h>=0&&h<=23?h:0
let u=parseInt(t[9],10)||0
return u=u>=0&&u<=59?u:0,"-"===c?(a+=h,o+=u):"+"===c&&(a-=h,o-=u),new Date(Date.UTC(r,n,i,a,o,l))}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.arrayByteLength=u,t.arraysToBytes=function(e){const t=e.length
if(1===t&&e[0]instanceof Uint8Array)return e[0]
let r=0
for(let i=0;i<t;i++)r+=u(e[i])
let s=0
const n=new Uint8Array(r)
for(let i=0;i<t;i++){let t=e[i]
t instanceof Uint8Array||(t="string"==typeof t?d(t):new Uint8Array(t))
const r=t.byteLength
n.set(t,s),s+=r}return n},t.assert=o,t.bytesToString=function(e){o(null!==e&&"object"==typeof e&&void 0!==e.length,"Invalid argument for bytesToString")
const t=e.length,r=8192
if(t<r)return String.fromCharCode.apply(null,e)
const s=[]
for(let n=0;n<t;n+=r){const i=Math.min(n+r,t),a=e.subarray(n,i)
s.push(String.fromCharCode.apply(null,a))}return s.join("")},t.createPromiseCapability=function(){const e=Object.create(null)
let t=!1
return Object.defineProperty(e,"settled",{get:()=>t}),e.promise=new Promise((function(r,s){e.resolve=function(e){t=!0,r(e)},e.reject=function(e){t=!0,s(e)}})),e},t.getVerbosityLevel=function(){return n},t.info=function(e){n>=s.INFOS&&console.log("Info: "+e)},t.isArrayBuffer=function(e){return"object"==typeof e&&null!==e&&void 0!==e.byteLength},t.isArrayEqual=function(e,t){if(e.length!==t.length)return!1
return e.every((function(e,r){return e===t[r]}))},t.isBool=function(e){return"boolean"==typeof e},t.isEmptyObj=function(e){for(const t in e)return!1
return!0},t.isNum=function(e){return"number"==typeof e},t.isString=function(e){return"string"==typeof e},t.isSameOrigin=function(e,t){let r
try{if(r=new URL(e),!r.origin||"null"===r.origin)return!1}catch(n){return!1}const s=new URL(t,r)
return r.origin===s.origin},t.createValidAbsoluteUrl=function(e,t){if(!e)return null
try{const r=t?new URL(e,t):new URL(e)
if(function(e){if(!e)return!1
switch(e.protocol){case"http:":case"https:":case"ftp:":case"mailto:":case"tel:":return!0
default:return!1}}(r))return r}catch(r){}return null},t.removeNullCharacters=function(e){if("string"!=typeof e)return i("The argument for removeNullCharacters must be a string."),e
return e.replace(h,"")},t.setVerbosityLevel=function(e){Number.isInteger(e)&&(n=e)},t.shadow=l,t.string32=function(e){return String.fromCharCode(e>>24&255,e>>16&255,e>>8&255,255&e)},t.stringToBytes=d,t.stringToPDFString=function(e){const t=e.length,r=[]
if("þ"===e[0]&&"ÿ"===e[1])for(let s=2;s<t;s+=2)r.push(String.fromCharCode(e.charCodeAt(s)<<8|e.charCodeAt(s+1)))
else if("ÿ"===e[0]&&"þ"===e[1])for(let s=2;s<t;s+=2)r.push(String.fromCharCode(e.charCodeAt(s+1)<<8|e.charCodeAt(s)))
else for(let s=0;s<t;++s){const t=A[e.charCodeAt(s)]
r.push(t?String.fromCharCode(t):e.charAt(s))}return r.join("")},t.stringToUTF8String=function(e){return decodeURIComponent(escape(e))},t.utf8StringToString=function(e){return unescape(encodeURIComponent(e))},t.warn=i,t.unreachable=a,t.IsEvalSupportedCached=t.IsLittleEndianCached=t.createObjectURL=t.FormatError=t.Util=t.UnknownErrorException=t.UnexpectedResponseException=t.TextRenderingMode=t.StreamType=t.PermissionFlag=t.PasswordResponses=t.PasswordException=t.MissingPDFException=t.InvalidPDFException=t.AbortException=t.CMapCompressionType=t.ImageKind=t.FontType=t.AnnotationType=t.AnnotationStateModelType=t.AnnotationReviewState=t.AnnotationReplyType=t.AnnotationMarkedState=t.AnnotationFlag=t.AnnotationFieldFlag=t.AnnotationBorderStyleType=t.UNSUPPORTED_FEATURES=t.VerbosityLevel=t.OPS=t.IDENTITY_MATRIX=t.FONT_IDENTITY_MATRIX=t.BaseException=void 0,r(3)
t.IDENTITY_MATRIX=[1,0,0,1,0,0]
t.FONT_IDENTITY_MATRIX=[.001,0,0,.001,0,0]
t.PermissionFlag={PRINT:4,MODIFY_CONTENTS:8,COPY:16,MODIFY_ANNOTATIONS:32,FILL_INTERACTIVE_FORMS:256,COPY_FOR_ACCESSIBILITY:512,ASSEMBLE:1024,PRINT_HIGH_QUALITY:2048}
t.TextRenderingMode={FILL:0,STROKE:1,FILL_STROKE:2,INVISIBLE:3,FILL_ADD_TO_PATH:4,STROKE_ADD_TO_PATH:5,FILL_STROKE_ADD_TO_PATH:6,ADD_TO_PATH:7,FILL_STROKE_MASK:3,ADD_TO_PATH_FLAG:4}
t.ImageKind={GRAYSCALE_1BPP:1,RGB_24BPP:2,RGBA_32BPP:3}
t.AnnotationType={TEXT:1,LINK:2,FREETEXT:3,LINE:4,SQUARE:5,CIRCLE:6,POLYGON:7,POLYLINE:8,HIGHLIGHT:9,UNDERLINE:10,SQUIGGLY:11,STRIKEOUT:12,STAMP:13,CARET:14,INK:15,POPUP:16,FILEATTACHMENT:17,SOUND:18,MOVIE:19,WIDGET:20,SCREEN:21,PRINTERMARK:22,TRAPNET:23,WATERMARK:24,THREED:25,REDACT:26}
t.AnnotationStateModelType={MARKED:"Marked",REVIEW:"Review"}
t.AnnotationMarkedState={MARKED:"Marked",UNMARKED:"Unmarked"}
t.AnnotationReviewState={ACCEPTED:"Accepted",REJECTED:"Rejected",CANCELLED:"Cancelled",COMPLETED:"Completed",NONE:"None"}
t.AnnotationReplyType={GROUP:"Group",REPLY:"R"}
t.AnnotationFlag={INVISIBLE:1,HIDDEN:2,PRINT:4,NOZOOM:8,NOROTATE:16,NOVIEW:32,READONLY:64,LOCKED:128,TOGGLENOVIEW:256,LOCKEDCONTENTS:512}
t.AnnotationFieldFlag={READONLY:1,REQUIRED:2,NOEXPORT:4,MULTILINE:4096,PASSWORD:8192,NOTOGGLETOOFF:16384,RADIO:32768,PUSHBUTTON:65536,COMBO:131072,EDIT:262144,SORT:524288,FILESELECT:1048576,MULTISELECT:2097152,DONOTSPELLCHECK:4194304,DONOTSCROLL:8388608,COMB:16777216,RICHTEXT:33554432,RADIOSINUNISON:33554432,COMMITONSELCHANGE:67108864}
t.AnnotationBorderStyleType={SOLID:1,DASHED:2,BEVELED:3,INSET:4,UNDERLINE:5}
t.StreamType={UNKNOWN:"UNKNOWN",FLATE:"FLATE",LZW:"LZW",DCT:"DCT",JPX:"JPX",JBIG:"JBIG",A85:"A85",AHX:"AHX",CCF:"CCF",RLX:"RLX"}
t.FontType={UNKNOWN:"UNKNOWN",TYPE1:"TYPE1",TYPE1C:"TYPE1C",CIDFONTTYPE0:"CIDFONTTYPE0",CIDFONTTYPE0C:"CIDFONTTYPE0C",TRUETYPE:"TRUETYPE",CIDFONTTYPE2:"CIDFONTTYPE2",TYPE3:"TYPE3",OPENTYPE:"OPENTYPE",TYPE0:"TYPE0",MMTYPE1:"MMTYPE1"}
const s={ERRORS:0,WARNINGS:1,INFOS:5}
t.VerbosityLevel=s
t.CMapCompressionType={NONE:0,BINARY:1,STREAM:2}
t.OPS={dependency:1,setLineWidth:2,setLineCap:3,setLineJoin:4,setMiterLimit:5,setDash:6,setRenderingIntent:7,setFlatness:8,setGState:9,save:10,restore:11,transform:12,moveTo:13,lineTo:14,curveTo:15,curveTo2:16,curveTo3:17,closePath:18,rectangle:19,stroke:20,closeStroke:21,fill:22,eoFill:23,fillStroke:24,eoFillStroke:25,closeFillStroke:26,closeEOFillStroke:27,endPath:28,clip:29,eoClip:30,beginText:31,endText:32,setCharSpacing:33,setWordSpacing:34,setHScale:35,setLeading:36,setFont:37,setTextRenderingMode:38,setTextRise:39,moveText:40,setLeadingMoveText:41,setTextMatrix:42,nextLine:43,showText:44,showSpacedText:45,nextLineShowText:46,nextLineSetSpacingShowText:47,setCharWidth:48,setCharWidthAndBounds:49,setStrokeColorSpace:50,setFillColorSpace:51,setStrokeColor:52,setStrokeColorN:53,setFillColor:54,setFillColorN:55,setStrokeGray:56,setFillGray:57,setStrokeRGBColor:58,setFillRGBColor:59,setStrokeCMYKColor:60,setFillCMYKColor:61,shadingFill:62,beginInlineImage:63,beginImageData:64,endInlineImage:65,paintXObject:66,markPoint:67,markPointProps:68,beginMarkedContent:69,beginMarkedContentProps:70,endMarkedContent:71,beginCompat:72,endCompat:73,paintFormXObjectBegin:74,paintFormXObjectEnd:75,beginGroup:76,endGroup:77,beginAnnotations:78,endAnnotations:79,beginAnnotation:80,endAnnotation:81,paintJpegXObject:82,paintImageMaskXObject:83,paintImageMaskXObjectGroup:84,paintImageXObject:85,paintInlineImageXObject:86,paintInlineImageXObjectGroup:87,paintImageXObjectRepeat:88,paintImageMaskXObjectRepeat:89,paintSolidColorImageMask:90,constructPath:91}
t.UNSUPPORTED_FEATURES={unknown:"unknown",forms:"forms",javaScript:"javaScript",smask:"smask",shadingPattern:"shadingPattern",font:"font",errorTilingPattern:"errorTilingPattern",errorExtGState:"errorExtGState",errorXObject:"errorXObject",errorFontLoadType3:"errorFontLoadType3",errorFontState:"errorFontState",errorFontMissing:"errorFontMissing",errorFontTranslate:"errorFontTranslate",errorColorSpace:"errorColorSpace",errorOperatorList:"errorOperatorList",errorFontToUnicode:"errorFontToUnicode",errorFontLoadNative:"errorFontLoadNative",errorFontGetPath:"errorFontGetPath"}
t.PasswordResponses={NEED_PASSWORD:1,INCORRECT_PASSWORD:2}
let n=s.WARNINGS
function i(e){n>=s.WARNINGS&&console.log("Warning: "+e)}function a(e){throw new Error(e)}function o(e,t){e||a(t)}function l(e,t,r){return Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!1}),r}const c=function(){function e(t){this.constructor===e&&a("Cannot initialize BaseException."),this.message=t,this.name=this.constructor.name}return e.prototype=new Error,e.constructor=e,e}()
t.BaseException=c
t.PasswordException=class extends c{constructor(e,t){super(e),this.code=t}}
t.UnknownErrorException=class extends c{constructor(e,t){super(e),this.details=t}}
t.InvalidPDFException=class extends c{}
t.MissingPDFException=class extends c{}
t.UnexpectedResponseException=class extends c{constructor(e,t){super(e),this.status=t}}
t.FormatError=class extends c{}
t.AbortException=class extends c{}
const h=/\x00/g
function d(e){o("string"==typeof e,"Invalid argument for stringToBytes")
const t=e.length,r=new Uint8Array(t)
for(let s=0;s<t;++s)r[s]=255&e.charCodeAt(s)
return r}function u(e){return void 0!==e.length?e.length:(o(void 0!==e.byteLength,"arrayByteLength - invalid argument."),e.byteLength)}const p={get value(){return l(this,"value",function(){const e=new Uint8Array(4)
return e[0]=1,1===new Uint32Array(e.buffer,0,1)[0]}())}}
t.IsLittleEndianCached=p
const g={get value(){return l(this,"value",function(){try{return new Function(""),!0}catch(e){return!1}}())}}
t.IsEvalSupportedCached=g
const f=["rgb(",0,",",0,",",0,")"]
class m{static makeCssRgb(e,t,r){return f[1]=e,f[3]=t,f[5]=r,f.join("")}static transform(e,t){return[e[0]*t[0]+e[2]*t[1],e[1]*t[0]+e[3]*t[1],e[0]*t[2]+e[2]*t[3],e[1]*t[2]+e[3]*t[3],e[0]*t[4]+e[2]*t[5]+e[4],e[1]*t[4]+e[3]*t[5]+e[5]]}static applyTransform(e,t){return[e[0]*t[0]+e[1]*t[2]+t[4],e[0]*t[1]+e[1]*t[3]+t[5]]}static applyInverseTransform(e,t){const r=t[0]*t[3]-t[1]*t[2]
return[(e[0]*t[3]-e[1]*t[2]+t[2]*t[5]-t[4]*t[3])/r,(-e[0]*t[1]+e[1]*t[0]+t[4]*t[1]-t[5]*t[0])/r]}static getAxialAlignedBoundingBox(e,t){const r=m.applyTransform(e,t),s=m.applyTransform(e.slice(2,4),t),n=m.applyTransform([e[0],e[3]],t),i=m.applyTransform([e[2],e[1]],t)
return[Math.min(r[0],s[0],n[0],i[0]),Math.min(r[1],s[1],n[1],i[1]),Math.max(r[0],s[0],n[0],i[0]),Math.max(r[1],s[1],n[1],i[1])]}static inverseTransform(e){const t=e[0]*e[3]-e[1]*e[2]
return[e[3]/t,-e[1]/t,-e[2]/t,e[0]/t,(e[2]*e[5]-e[4]*e[3])/t,(e[4]*e[1]-e[5]*e[0])/t]}static apply3dTransform(e,t){return[e[0]*t[0]+e[1]*t[1]+e[2]*t[2],e[3]*t[0]+e[4]*t[1]+e[5]*t[2],e[6]*t[0]+e[7]*t[1]+e[8]*t[2]]}static singularValueDecompose2dScale(e){const t=[e[0],e[2],e[1],e[3]],r=e[0]*t[0]+e[1]*t[2],s=e[0]*t[1]+e[1]*t[3],n=e[2]*t[0]+e[3]*t[2],i=e[2]*t[1]+e[3]*t[3],a=(r+i)/2,o=Math.sqrt((r+i)*(r+i)-4*(r*i-n*s))/2,l=a+o||1,c=a-o||1
return[Math.sqrt(l),Math.sqrt(c)]}static normalizeRect(e){const t=e.slice(0)
return e[0]>e[2]&&(t[0]=e[2],t[2]=e[0]),e[1]>e[3]&&(t[1]=e[3],t[3]=e[1]),t}static intersect(e,t){function r(e,t){return e-t}const s=[e[0],e[2],t[0],t[2]].sort(r),n=[e[1],e[3],t[1],t[3]].sort(r),i=[]
return e=m.normalizeRect(e),t=m.normalizeRect(t),s[0]===e[0]&&s[1]===t[0]||s[0]===t[0]&&s[1]===e[0]?(i[0]=s[1],i[2]=s[2],n[0]===e[1]&&n[1]===t[1]||n[0]===t[1]&&n[1]===e[1]?(i[1]=n[1],i[3]=n[2],i):null):null}}t.Util=m
const A=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,728,711,710,729,733,731,730,732,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8226,8224,8225,8230,8212,8211,402,8260,8249,8250,8722,8240,8222,8220,8221,8216,8217,8218,8482,64257,64258,321,338,352,376,381,305,322,339,353,382,0,8364]
const b=function(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
return function(t,r,s=!1){if(!s&&URL.createObjectURL){const e=new Blob([t],{type:r})
return URL.createObjectURL(e)}let n=`data:${r};base64,`
for(let i=0,a=t.length;i<a;i+=3){const r=255&t[i],s=255&t[i+1],o=255&t[i+2]
n+=e[r>>2]+e[(3&r)<<4|s>>4]+e[i+1<a?(15&s)<<2|o>>6:64]+e[i+2<a?63&o:64]}return n}}()
t.createObjectURL=b},function(e,t,r){"use strict"
r(4)},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.isNodeJS=void 0
const s="object"==typeof process&&process+""=="[object process]"&&!process.versions.nw&&!process.versions.electron
t.isNodeJS=s},function(module,exports,__w_pdfjs_require__){"use strict"
Object.defineProperty(exports,"__esModule",{value:!0}),exports.getDocument=getDocument,exports.setPDFNetworkStreamFactory=setPDFNetworkStreamFactory,exports.build=exports.version=exports.PDFPageProxy=exports.PDFDocumentProxy=exports.PDFWorker=exports.PDFDataRangeTransport=exports.LoopbackPort=void 0
var _util=__w_pdfjs_require__(2),_display_utils=__w_pdfjs_require__(1),_font_loader=__w_pdfjs_require__(6),_api_compatibility=__w_pdfjs_require__(7),_canvas=__w_pdfjs_require__(8),_worker_options=__w_pdfjs_require__(10),_is_node=__w_pdfjs_require__(4),_message_handler=__w_pdfjs_require__(11),_metadata=__w_pdfjs_require__(12),_transport_stream=__w_pdfjs_require__(14),_webgl=__w_pdfjs_require__(15)
const DEFAULT_RANGE_CHUNK_SIZE=65536,RENDERING_CANCELLED_TIMEOUT=100
let createPDFNetworkStream
function setPDFNetworkStreamFactory(e){createPDFNetworkStream=e}function getDocument(e){const t=new PDFDocumentLoadingTask
let r
if("string"==typeof e)r={url:e}
else if((0,_util.isArrayBuffer)(e))r={data:e}
else if(e instanceof PDFDataRangeTransport)r={range:e}
else{if("object"!=typeof e)throw new Error("Invalid parameter in getDocument, need either Uint8Array, string or a parameter object")
if(!e.url&&!e.data&&!e.range)throw new Error("Invalid parameter object: need either .data, .range or .url")
r=e}const s=Object.create(null)
let n=null,i=null
for(const o in r)if("url"!==o||"undefined"==typeof window)if("range"!==o)if("worker"!==o)if("data"!==o||r[o]instanceof Uint8Array)s[o]=r[o]
else{const e=r[o]
if("string"==typeof e)s[o]=(0,_util.stringToBytes)(e)
else if("object"!=typeof e||null===e||isNaN(e.length)){if(!(0,_util.isArrayBuffer)(e))throw new Error("Invalid PDF binary data: either typed array, string or array-like object is expected in the data property.")
s[o]=new Uint8Array(e)}else s[o]=new Uint8Array(e)}else i=r[o]
else n=r[o]
else s[o]=new URL(r[o],window.location).href
if(s.rangeChunkSize=s.rangeChunkSize||DEFAULT_RANGE_CHUNK_SIZE,s.CMapReaderFactory=s.CMapReaderFactory||_display_utils.DOMCMapReaderFactory,s.ignoreErrors=!0!==s.stopAtErrors,s.fontExtraProperties=!0===s.fontExtraProperties,s.pdfBug=!0===s.pdfBug,Number.isInteger(s.maxImageSize)||(s.maxImageSize=-1),"boolean"!=typeof s.isEvalSupported&&(s.isEvalSupported=!0),"boolean"!=typeof s.disableFontFace&&(s.disableFontFace=_api_compatibility.apiCompatibilityParams.disableFontFace||!1),"boolean"!=typeof s.disableRange&&(s.disableRange=!1),"boolean"!=typeof s.disableStream&&(s.disableStream=!1),"boolean"!=typeof s.disableAutoFetch&&(s.disableAutoFetch=!1),(0,_util.setVerbosityLevel)(s.verbosity),!i){const e={verbosity:s.verbosity,port:_worker_options.GlobalWorkerOptions.workerPort}
i=e.port?PDFWorker.fromPort(e):new PDFWorker(e),t._worker=i}const a=t.docId
return i.promise.then((function(){if(t.destroyed)throw new Error("Loading aborted")
const e=_fetchDocument(i,s,n,a),r=new Promise((function(e){let t
n?t=new _transport_stream.PDFDataTransportStream({length:s.length,initialData:s.initialData,progressiveDone:s.progressiveDone,disableRange:s.disableRange,disableStream:s.disableStream},n):s.data||(t=createPDFNetworkStream({url:s.url,length:s.length,httpHeaders:s.httpHeaders,withCredentials:s.withCredentials,rangeChunkSize:s.rangeChunkSize,disableRange:s.disableRange,disableStream:s.disableStream})),e(t)}))
return Promise.all([e,r]).then((function([e,r]){if(t.destroyed)throw new Error("Loading aborted")
const n=new _message_handler.MessageHandler(a,e,i.port)
n.postMessageTransfers=i.postMessageTransfers
const o=new WorkerTransport(n,t,r,s)
t._transport=o,n.send("Ready",null)}))})).catch(t._capability.reject),t}function _fetchDocument(e,t,r,s){return e.destroyed?Promise.reject(new Error("Worker was destroyed")):(r&&(t.length=r.length,t.initialData=r.initialData,t.progressiveDone=r.progressiveDone),e.messageHandler.sendWithPromise("GetDocRequest",{docId:s,apiVersion:"2.5.207",source:{data:t.data,url:t.url,password:t.password,disableAutoFetch:t.disableAutoFetch,rangeChunkSize:t.rangeChunkSize,length:t.length},maxImageSize:t.maxImageSize,disableFontFace:t.disableFontFace,postMessageTransfers:e.postMessageTransfers,docBaseUrl:t.docBaseUrl,ignoreErrors:t.ignoreErrors,isEvalSupported:t.isEvalSupported,fontExtraProperties:t.fontExtraProperties}).then((function(t){if(e.destroyed)throw new Error("Worker was destroyed")
return t})))}const PDFDocumentLoadingTask=function(){let e=0
return class{constructor(){this._capability=(0,_util.createPromiseCapability)(),this._transport=null,this._worker=null,this.docId="d"+e++,this.destroyed=!1,this.onPassword=null,this.onProgress=null,this.onUnsupportedFeature=null}get promise(){return this._capability.promise}destroy(){this.destroyed=!0
return(this._transport?this._transport.destroy():Promise.resolve()).then((()=>{this._transport=null,this._worker&&(this._worker.destroy(),this._worker=null)}))}}}()
class PDFDataRangeTransport{constructor(e,t,r=!1){this.length=e,this.initialData=t,this.progressiveDone=r,this._rangeListeners=[],this._progressListeners=[],this._progressiveReadListeners=[],this._progressiveDoneListeners=[],this._readyCapability=(0,_util.createPromiseCapability)()}addRangeListener(e){this._rangeListeners.push(e)}addProgressListener(e){this._progressListeners.push(e)}addProgressiveReadListener(e){this._progressiveReadListeners.push(e)}addProgressiveDoneListener(e){this._progressiveDoneListeners.push(e)}onDataRange(e,t){for(const r of this._rangeListeners)r(e,t)}onDataProgress(e,t){this._readyCapability.promise.then((()=>{for(const r of this._progressListeners)r(e,t)}))}onDataProgressiveRead(e){this._readyCapability.promise.then((()=>{for(const t of this._progressiveReadListeners)t(e)}))}onDataProgressiveDone(){this._readyCapability.promise.then((()=>{for(const e of this._progressiveDoneListeners)e()}))}transportReady(){this._readyCapability.resolve()}requestDataRange(e,t){(0,_util.unreachable)("Abstract method PDFDataRangeTransport.requestDataRange")}abort(){}}exports.PDFDataRangeTransport=PDFDataRangeTransport
class PDFDocumentProxy{constructor(e,t){this._pdfInfo=e,this._transport=t}get numPages(){return this._pdfInfo.numPages}get fingerprint(){return this._pdfInfo.fingerprint}getPage(e){return this._transport.getPage(e)}getPageIndex(e){return this._transport.getPageIndex(e)}getDestinations(){return this._transport.getDestinations()}getDestination(e){return this._transport.getDestination(e)}getPageLabels(){return this._transport.getPageLabels()}getPageLayout(){return this._transport.getPageLayout()}getPageMode(){return this._transport.getPageMode()}getViewerPreferences(){return this._transport.getViewerPreferences()}getOpenAction(){return this._transport.getOpenAction()}getOpenActionDestination(){return(0,_display_utils.deprecated)("getOpenActionDestination, use getOpenAction instead."),this.getOpenAction().then((function(e){return e&&e.dest?e.dest:null}))}getAttachments(){return this._transport.getAttachments()}getJavaScript(){return this._transport.getJavaScript()}getOutline(){return this._transport.getOutline()}getPermissions(){return this._transport.getPermissions()}getMetadata(){return this._transport.getMetadata()}getData(){return this._transport.getData()}getDownloadInfo(){return this._transport.downloadInfoCapability.promise}getStats(){return this._transport.getStats()}cleanup(){return this._transport.startCleanup()}destroy(){return this.loadingTask.destroy()}get loadingParams(){return this._transport.loadingParams}get loadingTask(){return this._transport.loadingTask}}exports.PDFDocumentProxy=PDFDocumentProxy
class PDFPageProxy{constructor(e,t,r,s=!1){this._pageIndex=e,this._pageInfo=t,this._transport=r,this._stats=s?new _display_utils.StatTimer:null,this._pdfBug=s,this.commonObjs=r.commonObjs,this.objs=new PDFObjects,this.cleanupAfterRender=!1,this.pendingCleanup=!1,this.intentStates=Object.create(null),this.destroyed=!1}get pageNumber(){return this._pageIndex+1}get rotate(){return this._pageInfo.rotate}get ref(){return this._pageInfo.ref}get userUnit(){return this._pageInfo.userUnit}get view(){return this._pageInfo.view}getViewport({scale:e,rotation:t=this.rotate,offsetX:r=0,offsetY:s=0,dontFlip:n=!1}={}){return new _display_utils.PageViewport({viewBox:this.view,scale:e,rotation:t,offsetX:r,offsetY:s,dontFlip:n})}getAnnotations({intent:e=null}={}){return this.annotationsPromise&&this.annotationsIntent===e||(this.annotationsPromise=this._transport.getAnnotations(this._pageIndex,e),this.annotationsIntent=e),this.annotationsPromise}render({canvasContext:e,viewport:t,intent:r="display",enableWebGL:s=!1,renderInteractiveForms:n=!1,transform:i=null,imageLayer:a=null,canvasFactory:o=null,background:l=null}){this._stats&&this._stats.time("Overall")
const c="print"===r?"print":"display"
this.pendingCleanup=!1,this.intentStates[c]||(this.intentStates[c]=Object.create(null))
const h=this.intentStates[c]
h.streamReaderCancelTimeout&&(clearTimeout(h.streamReaderCancelTimeout),h.streamReaderCancelTimeout=null)
const d=o||new _display_utils.DOMCanvasFactory,u=new _webgl.WebGLContext({enable:s})
h.displayReadyCapability||(h.displayReadyCapability=(0,_util.createPromiseCapability)(),h.operatorList={fnArray:[],argsArray:[],lastChunk:!1},this._stats&&this._stats.time("Page Request"),this._pumpOperatorList({pageIndex:this._pageIndex,intent:c,renderInteractiveForms:!0===n}))
const p=e=>{const t=h.renderTasks.indexOf(g)
t>=0&&h.renderTasks.splice(t,1),(this.cleanupAfterRender||"print"===c)&&(this.pendingCleanup=!0),this._tryCleanup(),e?(g.capability.reject(e),this._abortOperatorList({intentState:h,reason:e})):g.capability.resolve(),this._stats&&(this._stats.timeEnd("Rendering"),this._stats.timeEnd("Overall"))},g=new InternalRenderTask({callback:p,params:{canvasContext:e,viewport:t,transform:i,imageLayer:a,background:l},objs:this.objs,commonObjs:this.commonObjs,operatorList:h.operatorList,pageIndex:this._pageIndex,canvasFactory:d,webGLContext:u,useRequestAnimationFrame:"print"!==c,pdfBug:this._pdfBug})
h.renderTasks||(h.renderTasks=[]),h.renderTasks.push(g)
const f=g.task
return h.displayReadyCapability.promise.then((e=>{this.pendingCleanup?p():(this._stats&&this._stats.time("Rendering"),g.initializeGraphics(e),g.operatorListChanged())})).catch(p),f}getOperatorList(){const e="oplist"
this.intentStates.oplist||(this.intentStates.oplist=Object.create(null))
const t=this.intentStates.oplist
let r
return t.opListReadCapability||(r={},r.operatorListChanged=function(){if(t.operatorList.lastChunk){t.opListReadCapability.resolve(t.operatorList)
const e=t.renderTasks.indexOf(r)
e>=0&&t.renderTasks.splice(e,1)}},t.opListReadCapability=(0,_util.createPromiseCapability)(),t.renderTasks=[],t.renderTasks.push(r),t.operatorList={fnArray:[],argsArray:[],lastChunk:!1},this._stats&&this._stats.time("Page Request"),this._pumpOperatorList({pageIndex:this._pageIndex,intent:e})),t.opListReadCapability.promise}streamTextContent({normalizeWhitespace:e=!1,disableCombineTextItems:t=!1}={}){return this._transport.messageHandler.sendWithStream("GetTextContent",{pageIndex:this._pageIndex,normalizeWhitespace:!0===e,combineTextItems:!0!==t},{highWaterMark:100,size:e=>e.items.length})}getTextContent(e={}){const t=this.streamTextContent(e)
return new Promise((function(e,r){const s=t.getReader(),n={items:[],styles:Object.create(null)};(function t(){s.read().then((function({value:r,done:s}){s?e(n):(Object.assign(n.styles,r.styles),n.items.push(...r.items),t())}),r)})()}))}_destroy(){this.destroyed=!0,this._transport.pageCache[this._pageIndex]=null
const e=[]
return Object.keys(this.intentStates).forEach((t=>{const r=this.intentStates[t]
this._abortOperatorList({intentState:r,reason:new Error("Page was destroyed."),force:!0}),"oplist"!==t&&r.renderTasks.forEach((function(t){const r=t.capability.promise.catch((function(){}))
e.push(r),t.cancel()}))})),this.objs.clear(),this.annotationsPromise=null,this.pendingCleanup=!1,Promise.all(e)}cleanup(e=!1){return this.pendingCleanup=!0,this._tryCleanup(e)}_tryCleanup(e=!1){return!(!this.pendingCleanup||Object.keys(this.intentStates).some((e=>{const t=this.intentStates[e]
return 0!==t.renderTasks.length||!t.operatorList.lastChunk})))&&(Object.keys(this.intentStates).forEach((e=>{delete this.intentStates[e]})),this.objs.clear(),this.annotationsPromise=null,e&&this._stats&&(this._stats=new _display_utils.StatTimer),this.pendingCleanup=!1,!0)}_startRenderPage(e,t){const r=this.intentStates[t]
r&&(this._stats&&this._stats.timeEnd("Page Request"),r.displayReadyCapability&&r.displayReadyCapability.resolve(e))}_renderPageChunk(e,t){for(let r=0,s=e.length;r<s;r++)t.operatorList.fnArray.push(e.fnArray[r]),t.operatorList.argsArray.push(e.argsArray[r])
t.operatorList.lastChunk=e.lastChunk
for(let r=0;r<t.renderTasks.length;r++)t.renderTasks[r].operatorListChanged()
e.lastChunk&&this._tryCleanup()}_pumpOperatorList(e){(0,_util.assert)(e.intent,'PDFPageProxy._pumpOperatorList: Expected "intent" argument.')
const t=this._transport.messageHandler.sendWithStream("GetOperatorList",e).getReader(),r=this.intentStates[e.intent]
r.streamReader=t
const s=()=>{t.read().then((({value:e,done:t})=>{t?r.streamReader=null:this._transport.destroyed||(this._renderPageChunk(e,r),s())}),(e=>{if(r.streamReader=null,!this._transport.destroyed){if(r.operatorList){r.operatorList.lastChunk=!0
for(let e=0;e<r.renderTasks.length;e++)r.renderTasks[e].operatorListChanged()
this._tryCleanup()}if(r.displayReadyCapability)r.displayReadyCapability.reject(e)
else{if(!r.opListReadCapability)throw e
r.opListReadCapability.reject(e)}}}))}
s()}_abortOperatorList({intentState:e,reason:t,force:r=!1}){if((0,_util.assert)(t instanceof Error||"object"==typeof t&&null!==t,'PDFPageProxy._abortOperatorList: Expected "reason" argument.'),e.streamReader){if(!r){if(0!==e.renderTasks.length)return
if(t instanceof _display_utils.RenderingCancelledException)return void(e.streamReaderCancelTimeout=setTimeout((()=>{this._abortOperatorList({intentState:e,reason:t,force:!0}),e.streamReaderCancelTimeout=null}),RENDERING_CANCELLED_TIMEOUT))}e.streamReader.cancel(new _util.AbortException(t&&t.message)),e.streamReader=null,this._transport.destroyed||(Object.keys(this.intentStates).some((t=>this.intentStates[t]===e&&(delete this.intentStates[t],!0))),this.cleanup())}}get stats(){return this._stats}}exports.PDFPageProxy=PDFPageProxy
class LoopbackPort{constructor(e=!0){this._listeners=[],this._defer=e,this._deferred=Promise.resolve(void 0)}postMessage(e,t){if(!this._defer)return void this._listeners.forEach((t=>{t.call(this,{data:e})}))
const r=new WeakMap,s={data:function e(s){if("object"!=typeof s||null===s)return s
if(r.has(s))return r.get(s)
let n,i
if((n=s.buffer)&&(0,_util.isArrayBuffer)(n)){return i=t&&t.includes(n)?new s.constructor(n,s.byteOffset,s.byteLength):new s.constructor(s),r.set(s,i),i}i=Array.isArray(s)?[]:{},r.set(s,i)
for(const t in s){let r,n=s
for(;!(r=Object.getOwnPropertyDescriptor(n,t));)n=Object.getPrototypeOf(n)
if(void 0!==r.value)if("function"!=typeof r.value)i[t]=e(r.value)
else if(s.hasOwnProperty&&s.hasOwnProperty(t))throw new Error("LoopbackPort.postMessage - cannot clone: "+s[t])}return i}(e)}
this._deferred.then((()=>{this._listeners.forEach((e=>{e.call(this,s)}))}))}addEventListener(e,t){this._listeners.push(t)}removeEventListener(e,t){const r=this._listeners.indexOf(t)
this._listeners.splice(r,1)}terminate(){this._listeners.length=0}}exports.LoopbackPort=LoopbackPort
const PDFWorker=function PDFWorkerClosure(){const pdfWorkerPorts=new WeakMap
let isWorkerDisabled=!1,fallbackWorkerSrc,nextFakeWorkerId=0,fakeWorkerCapability
if(_is_node.isNodeJS&&"function"==typeof require)isWorkerDisabled=!0,fallbackWorkerSrc="./pdf.worker.js"
else if("object"==typeof document&&"currentScript"in document){const e=document.currentScript&&document.currentScript.src
e&&(fallbackWorkerSrc=e.replace(/(\.(?:min\.)?js)(\?.*)?$/i,".worker$1$2"))}function getWorkerSrc(){if(_worker_options.GlobalWorkerOptions.workerSrc)return _worker_options.GlobalWorkerOptions.workerSrc
if(void 0!==fallbackWorkerSrc)return _is_node.isNodeJS||(0,_display_utils.deprecated)('No "GlobalWorkerOptions.workerSrc" specified.'),fallbackWorkerSrc
throw new Error('No "GlobalWorkerOptions.workerSrc" specified.')}function getMainThreadWorkerMessageHandler(){let e
try{e=globalThis.pdfjsWorker&&globalThis.pdfjsWorker.WorkerMessageHandler}catch(t){}return e||null}function setupFakeWorkerGlobal(){if(fakeWorkerCapability)return fakeWorkerCapability.promise
fakeWorkerCapability=(0,_util.createPromiseCapability)()
const loader=async function(){const mainWorkerMessageHandler=getMainThreadWorkerMessageHandler()
if(mainWorkerMessageHandler)return mainWorkerMessageHandler
if(_is_node.isNodeJS&&"function"==typeof require){const worker=eval("require")(getWorkerSrc())
return worker.WorkerMessageHandler}return await(0,_display_utils.loadScript)(getWorkerSrc()),window.pdfjsWorker.WorkerMessageHandler}
return loader().then(fakeWorkerCapability.resolve,fakeWorkerCapability.reject),fakeWorkerCapability.promise}function createCDNWrapper(e){const t="importScripts('"+e+"');"
return URL.createObjectURL(new Blob([t]))}class PDFWorker{constructor({name:e=null,port:t=null,verbosity:r=(0,_util.getVerbosityLevel)()}={}){if(t&&pdfWorkerPorts.has(t))throw new Error("Cannot use more than one PDFWorker per port")
if(this.name=e,this.destroyed=!1,this.postMessageTransfers=!0,this.verbosity=r,this._readyCapability=(0,_util.createPromiseCapability)(),this._port=null,this._webWorker=null,this._messageHandler=null,t)return pdfWorkerPorts.set(t,this),void this._initializeFromPort(t)
this._initialize()}get promise(){return this._readyCapability.promise}get port(){return this._port}get messageHandler(){return this._messageHandler}_initializeFromPort(e){this._port=e,this._messageHandler=new _message_handler.MessageHandler("main","worker",e),this._messageHandler.on("ready",(function(){})),this._readyCapability.resolve()}_initialize(){if("undefined"!=typeof Worker&&!isWorkerDisabled&&!getMainThreadWorkerMessageHandler()){let t=getWorkerSrc()
try{(0,_util.isSameOrigin)(window.location.href,t)||(t=createCDNWrapper(new URL(t,window.location).href))
const e=new Worker(t),r=new _message_handler.MessageHandler("main","worker",e),s=()=>{e.removeEventListener("error",n),r.destroy(),e.terminate(),this.destroyed?this._readyCapability.reject(new Error("Worker was destroyed")):this._setupFakeWorker()},n=()=>{this._webWorker||s()}
e.addEventListener("error",n),r.on("test",(t=>{e.removeEventListener("error",n),this.destroyed?s():t?(this._messageHandler=r,this._port=e,this._webWorker=e,t.supportTransfers||(this.postMessageTransfers=!1),this._readyCapability.resolve(),r.send("configure",{verbosity:this.verbosity})):(this._setupFakeWorker(),r.destroy(),e.terminate())})),r.on("ready",(t=>{if(e.removeEventListener("error",n),this.destroyed)s()
else try{i()}catch(r){this._setupFakeWorker()}}))
const i=()=>{const e=new Uint8Array([this.postMessageTransfers?255:0])
try{r.send("test",e,[e.buffer])}catch(t){(0,_util.warn)("Cannot use postMessage transfers."),e[0]=0,r.send("test",e)}}
return void i()}catch(e){(0,_util.info)("The worker has been disabled.")}}this._setupFakeWorker()}_setupFakeWorker(){isWorkerDisabled||((0,_util.warn)("Setting up fake worker."),isWorkerDisabled=!0),setupFakeWorkerGlobal().then((e=>{if(this.destroyed)return void this._readyCapability.reject(new Error("Worker was destroyed"))
const t=new LoopbackPort
this._port=t
const r="fake"+nextFakeWorkerId++,s=new _message_handler.MessageHandler(r+"_worker",r,t)
e.setup(s,t)
const n=new _message_handler.MessageHandler(r,r+"_worker",t)
this._messageHandler=n,this._readyCapability.resolve(),n.send("configure",{verbosity:this.verbosity})})).catch((e=>{this._readyCapability.reject(new Error(`Setting up fake worker failed: "${e.message}".`))}))}destroy(){this.destroyed=!0,this._webWorker&&(this._webWorker.terminate(),this._webWorker=null),pdfWorkerPorts.delete(this._port),this._port=null,this._messageHandler&&(this._messageHandler.destroy(),this._messageHandler=null)}static fromPort(e){if(!e||!e.port)throw new Error("PDFWorker.fromPort - invalid method signature.")
return pdfWorkerPorts.has(e.port)?pdfWorkerPorts.get(e.port):new PDFWorker(e)}static getWorkerSrc(){return getWorkerSrc()}}return PDFWorker}()
exports.PDFWorker=PDFWorker
class WorkerTransport{constructor(e,t,r,s){this.messageHandler=e,this.loadingTask=t,this.commonObjs=new PDFObjects,this.fontLoader=new _font_loader.FontLoader({docId:t.docId,onUnsupportedFeature:this._onUnsupportedFeature.bind(this)}),this._params=s,this.CMapReaderFactory=new s.CMapReaderFactory({baseUrl:s.cMapUrl,isCompressed:s.cMapPacked}),this.destroyed=!1,this.destroyCapability=null,this._passwordCapability=null,this._networkStream=r,this._fullReader=null,this._lastProgress=null,this.pageCache=[],this.pagePromises=[],this.downloadInfoCapability=(0,_util.createPromiseCapability)(),this.setupMessageHandler()}destroy(){if(this.destroyCapability)return this.destroyCapability.promise
this.destroyed=!0,this.destroyCapability=(0,_util.createPromiseCapability)(),this._passwordCapability&&this._passwordCapability.reject(new Error("Worker was destroyed during onPassword callback"))
const e=[]
this.pageCache.forEach((function(t){t&&e.push(t._destroy())})),this.pageCache.length=0,this.pagePromises.length=0
const t=this.messageHandler.sendWithPromise("Terminate",null)
return e.push(t),Promise.all(e).then((()=>{this.fontLoader.clear(),this._networkStream&&this._networkStream.cancelAllRequests(new _util.AbortException("Worker was terminated.")),this.messageHandler&&(this.messageHandler.destroy(),this.messageHandler=null),this.destroyCapability.resolve()}),this.destroyCapability.reject),this.destroyCapability.promise}setupMessageHandler(){const{messageHandler:e,loadingTask:t}=this
e.on("GetReader",((e,t)=>{(0,_util.assert)(this._networkStream,"GetReader - no `IPDFStream` instance available."),this._fullReader=this._networkStream.getFullReader(),this._fullReader.onProgress=e=>{this._lastProgress={loaded:e.loaded,total:e.total}},t.onPull=()=>{this._fullReader.read().then((function({value:e,done:r}){r?t.close():((0,_util.assert)((0,_util.isArrayBuffer)(e),"GetReader - expected an ArrayBuffer."),t.enqueue(new Uint8Array(e),1,[e]))})).catch((e=>{t.error(e)}))},t.onCancel=e=>{this._fullReader.cancel(e)}})),e.on("ReaderHeadersReady",(e=>{const r=(0,_util.createPromiseCapability)(),s=this._fullReader
return s.headersReady.then((()=>{s.isStreamingSupported&&s.isRangeSupported||(this._lastProgress&&t.onProgress&&t.onProgress(this._lastProgress),s.onProgress=e=>{t.onProgress&&t.onProgress({loaded:e.loaded,total:e.total})}),r.resolve({isStreamingSupported:s.isStreamingSupported,isRangeSupported:s.isRangeSupported,contentLength:s.contentLength})}),r.reject),r.promise})),e.on("GetRangeReader",((e,t)=>{(0,_util.assert)(this._networkStream,"GetRangeReader - no `IPDFStream` instance available.")
const r=this._networkStream.getRangeReader(e.begin,e.end)
r?(t.onPull=()=>{r.read().then((function({value:e,done:r}){r?t.close():((0,_util.assert)((0,_util.isArrayBuffer)(e),"GetRangeReader - expected an ArrayBuffer."),t.enqueue(new Uint8Array(e),1,[e]))})).catch((e=>{t.error(e)}))},t.onCancel=e=>{r.cancel(e)}):t.close()})),e.on("GetDoc",(({pdfInfo:e})=>{this._numPages=e.numPages,t._capability.resolve(new PDFDocumentProxy(e,this))})),e.on("DocException",(function(e){let r
switch(e.name){case"PasswordException":r=new _util.PasswordException(e.message,e.code)
break
case"InvalidPDFException":r=new _util.InvalidPDFException(e.message)
break
case"MissingPDFException":r=new _util.MissingPDFException(e.message)
break
case"UnexpectedResponseException":r=new _util.UnexpectedResponseException(e.message,e.status)
break
case"UnknownErrorException":r=new _util.UnknownErrorException(e.message,e.details)}t._capability.reject(r)})),e.on("PasswordRequest",(e=>{if(this._passwordCapability=(0,_util.createPromiseCapability)(),t.onPassword){const s=e=>{this._passwordCapability.resolve({password:e})}
try{t.onPassword(s,e.code)}catch(r){this._passwordCapability.reject(r)}}else this._passwordCapability.reject(new _util.PasswordException(e.message,e.code))
return this._passwordCapability.promise})),e.on("DataLoaded",(e=>{t.onProgress&&t.onProgress({loaded:e.length,total:e.length}),this.downloadInfoCapability.resolve(e)})),e.on("StartRenderPage",(e=>{if(this.destroyed)return
this.pageCache[e.pageIndex]._startRenderPage(e.transparency,e.intent)})),e.on("commonobj",(t=>{if(this.destroyed)return
const[r,s,n]=t
if(!this.commonObjs.has(r))switch(s){case"Font":const t=this._params
if("error"in n){const e=n.error;(0,_util.warn)("Error during font loading: "+e),this.commonObjs.resolve(r,e)
break}let i=null
t.pdfBug&&globalThis.FontInspector&&globalThis.FontInspector.enabled&&(i={registerFont(e,t){globalThis.FontInspector.fontAdded(e,t)}})
const a=new _font_loader.FontFaceObject(n,{isEvalSupported:t.isEvalSupported,disableFontFace:t.disableFontFace,ignoreErrors:t.ignoreErrors,onUnsupportedFeature:this._onUnsupportedFeature.bind(this),fontRegistry:i})
this.fontLoader.bind(a).catch((t=>e.sendWithPromise("FontFallback",{id:r}))).finally((()=>{!t.fontExtraProperties&&a.data&&(a.data=null),this.commonObjs.resolve(r,a)}))
break
case"FontPath":case"FontType3Res":case"Image":this.commonObjs.resolve(r,n)
break
default:throw new Error("Got unknown common object type "+s)}})),e.on("obj",(e=>{if(this.destroyed)return
const[t,r,s,n]=e,i=this.pageCache[r]
if(!i.objs.has(t))switch(s){case"Image":i.objs.resolve(t,n)
const e=8e6
n&&"data"in n&&n.data.length>e&&(i.cleanupAfterRender=!0)
break
default:throw new Error("Got unknown object type "+s)}})),e.on("DocProgress",(e=>{this.destroyed||t.onProgress&&t.onProgress({loaded:e.loaded,total:e.total})})),e.on("UnsupportedFeature",this._onUnsupportedFeature.bind(this)),e.on("FetchBuiltInCMap",((e,t)=>{if(this.destroyed)return void t.error(new Error("Worker was destroyed"))
let r=!1
t.onPull=()=>{r?t.close():(r=!0,this.CMapReaderFactory.fetch(e).then((function(e){t.enqueue(e,1,[e.cMapData.buffer])})).catch((function(e){t.error(e)})))}}))}_onUnsupportedFeature({featureId:e}){this.destroyed||this.loadingTask.onUnsupportedFeature&&this.loadingTask.onUnsupportedFeature(e)}getData(){return this.messageHandler.sendWithPromise("GetData",null)}getPage(e){if(!Number.isInteger(e)||e<=0||e>this._numPages)return Promise.reject(new Error("Invalid page request"))
const t=e-1
if(t in this.pagePromises)return this.pagePromises[t]
const r=this.messageHandler.sendWithPromise("GetPage",{pageIndex:t}).then((e=>{if(this.destroyed)throw new Error("Transport destroyed")
const r=new PDFPageProxy(t,e,this,this._params.pdfBug)
return this.pageCache[t]=r,r}))
return this.pagePromises[t]=r,r}getPageIndex(e){return this.messageHandler.sendWithPromise("GetPageIndex",{ref:e}).catch((function(e){return Promise.reject(new Error(e))}))}getAnnotations(e,t){return this.messageHandler.sendWithPromise("GetAnnotations",{pageIndex:e,intent:t})}getDestinations(){return this.messageHandler.sendWithPromise("GetDestinations",null)}getDestination(e){return"string"!=typeof e?Promise.reject(new Error("Invalid destination request.")):this.messageHandler.sendWithPromise("GetDestination",{id:e})}getPageLabels(){return this.messageHandler.sendWithPromise("GetPageLabels",null)}getPageLayout(){return this.messageHandler.sendWithPromise("GetPageLayout",null)}getPageMode(){return this.messageHandler.sendWithPromise("GetPageMode",null)}getViewerPreferences(){return this.messageHandler.sendWithPromise("GetViewerPreferences",null)}getOpenAction(){return this.messageHandler.sendWithPromise("GetOpenAction",null)}getAttachments(){return this.messageHandler.sendWithPromise("GetAttachments",null)}getJavaScript(){return this.messageHandler.sendWithPromise("GetJavaScript",null)}getOutline(){return this.messageHandler.sendWithPromise("GetOutline",null)}getPermissions(){return this.messageHandler.sendWithPromise("GetPermissions",null)}getMetadata(){return this.messageHandler.sendWithPromise("GetMetadata",null).then((e=>({info:e[0],metadata:e[1]?new _metadata.Metadata(e[1]):null,contentDispositionFilename:this._fullReader?this._fullReader.filename:null})))}getStats(){return this.messageHandler.sendWithPromise("GetStats",null)}startCleanup(){return this.messageHandler.sendWithPromise("Cleanup",null).then((()=>{for(let e=0,t=this.pageCache.length;e<t;e++){const t=this.pageCache[e]
if(t){if(!t.cleanup())throw new Error(`startCleanup: Page ${e+1} is currently rendering.`)}}this.commonObjs.clear(),this.fontLoader.clear()}))}get loadingParams(){const e=this._params
return(0,_util.shadow)(this,"loadingParams",{disableAutoFetch:e.disableAutoFetch,disableFontFace:e.disableFontFace})}}class PDFObjects{constructor(){this._objs=Object.create(null)}_ensureObj(e){return this._objs[e]?this._objs[e]:this._objs[e]={capability:(0,_util.createPromiseCapability)(),data:null,resolved:!1}}get(e,t=null){if(t)return this._ensureObj(e).capability.promise.then(t),null
const r=this._objs[e]
if(!r||!r.resolved)throw new Error(`Requesting object that isn't resolved yet ${e}.`)
return r.data}has(e){const t=this._objs[e]
return!!t&&t.resolved}resolve(e,t){const r=this._ensureObj(e)
r.resolved=!0,r.data=t,r.capability.resolve(t)}clear(){this._objs=Object.create(null)}}class RenderTask{constructor(e){this._internalRenderTask=e,this.onContinue=null}get promise(){return this._internalRenderTask.capability.promise}cancel(){this._internalRenderTask.cancel()}}const InternalRenderTask=function(){const e=new WeakSet
return class{constructor({callback:e,params:t,objs:r,commonObjs:s,operatorList:n,pageIndex:i,canvasFactory:a,webGLContext:o,useRequestAnimationFrame:l=!1,pdfBug:c=!1}){this.callback=e,this.params=t,this.objs=r,this.commonObjs=s,this.operatorListIdx=null,this.operatorList=n,this._pageIndex=i,this.canvasFactory=a,this.webGLContext=o,this._pdfBug=c,this.running=!1,this.graphicsReadyCallback=null,this.graphicsReady=!1,this._useRequestAnimationFrame=!0===l&&"undefined"!=typeof window,this.cancelled=!1,this.capability=(0,_util.createPromiseCapability)(),this.task=new RenderTask(this),this._continueBound=this._continue.bind(this),this._scheduleNextBound=this._scheduleNext.bind(this),this._nextBound=this._next.bind(this),this._canvas=t.canvasContext.canvas}initializeGraphics(t=!1){if(this.cancelled)return
if(this._canvas){if(e.has(this._canvas))throw new Error("Cannot use the same canvas during multiple render() operations. Use different canvas or ensure previous operations were cancelled or completed.")
e.add(this._canvas)}this._pdfBug&&globalThis.StepperManager&&globalThis.StepperManager.enabled&&(this.stepper=globalThis.StepperManager.create(this._pageIndex),this.stepper.init(this.operatorList),this.stepper.nextBreakPoint=this.stepper.getNextBreakPoint())
const{canvasContext:r,viewport:s,transform:n,imageLayer:i,background:a}=this.params
this.gfx=new _canvas.CanvasGraphics(r,this.commonObjs,this.objs,this.canvasFactory,this.webGLContext,i),this.gfx.beginDrawing({transform:n,viewport:s,transparency:t,background:a}),this.operatorListIdx=0,this.graphicsReady=!0,this.graphicsReadyCallback&&this.graphicsReadyCallback()}cancel(t=null){this.running=!1,this.cancelled=!0,this.gfx&&this.gfx.endDrawing(),this._canvas&&e.delete(this._canvas),this.callback(t||new _display_utils.RenderingCancelledException("Rendering cancelled, page "+(this._pageIndex+1),"canvas"))}operatorListChanged(){this.graphicsReady?(this.stepper&&this.stepper.updateOperatorList(this.operatorList),this.running||this._continue()):this.graphicsReadyCallback||(this.graphicsReadyCallback=this._continueBound)}_continue(){this.running=!0,this.cancelled||(this.task.onContinue?this.task.onContinue(this._scheduleNextBound):this._scheduleNext())}_scheduleNext(){this._useRequestAnimationFrame?window.requestAnimationFrame((()=>{this._nextBound().catch(this.cancel.bind(this))})):Promise.resolve().then(this._nextBound).catch(this.cancel.bind(this))}async _next(){this.cancelled||(this.operatorListIdx=this.gfx.executeOperatorList(this.operatorList,this.operatorListIdx,this._continueBound,this.stepper),this.operatorListIdx===this.operatorList.argsArray.length&&(this.running=!1,this.operatorList.lastChunk&&(this.gfx.endDrawing(),this._canvas&&e.delete(this._canvas),this.callback())))}}}(),version="2.5.207"
exports.version=version
const build="0974d605"
exports.build=build},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.FontLoader=t.FontFaceObject=void 0
var s=r(2)
class n{constructor({docId:e,onUnsupportedFeature:t}){this.constructor===n&&(0,s.unreachable)("Cannot initialize BaseFontLoader."),this.docId=e,this._onUnsupportedFeature=t,this.nativeFontFaces=[],this.styleElement=null}addNativeFontFace(e){this.nativeFontFaces.push(e),document.fonts.add(e)}insertRule(e){let t=this.styleElement
t||(t=this.styleElement=document.createElement("style"),t.id="PDFJS_FONT_STYLE_TAG_"+this.docId,document.documentElement.getElementsByTagName("head")[0].appendChild(t))
const r=t.sheet
r.insertRule(e,r.cssRules.length)}clear(){this.nativeFontFaces.forEach((function(e){document.fonts.delete(e)})),this.nativeFontFaces.length=0,this.styleElement&&(this.styleElement.remove(),this.styleElement=null)}async bind(e){if(e.attached||e.missingFile)return
if(e.attached=!0,this.isFontLoadingAPISupported){const t=e.createNativeFontFace()
if(t){this.addNativeFontFace(t)
try{await t.loaded}catch(r){throw this._onUnsupportedFeature({featureId:s.UNSUPPORTED_FEATURES.errorFontLoadNative}),(0,s.warn)(`Failed to load font '${t.family}': '${r}'.`),e.disableFontFace=!0,r}}return}const t=e.createFontFaceRule()
if(t){if(this.insertRule(t),this.isSyncFontLoadingSupported)return
await new Promise((r=>{const s=this._queueLoadingCallback(r)
this._prepareFontLoadEvent([t],[e],s)}))}}_queueLoadingCallback(e){(0,s.unreachable)("Abstract method `_queueLoadingCallback`.")}get isFontLoadingAPISupported(){const e="undefined"!=typeof document&&!!document.fonts
return(0,s.shadow)(this,"isFontLoadingAPISupported",e)}get isSyncFontLoadingSupported(){(0,s.unreachable)("Abstract method `isSyncFontLoadingSupported`.")}get _loadTestFont(){(0,s.unreachable)("Abstract method `_loadTestFont`.")}_prepareFontLoadEvent(e,t,r){(0,s.unreachable)("Abstract method `_prepareFontLoadEvent`.")}}let i
t.FontLoader=i,t.FontLoader=i=class extends n{constructor(e){super(e),this.loadingContext={requests:[],nextRequestId:0},this.loadTestFontId=0}get isSyncFontLoadingSupported(){let e=!1
if("undefined"==typeof navigator)e=!0
else{const t=/Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(navigator.userAgent)
t&&t[1]>=14&&(e=!0)}return(0,s.shadow)(this,"isSyncFontLoadingSupported",e)}_queueLoadingCallback(e){const t=this.loadingContext,r={id:"pdfjs-font-loading-"+t.nextRequestId++,done:!1,complete:function(){for((0,s.assert)(!r.done,"completeRequest() cannot be called twice."),r.done=!0;t.requests.length>0&&t.requests[0].done;){const e=t.requests.shift()
setTimeout(e.callback,0)}},callback:e}
return t.requests.push(r),r}get _loadTestFont(){return(0,s.shadow)(this,"_loadTestFont",atob("T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQAABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwAAAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbmFtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAAAADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6AABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAAMQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAAAAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAAAAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQAAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMAAQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAAEAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgcA/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQAAAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAgABAAAAAAAAAAAD6AAAAAAAAA=="))}_prepareFontLoadEvent(e,t,r){function n(e,t){return e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|255&e.charCodeAt(t+3)}function i(e,t,r,s){return e.substring(0,t)+s+e.substring(t+r)}let a,o
const l=document.createElement("canvas")
l.width=1,l.height=1
const c=l.getContext("2d")
let h=0
const d=`lt${Date.now()}${this.loadTestFontId++}`
let u=this._loadTestFont
u=i(u,976,d.length,d)
const p=1482184792
let g=n(u,16)
for(a=0,o=d.length-3;a<o;a+=4)g=g-p+n(d,a)|0
a<d.length&&(g=g-p+n(d+"XXX",a)|0),u=i(u,16,4,(0,s.string32)(g))
const f=`@font-face {font-family:"${d}";src:${`url(data:font/opentype;base64,${btoa(u)});`}}`
this.insertRule(f)
const m=[]
for(a=0,o=t.length;a<o;a++)m.push(t[a].loadedName)
m.push(d)
const A=document.createElement("div")
for(A.style.visibility="hidden",A.style.width=A.style.height="10px",A.style.position="absolute",A.style.top=A.style.left="0px",a=0,o=m.length;a<o;++a){const e=document.createElement("span")
e.textContent="Hi",e.style.fontFamily=m[a],A.appendChild(e)}document.body.appendChild(A),function e(t,r){if(h++,h>30)return(0,s.warn)("Load test font never loaded."),void r()
c.font="30px "+t,c.fillText(".",0,20),c.getImageData(0,0,1,1).data[3]>0?r():setTimeout(e.bind(null,t,r))}(d,(function(){document.body.removeChild(A),r.complete()}))}}
t.FontFaceObject=class{constructor(e,{isEvalSupported:t=!0,disableFontFace:r=!1,ignoreErrors:s=!1,onUnsupportedFeature:n=null,fontRegistry:i=null}){this.compiledGlyphs=Object.create(null)
for(const a in e)this[a]=e[a]
this.isEvalSupported=!1!==t,this.disableFontFace=!0===r,this.ignoreErrors=!0===s,this._onUnsupportedFeature=n,this.fontRegistry=i}createNativeFontFace(){if(!this.data||this.disableFontFace)return null
const e=new FontFace(this.loadedName,this.data,{})
return this.fontRegistry&&this.fontRegistry.registerFont(this),e}createFontFaceRule(){if(!this.data||this.disableFontFace)return null
const e=(0,s.bytesToString)(new Uint8Array(this.data)),t=`url(data:${this.mimetype};base64,${btoa(e)});`,r=`@font-face {font-family:"${this.loadedName}";src:${t}}`
return this.fontRegistry&&this.fontRegistry.registerFont(this,t),r}getPathGenerator(e,t){if(void 0!==this.compiledGlyphs[t])return this.compiledGlyphs[t]
let r,n
try{r=e.get(this.loadedName+"_path_"+t)}catch(i){if(!this.ignoreErrors)throw i
return this._onUnsupportedFeature&&this._onUnsupportedFeature({featureId:s.UNSUPPORTED_FEATURES.errorFontGetPath}),(0,s.warn)(`getPathGenerator - ignoring character: "${i}".`),this.compiledGlyphs[t]=function(e,t){}}if(this.isEvalSupported&&s.IsEvalSupportedCached.value){let e,s=""
for(let t=0,i=r.length;t<i;t++)n=r[t],e=void 0!==n.args?n.args.join(","):"",s+="c."+n.cmd+"("+e+");\n"
return this.compiledGlyphs[t]=new Function("c","size",s)}return this.compiledGlyphs[t]=function(e,t){for(let s=0,i=r.length;s<i;s++)n=r[s],"scale"===n.cmd&&(n.args=[t,-t]),e[n.cmd].apply(e,n.args)}}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.apiCompatibilityParams=void 0
var s=r(4)
const n=Object.create(null)
s.isNodeJS&&(n.disableFontFace=!0)
const i=Object.freeze(n)
t.apiCompatibilityParams=i},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.CanvasGraphics=void 0
var s=r(2),n=r(9),i=4096,a=.65,o=16
function l(e){e.mozCurrentTransform||(e._originalSave=e.save,e._originalRestore=e.restore,e._originalRotate=e.rotate,e._originalScale=e.scale,e._originalTranslate=e.translate,e._originalTransform=e.transform,e._originalSetTransform=e.setTransform,e._transformMatrix=e._transformMatrix||[1,0,0,1,0,0],e._transformStack=[],Object.defineProperty(e,"mozCurrentTransform",{get:function(){return this._transformMatrix}}),Object.defineProperty(e,"mozCurrentTransformInverse",{get:function(){var e=this._transformMatrix,t=e[0],r=e[1],s=e[2],n=e[3],i=e[4],a=e[5],o=t*n-r*s,l=r*s-t*n
return[n/o,r/l,s/l,t/o,(n*i-s*a)/l,(r*i-t*a)/o]}}),e.save=function(){var e=this._transformMatrix
this._transformStack.push(e),this._transformMatrix=e.slice(0,6),this._originalSave()},e.restore=function(){var e=this._transformStack.pop()
e&&(this._transformMatrix=e,this._originalRestore())},e.translate=function(e,t){var r=this._transformMatrix
r[4]=r[0]*e+r[2]*t+r[4],r[5]=r[1]*e+r[3]*t+r[5],this._originalTranslate(e,t)},e.scale=function(e,t){var r=this._transformMatrix
r[0]=r[0]*e,r[1]=r[1]*e,r[2]=r[2]*t,r[3]=r[3]*t,this._originalScale(e,t)},e.transform=function(t,r,s,n,i,a){var o=this._transformMatrix
this._transformMatrix=[o[0]*t+o[2]*r,o[1]*t+o[3]*r,o[0]*s+o[2]*n,o[1]*s+o[3]*n,o[0]*i+o[2]*a+o[4],o[1]*i+o[3]*a+o[5]],e._originalTransform(t,r,s,n,i,a)},e.setTransform=function(t,r,s,n,i,a){this._transformMatrix=[t,r,s,n,i,a],e._originalSetTransform(t,r,s,n,i,a)},e.rotate=function(e){var t=Math.cos(e),r=Math.sin(e),s=this._transformMatrix
this._transformMatrix=[s[0]*t+s[2]*r,s[1]*t+s[3]*r,s[0]*-r+s[2]*t,s[1]*-r+s[3]*t,s[4],s[5]],this._originalRotate(e)})}var c=function(){function e(e){this.canvasFactory=e,this.cache=Object.create(null)}return e.prototype={getCanvas:function(e,t,r,s){var n
return void 0!==this.cache[e]?(n=this.cache[e],this.canvasFactory.reset(n,t,r),n.context.setTransform(1,0,0,1,0,0)):(n=this.canvasFactory.create(t,r),this.cache[e]=n),s&&l(n.context),n},clear(){for(var e in this.cache){var t=this.cache[e]
this.canvasFactory.destroy(t),delete this.cache[e]}}},e}()
var h=function(){function e(){this.alphaIsShape=!1,this.fontSize=0,this.fontSizeScale=1,this.textMatrix=s.IDENTITY_MATRIX,this.textMatrixScale=1,this.fontMatrix=s.FONT_IDENTITY_MATRIX,this.leading=0,this.x=0,this.y=0,this.lineX=0,this.lineY=0,this.charSpacing=0,this.wordSpacing=0,this.textHScale=1,this.textRenderingMode=s.TextRenderingMode.FILL,this.textRise=0,this.fillColor="#000000",this.strokeColor="#000000",this.patternFill=!1,this.fillAlpha=1,this.strokeAlpha=1,this.lineWidth=1,this.activeSMask=null,this.resumeSMaskCtx=null}return e.prototype={clone:function(){return Object.create(this)},setCurrentPoint:function(e,t){this.x=e,this.y=t}},e}(),d=function(){function e(e,t,r,s,n,i){this.ctx=e,this.current=new h,this.stateStack=[],this.pendingClip=null,this.pendingEOFill=!1,this.res=null,this.xobjs=null,this.commonObjs=t,this.objs=r,this.canvasFactory=s,this.webGLContext=n,this.imageLayer=i,this.groupStack=[],this.processingType3=null,this.baseTransform=null,this.baseTransformStack=[],this.groupLevel=0,this.smaskStack=[],this.smaskCounter=0,this.tempSMask=null,this.cachedCanvases=new c(this.canvasFactory),e&&l(e),this._cachedGetSinglePixelWidth=null}function t(e,t){if("undefined"!=typeof ImageData&&t instanceof ImageData)e.putImageData(t,0,0)
else{var r,n,i,a,l,c=t.height,h=t.width,d=c%o,u=(c-d)/o,p=0===d?u:u+1,g=e.createImageData(h,o),f=0,m=t.data,A=g.data
if(t.kind===s.ImageKind.GRAYSCALE_1BPP){var b=m.byteLength,_=new Uint32Array(A.buffer,0,A.byteLength>>2),y=_.length,v=h+7>>3,S=4294967295,x=s.IsLittleEndianCached.value?4278190080:255
for(n=0;n<p;n++){for(a=n<u?o:d,r=0,i=0;i<a;i++){for(var C=b-f,P=0,k=C>v?h:8*C-7,R=-8&k,w=0,T=0;P<R;P+=8)T=m[f++],_[r++]=128&T?S:x,_[r++]=64&T?S:x,_[r++]=32&T?S:x,_[r++]=16&T?S:x,_[r++]=8&T?S:x,_[r++]=4&T?S:x,_[r++]=2&T?S:x,_[r++]=1&T?S:x
for(;P<k;P++)0===w&&(T=m[f++],w=128),_[r++]=T&w?S:x,w>>=1}for(;r<y;)_[r++]=0
e.putImageData(g,0,n*o)}}else if(t.kind===s.ImageKind.RGBA_32BPP){for(i=0,l=h*o*4,n=0;n<u;n++)A.set(m.subarray(f,f+l)),f+=l,e.putImageData(g,0,i),i+=o
n<p&&(l=h*d*4,A.set(m.subarray(f,f+l)),e.putImageData(g,0,i))}else{if(t.kind!==s.ImageKind.RGB_24BPP)throw new Error("bad image kind: "+t.kind)
for(l=h*(a=o),n=0;n<p;n++){for(n>=u&&(l=h*(a=d)),r=0,i=l;i--;)A[r++]=m[f++],A[r++]=m[f++],A[r++]=m[f++],A[r++]=255
e.putImageData(g,0,n*o)}}}}function r(e,t){for(var r=t.height,s=t.width,n=r%o,i=(r-n)/o,a=0===n?i:i+1,l=e.createImageData(s,o),c=0,h=t.data,d=l.data,u=0;u<a;u++){for(var p=u<i?o:n,g=3,f=0;f<p;f++)for(var m=0,A=0;A<s;A++){if(!m){var b=h[c++]
m=128}d[g]=b&m?0:255,g+=4,m>>=1}e.putImageData(l,0,u*o)}}function d(e,t){for(var r=["strokeStyle","fillStyle","fillRule","globalAlpha","lineWidth","lineCap","lineJoin","miterLimit","globalCompositeOperation","font"],s=0,n=r.length;s<n;s++){var i=r[s]
void 0!==e[i]&&(t[i]=e[i])}void 0!==e.setLineDash&&(t.setLineDash(e.getLineDash()),t.lineDashOffset=e.lineDashOffset)}function u(e){e.strokeStyle="#000000",e.fillStyle="#000000",e.fillRule="nonzero",e.globalAlpha=1,e.lineWidth=1,e.lineCap="butt",e.lineJoin="miter",e.miterLimit=10,e.globalCompositeOperation="source-over",e.font="10px sans-serif",void 0!==e.setLineDash&&(e.setLineDash([]),e.lineDashOffset=0)}function p(e,t,r,s){for(var n=e.length,i=3;i<n;i+=4){var a=e[i]
if(0===a)e[i-3]=t,e[i-2]=r,e[i-1]=s
else if(a<255){var o=255-a
e[i-3]=e[i-3]*a+t*o>>8,e[i-2]=e[i-2]*a+r*o>>8,e[i-1]=e[i-1]*a+s*o>>8}}}function g(e,t,r){for(var s=e.length,n=3;n<s;n+=4){var i=r?r[e[n]]:e[n]
t[n]=t[n]*i*.00392156862745098|0}}function f(e,t,r){for(var s=e.length,n=3;n<s;n+=4){var i=77*e[n-3]+152*e[n-2]+28*e[n-1]
t[n]=r?t[n]*r[i>>8]>>8:t[n]*i>>16}}function m(e,t,r,s){var n=t.canvas,i=t.context
e.setTransform(t.scaleX,0,0,t.scaleY,t.offsetX,t.offsetY)
var a=t.backdrop||null
if(!t.transferMap&&s.isEnabled){const i=s.composeSMask({layer:r.canvas,mask:n,properties:{subtype:t.subtype,backdrop:a}})
return e.setTransform(1,0,0,1,0,0),void e.drawImage(i,t.offsetX,t.offsetY)}(function(e,t,r,s,n,i,a){var o,l=!!i,c=l?i[0]:0,h=l?i[1]:0,d=l?i[2]:0
o="Luminosity"===n?f:g
for(var u=Math.min(s,Math.ceil(1048576/r)),m=0;m<s;m+=u){var A=Math.min(u,s-m),b=e.getImageData(0,m,r,A),_=t.getImageData(0,m,r,A)
l&&p(b.data,c,h,d),o(b.data,_.data,a),e.putImageData(_,0,m)}})(i,r,n.width,n.height,t.subtype,a,t.transferMap),e.drawImage(n,0,0)}var A=["butt","round","square"],b=["miter","round","bevel"],_={},y={}
for(var v in e.prototype={beginDrawing({transform:e,viewport:t,transparency:r=!1,background:s=null}){var n=this.ctx.canvas.width,i=this.ctx.canvas.height
if(this.ctx.save(),this.ctx.fillStyle=s||"rgb(255, 255, 255)",this.ctx.fillRect(0,0,n,i),this.ctx.restore(),r){var a=this.cachedCanvases.getCanvas("transparent",n,i,!0)
this.compositeCtx=this.ctx,this.transparentCanvas=a.canvas,this.ctx=a.context,this.ctx.save(),this.ctx.transform.apply(this.ctx,this.compositeCtx.mozCurrentTransform)}this.ctx.save(),u(this.ctx),e&&this.ctx.transform.apply(this.ctx,e),this.ctx.transform.apply(this.ctx,t.transform),this.baseTransform=this.ctx.mozCurrentTransform.slice(),this.imageLayer&&this.imageLayer.beginLayout()},executeOperatorList:function(e,t,r,n){var i=e.argsArray,a=e.fnArray,o=t||0,l=i.length
if(l===o)return o
for(var c,h=l-o>10&&"function"==typeof r,d=h?Date.now()+15:0,u=0,p=this.commonObjs,g=this.objs;;){if(void 0!==n&&o===n.nextBreakPoint)return n.breakIt(o,r),o
if((c=a[o])!==s.OPS.dependency)this[c].apply(this,i[o])
else for(const e of i[o]){const t=e.startsWith("g_")?p:g
if(!t.has(e))return t.get(e,r),o}if(++o===l)return o
if(h&&++u>10){if(Date.now()>d)return r(),o
u=0}}},endDrawing:function(){null!==this.current.activeSMask&&this.endSMaskGroup(),this.ctx.restore(),this.transparentCanvas&&(this.ctx=this.compositeCtx,this.ctx.save(),this.ctx.setTransform(1,0,0,1,0,0),this.ctx.drawImage(this.transparentCanvas,0,0),this.ctx.restore(),this.transparentCanvas=null),this.cachedCanvases.clear(),this.webGLContext.clear(),this.imageLayer&&this.imageLayer.endLayout()},setLineWidth:function(e){this.current.lineWidth=e,this.ctx.lineWidth=e},setLineCap:function(e){this.ctx.lineCap=A[e]},setLineJoin:function(e){this.ctx.lineJoin=b[e]},setMiterLimit:function(e){this.ctx.miterLimit=e},setDash:function(e,t){var r=this.ctx
void 0!==r.setLineDash&&(r.setLineDash(e),r.lineDashOffset=t)},setRenderingIntent(e){},setFlatness(e){},setGState:function(e){for(var t=0,r=e.length;t<r;t++){var s=e[t],n=s[0],i=s[1]
switch(n){case"LW":this.setLineWidth(i)
break
case"LC":this.setLineCap(i)
break
case"LJ":this.setLineJoin(i)
break
case"ML":this.setMiterLimit(i)
break
case"D":this.setDash(i[0],i[1])
break
case"RI":this.setRenderingIntent(i)
break
case"FL":this.setFlatness(i)
break
case"Font":this.setFont(i[0],i[1])
break
case"CA":this.current.strokeAlpha=s[1]
break
case"ca":this.current.fillAlpha=s[1],this.ctx.globalAlpha=s[1]
break
case"BM":this.ctx.globalCompositeOperation=i
break
case"SMask":this.current.activeSMask&&(this.stateStack.length>0&&this.stateStack[this.stateStack.length-1].activeSMask===this.current.activeSMask?this.suspendSMaskGroup():this.endSMaskGroup()),this.current.activeSMask=i?this.tempSMask:null,this.current.activeSMask&&this.beginSMaskGroup(),this.tempSMask=null}}},beginSMaskGroup:function(){var e=this.current.activeSMask,t=e.canvas.width,r=e.canvas.height,s="smaskGroupAt"+this.groupLevel,n=this.cachedCanvases.getCanvas(s,t,r,!0),i=this.ctx,a=i.mozCurrentTransform
this.ctx.save()
var o=n.context
o.scale(1/e.scaleX,1/e.scaleY),o.translate(-e.offsetX,-e.offsetY),o.transform.apply(o,a),e.startTransformInverse=o.mozCurrentTransformInverse,d(i,o),this.ctx=o,this.setGState([["BM","source-over"],["ca",1],["CA",1]]),this.groupStack.push(i),this.groupLevel++},suspendSMaskGroup:function(){var e=this.ctx
this.groupLevel--,this.ctx=this.groupStack.pop(),m(this.ctx,this.current.activeSMask,e,this.webGLContext),this.ctx.restore(),this.ctx.save(),d(e,this.ctx),this.current.resumeSMaskCtx=e
var t=s.Util.transform(this.current.activeSMask.startTransformInverse,e.mozCurrentTransform)
this.ctx.transform.apply(this.ctx,t),e.save(),e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,e.canvas.width,e.canvas.height),e.restore()},resumeSMaskGroup:function(){var e=this.current.resumeSMaskCtx,t=this.ctx
this.ctx=e,this.groupStack.push(t),this.groupLevel++},endSMaskGroup:function(){var e=this.ctx
this.groupLevel--,this.ctx=this.groupStack.pop(),m(this.ctx,this.current.activeSMask,e,this.webGLContext),this.ctx.restore(),d(e,this.ctx)
var t=s.Util.transform(this.current.activeSMask.startTransformInverse,e.mozCurrentTransform)
this.ctx.transform.apply(this.ctx,t)},save:function(){this.ctx.save()
var e=this.current
this.stateStack.push(e),this.current=e.clone(),this.current.resumeSMaskCtx=null},restore:function(){this.current.resumeSMaskCtx&&this.resumeSMaskGroup(),null===this.current.activeSMask||0!==this.stateStack.length&&this.stateStack[this.stateStack.length-1].activeSMask===this.current.activeSMask||this.endSMaskGroup(),0!==this.stateStack.length&&(this.current=this.stateStack.pop(),this.ctx.restore(),this.pendingClip=null,this._cachedGetSinglePixelWidth=null)},transform:function(e,t,r,s,n,i){this.ctx.transform(e,t,r,s,n,i),this._cachedGetSinglePixelWidth=null},constructPath:function(e,t){for(var r=this.ctx,n=this.current,i=n.x,a=n.y,o=0,l=0,c=e.length;o<c;o++)switch(0|e[o]){case s.OPS.rectangle:i=t[l++],a=t[l++]
var h=t[l++],d=t[l++]
0===h&&(h=this.getSinglePixelWidth()),0===d&&(d=this.getSinglePixelWidth())
var u=i+h,p=a+d
this.ctx.moveTo(i,a),this.ctx.lineTo(u,a),this.ctx.lineTo(u,p),this.ctx.lineTo(i,p),this.ctx.lineTo(i,a),this.ctx.closePath()
break
case s.OPS.moveTo:i=t[l++],a=t[l++],r.moveTo(i,a)
break
case s.OPS.lineTo:i=t[l++],a=t[l++],r.lineTo(i,a)
break
case s.OPS.curveTo:i=t[l+4],a=t[l+5],r.bezierCurveTo(t[l],t[l+1],t[l+2],t[l+3],i,a),l+=6
break
case s.OPS.curveTo2:r.bezierCurveTo(i,a,t[l],t[l+1],t[l+2],t[l+3]),i=t[l+2],a=t[l+3],l+=4
break
case s.OPS.curveTo3:i=t[l+2],a=t[l+3],r.bezierCurveTo(t[l],t[l+1],i,a,i,a),l+=4
break
case s.OPS.closePath:r.closePath()}n.setCurrentPoint(i,a)},closePath:function(){this.ctx.closePath()},stroke:function(e){e=void 0===e||e
var t=this.ctx,r=this.current.strokeColor
if(t.globalAlpha=this.current.strokeAlpha,r&&r.hasOwnProperty("type")&&"Pattern"===r.type){t.save()
const e=t.mozCurrentTransform,n=s.Util.singularValueDecompose2dScale(e)[0]
t.strokeStyle=r.getPattern(t,this),t.lineWidth=Math.max(this.getSinglePixelWidth()*a,this.current.lineWidth*n),t.stroke(),t.restore()}else t.lineWidth=Math.max(this.getSinglePixelWidth()*a,this.current.lineWidth),t.stroke()
e&&this.consumePath(),t.globalAlpha=this.current.fillAlpha},closeStroke:function(){this.closePath(),this.stroke()},fill:function(e){e=void 0===e||e
var t=this.ctx,r=this.current.fillColor,s=!1
this.current.patternFill&&(t.save(),this.baseTransform&&t.setTransform.apply(t,this.baseTransform),t.fillStyle=r.getPattern(t,this),s=!0),this.pendingEOFill?(t.fill("evenodd"),this.pendingEOFill=!1):t.fill(),s&&t.restore(),e&&this.consumePath()},eoFill:function(){this.pendingEOFill=!0,this.fill()},fillStroke:function(){this.fill(!1),this.stroke(!1),this.consumePath()},eoFillStroke:function(){this.pendingEOFill=!0,this.fillStroke()},closeFillStroke:function(){this.closePath(),this.fillStroke()},closeEOFillStroke:function(){this.pendingEOFill=!0,this.closePath(),this.fillStroke()},endPath:function(){this.consumePath()},clip:function(){this.pendingClip=_},eoClip:function(){this.pendingClip=y},beginText:function(){this.current.textMatrix=s.IDENTITY_MATRIX,this.current.textMatrixScale=1,this.current.x=this.current.lineX=0,this.current.y=this.current.lineY=0},endText:function(){var e=this.pendingTextPaths,t=this.ctx
if(void 0!==e){t.save(),t.beginPath()
for(var r=0;r<e.length;r++){var s=e[r]
t.setTransform.apply(t,s.transform),t.translate(s.x,s.y),s.addToPath(t,s.fontSize)}t.restore(),t.clip(),t.beginPath(),delete this.pendingTextPaths}else t.beginPath()},setCharSpacing:function(e){this.current.charSpacing=e},setWordSpacing:function(e){this.current.wordSpacing=e},setHScale:function(e){this.current.textHScale=e/100},setLeading:function(e){this.current.leading=-e},setFont:function(e,t){var r=this.commonObjs.get(e),n=this.current
if(!r)throw new Error("Can't find font for "+e)
if(n.fontMatrix=r.fontMatrix?r.fontMatrix:s.FONT_IDENTITY_MATRIX,0!==n.fontMatrix[0]&&0!==n.fontMatrix[3]||(0,s.warn)("Invalid font matrix for font "+e),t<0?(t=-t,n.fontDirection=-1):n.fontDirection=1,this.current.font=r,this.current.fontSize=t,r.isType3Font)return
var i=r.loadedName||"sans-serif"
let a="normal"
r.black?a="900":r.bold&&(a="bold")
var o=r.italic?"italic":"normal",l=`"${i}", ${r.fallbackName}`
let c=t
t<16?c=16:t>100&&(c=100),this.current.fontSizeScale=t/c,this.ctx.font=`${o} ${a} ${c}px ${l}`},setTextRenderingMode:function(e){this.current.textRenderingMode=e},setTextRise:function(e){this.current.textRise=e},moveText:function(e,t){this.current.x=this.current.lineX+=e,this.current.y=this.current.lineY+=t},setLeadingMoveText:function(e,t){this.setLeading(-t),this.moveText(e,t)},setTextMatrix:function(e,t,r,s,n,i){this.current.textMatrix=[e,t,r,s,n,i],this.current.textMatrixScale=Math.sqrt(e*e+t*t),this.current.x=this.current.lineX=0,this.current.y=this.current.lineY=0},nextLine:function(){this.moveText(0,this.current.leading)},paintChar(e,t,r,n){var i=this.ctx,a=this.current,o=a.font,l=a.textRenderingMode,c=a.fontSize/a.fontSizeScale,h=l&s.TextRenderingMode.FILL_STROKE_MASK,d=!!(l&s.TextRenderingMode.ADD_TO_PATH_FLAG)
const u=a.patternFill&&!o.missingFile
var p;((o.disableFontFace||d||u)&&(p=o.getPathGenerator(this.commonObjs,e)),o.disableFontFace||u?(i.save(),i.translate(t,r),i.beginPath(),p(i,c),n&&i.setTransform.apply(i,n),h!==s.TextRenderingMode.FILL&&h!==s.TextRenderingMode.FILL_STROKE||i.fill(),h!==s.TextRenderingMode.STROKE&&h!==s.TextRenderingMode.FILL_STROKE||i.stroke(),i.restore()):(h!==s.TextRenderingMode.FILL&&h!==s.TextRenderingMode.FILL_STROKE||i.fillText(e,t,r),h!==s.TextRenderingMode.STROKE&&h!==s.TextRenderingMode.FILL_STROKE||i.strokeText(e,t,r)),d)&&(this.pendingTextPaths||(this.pendingTextPaths=[])).push({transform:i.mozCurrentTransform,x:t,y:r,fontSize:c,addToPath:p})},get isFontSubpixelAAEnabled(){const{context:e}=this.cachedCanvases.getCanvas("isFontSubpixelAAEnabled",10,10)
e.scale(1.5,1),e.fillText("I",0,10)
for(var t=e.getImageData(0,0,10,10).data,r=!1,n=3;n<t.length;n+=4)if(t[n]>0&&t[n]<255){r=!0
break}return(0,s.shadow)(this,"isFontSubpixelAAEnabled",r)},showText:function(e){var t=this.current,r=t.font
if(r.isType3Font)return this.showType3Text(e)
var n=t.fontSize
if(0===n)return
var i=this.ctx,o=t.fontSizeScale,l=t.charSpacing,c=t.wordSpacing,h=t.fontDirection,d=t.textHScale*h,u=e.length,p=r.vertical,g=p?1:-1,f=r.defaultVMetrics,m=n*t.fontMatrix[0],A=t.textRenderingMode===s.TextRenderingMode.FILL&&!r.disableFontFace&&!t.patternFill
let b
if(i.save(),t.patternFill){i.save()
const e=t.fillColor.getPattern(i,this)
b=i.mozCurrentTransform,i.restore(),i.fillStyle=e}i.transform.apply(i,t.textMatrix),i.translate(t.x,t.y+t.textRise),h>0?i.scale(d,-1):i.scale(d,1)
var _=t.lineWidth,y=t.textMatrixScale
if(0===y||0===_){var v=t.textRenderingMode&s.TextRenderingMode.FILL_STROKE_MASK
v!==s.TextRenderingMode.STROKE&&v!==s.TextRenderingMode.FILL_STROKE||(this._cachedGetSinglePixelWidth=null,_=this.getSinglePixelWidth()*a)}else _/=y
1!==o&&(i.scale(o,o),_/=o),i.lineWidth=_
var S,x=0
for(S=0;S<u;++S){var C=e[S]
if((0,s.isNum)(C))x+=g*C*n/1e3
else{var P,k,R,w,T,E,F,L=!1,I=(C.isSpace?c:0)+l,M=C.fontChar,O=C.accent,N=C.width
if(p)T=C.vmetric||f,E=-(E=C.vmetric?T[1]:.5*N)*m,F=T[2]*m,N=T?-T[0]:N,P=E/o,k=(x+F)/o
else P=x/o,k=0
if(r.remeasure&&N>0){var D=1e3*i.measureText(M).width/n*o
if(N<D&&this.isFontSubpixelAAEnabled){var j=N/D
L=!0,i.save(),i.scale(j,1),P/=j}else N!==D&&(P+=(N-D)/2e3*n/o)}(C.isInFont||r.missingFile)&&(A&&!O?i.fillText(M,P,k):(this.paintChar(M,P,k,b),O&&(R=P+O.offset.x/o,w=k-O.offset.y/o,this.paintChar(O.fontChar,R,w,b)))),x+=p?N*m-I*h:N*m+I*h,L&&i.restore()}}p?t.y-=x:t.x+=x*d,i.restore()},showType3Text:function(e){var t,r,n,i,a=this.ctx,o=this.current,l=o.font,c=o.fontSize,h=o.fontDirection,d=l.vertical?1:-1,u=o.charSpacing,p=o.wordSpacing,g=o.textHScale*h,f=o.fontMatrix||s.FONT_IDENTITY_MATRIX,m=e.length
if(!(o.textRenderingMode===s.TextRenderingMode.INVISIBLE)&&0!==c){for(this._cachedGetSinglePixelWidth=null,a.save(),a.transform.apply(a,o.textMatrix),a.translate(o.x,o.y),a.scale(g,h),t=0;t<m;++t)if(r=e[t],(0,s.isNum)(r))i=d*r*c/1e3,this.ctx.translate(i,0),o.x+=i*g
else{var A=(r.isSpace?p:0)+u,b=l.charProcOperatorList[r.operatorListId]
if(b)this.processingType3=r,this.save(),a.scale(c,c),a.transform.apply(a,f),this.executeOperatorList(b),this.restore(),n=s.Util.applyTransform([r.width,0],f)[0]*c+A,a.translate(n,0),o.x+=n*g
else(0,s.warn)(`Type3 character "${r.operatorListId}" is not available.`)}a.restore(),this.processingType3=null}},setCharWidth:function(e,t){},setCharWidthAndBounds:function(e,t,r,s,n,i){this.ctx.rect(r,s,n-r,i-s),this.clip(),this.endPath()},getColorN_Pattern:function(t){var r
if("TilingPattern"===t[0]){var s=t[1],i=this.baseTransform||this.ctx.mozCurrentTransform.slice(),a={createCanvasGraphics:t=>new e(t,this.commonObjs,this.objs,this.canvasFactory,this.webGLContext)}
r=new n.TilingPattern(t,s,this.ctx,a,i)}else r=(0,n.getShadingPatternFromIR)(t)
return r},setStrokeColorN:function(){this.current.strokeColor=this.getColorN_Pattern(arguments)},setFillColorN:function(){this.current.fillColor=this.getColorN_Pattern(arguments),this.current.patternFill=!0},setStrokeRGBColor:function(e,t,r){var n=s.Util.makeCssRgb(e,t,r)
this.ctx.strokeStyle=n,this.current.strokeColor=n},setFillRGBColor:function(e,t,r){var n=s.Util.makeCssRgb(e,t,r)
this.ctx.fillStyle=n,this.current.fillColor=n,this.current.patternFill=!1},shadingFill:function(e){var t=this.ctx
this.save()
var r=(0,n.getShadingPatternFromIR)(e)
t.fillStyle=r.getPattern(t,this,!0)
var i=t.mozCurrentTransformInverse
if(i){var a=t.canvas,o=a.width,l=a.height,c=s.Util.applyTransform([0,0],i),h=s.Util.applyTransform([0,l],i),d=s.Util.applyTransform([o,0],i),u=s.Util.applyTransform([o,l],i),p=Math.min(c[0],h[0],d[0],u[0]),g=Math.min(c[1],h[1],d[1],u[1]),f=Math.max(c[0],h[0],d[0],u[0]),m=Math.max(c[1],h[1],d[1],u[1])
this.ctx.fillRect(p,g,f-p,m-g)}else this.ctx.fillRect(-1e10,-1e10,2e10,2e10)
this.restore()},beginInlineImage:function(){(0,s.unreachable)("Should not call beginInlineImage")},beginImageData:function(){(0,s.unreachable)("Should not call beginImageData")},paintFormXObjectBegin:function(e,t){if(this.save(),this.baseTransformStack.push(this.baseTransform),Array.isArray(e)&&6===e.length&&this.transform.apply(this,e),this.baseTransform=this.ctx.mozCurrentTransform,t){var r=t[2]-t[0],s=t[3]-t[1]
this.ctx.rect(t[0],t[1],r,s),this.clip(),this.endPath()}},paintFormXObjectEnd:function(){this.restore(),this.baseTransform=this.baseTransformStack.pop()},beginGroup:function(e){this.save()
var t=this.ctx
e.isolated||(0,s.info)("TODO: Support non-isolated groups."),e.knockout&&(0,s.warn)("Knockout groups not supported.")
var r=t.mozCurrentTransform
if(e.matrix&&t.transform.apply(t,e.matrix),!e.bbox)throw new Error("Bounding box is required.")
var n=s.Util.getAxialAlignedBoundingBox(e.bbox,t.mozCurrentTransform),a=[0,0,t.canvas.width,t.canvas.height]
n=s.Util.intersect(n,a)||[0,0,0,0]
var o=Math.floor(n[0]),l=Math.floor(n[1]),c=Math.max(Math.ceil(n[2])-o,1),h=Math.max(Math.ceil(n[3])-l,1),u=1,p=1
c>i&&(u=c/i,c=i),h>i&&(p=h/i,h=i)
var g="groupAt"+this.groupLevel
e.smask&&(g+="_smask_"+this.smaskCounter++%2)
var f=this.cachedCanvases.getCanvas(g,c,h,!0),m=f.context
m.scale(1/u,1/p),m.translate(-o,-l),m.transform.apply(m,r),e.smask?this.smaskStack.push({canvas:f.canvas,context:m,offsetX:o,offsetY:l,scaleX:u,scaleY:p,subtype:e.smask.subtype,backdrop:e.smask.backdrop,transferMap:e.smask.transferMap||null,startTransformInverse:null}):(t.setTransform(1,0,0,1,0,0),t.translate(o,l),t.scale(u,p)),d(t,m),this.ctx=m,this.setGState([["BM","source-over"],["ca",1],["CA",1]]),this.groupStack.push(t),this.groupLevel++,this.current.activeSMask=null},endGroup:function(e){this.groupLevel--
var t=this.ctx
this.ctx=this.groupStack.pop(),void 0!==this.ctx.imageSmoothingEnabled?this.ctx.imageSmoothingEnabled=!1:this.ctx.mozImageSmoothingEnabled=!1,e.smask?this.tempSMask=this.smaskStack.pop():this.ctx.drawImage(t.canvas,0,0),this.restore()},beginAnnotations:function(){this.save(),this.baseTransform&&this.ctx.setTransform.apply(this.ctx,this.baseTransform)},endAnnotations:function(){this.restore()},beginAnnotation:function(e,t,r){if(this.save(),u(this.ctx),this.current=new h,Array.isArray(e)&&4===e.length){var s=e[2]-e[0],n=e[3]-e[1]
this.ctx.rect(e[0],e[1],s,n),this.clip(),this.endPath()}this.transform.apply(this,t),this.transform.apply(this,r)},endAnnotation:function(){this.restore()},paintImageMaskXObject:function(e){var t=this.ctx,s=e.width,n=e.height,i=this.current.fillColor,a=this.current.patternFill,o=this.processingType3
if(o&&void 0===o.compiled&&(o.compiled=s<=1e3&&n<=1e3?function(e){var t,r,s,n,i=e.width,a=e.height,o=i+1,l=new Uint8Array(o*(a+1)),c=new Uint8Array([0,2,4,0,1,0,5,4,8,10,0,8,0,2,1,0]),h=i+7&-8,d=e.data,u=new Uint8Array(h*a),p=0
for(t=0,n=d.length;t<n;t++)for(var g=128,f=d[t];g>0;)u[p++]=f&g?0:255,g>>=1
var m=0
for(0!==u[p=0]&&(l[0]=1,++m),r=1;r<i;r++)u[p]!==u[p+1]&&(l[r]=u[p]?2:1,++m),p++
for(0!==u[p]&&(l[r]=2,++m),t=1;t<a;t++){s=t*o,u[(p=t*h)-h]!==u[p]&&(l[s]=u[p]?1:8,++m)
var A=(u[p]?4:0)+(u[p-h]?8:0)
for(r=1;r<i;r++)c[A=(A>>2)+(u[p+1]?4:0)+(u[p-h+1]?8:0)]&&(l[s+r]=c[A],++m),p++
if(u[p-h]!==u[p]&&(l[s+r]=u[p]?2:4,++m),m>1e3)return null}for(s=t*o,0!==u[p=h*(a-1)]&&(l[s]=8,++m),r=1;r<i;r++)u[p]!==u[p+1]&&(l[s+r]=u[p]?4:8,++m),p++
if(0!==u[p]&&(l[s+r]=4,++m),m>1e3)return null
var b=new Int32Array([0,o,-1,0,-o,0,0,0,1]),_=[]
for(t=0;m&&t<=a;t++){for(var y=t*o,v=y+i;y<v&&!l[y];)y++
if(y!==v){var S,x=[y%o,t],C=l[y],P=y
do{var k=b[C]
do{y+=k}while(!l[y])
5!==(S=l[y])&&10!==S?(C=S,l[y]=0):(C=S&51*C>>4,l[y]&=C>>2|C<<2),x.push(y%o),x.push(y/o|0),l[y]||--m}while(P!==y)
_.push(x),--t}}return function(e){e.save(),e.scale(1/i,-1/a),e.translate(0,-a),e.beginPath()
for(let r=0,s=_.length;r<s;r++){var t=_[r]
e.moveTo(t[0],t[1])
for(let r=2,s=t.length;r<s;r+=2)e.lineTo(t[r],t[r+1])}e.fill(),e.beginPath(),e.restore()}}({data:e.data,width:s,height:n}):null),o&&o.compiled)o.compiled(t)
else{var l=this.cachedCanvases.getCanvas("maskCanvas",s,n),c=l.context
c.save(),r(c,e),c.globalCompositeOperation="source-in",c.fillStyle=a?i.getPattern(c,this):i,c.fillRect(0,0,s,n),c.restore(),this.paintInlineImageXObject(l.canvas)}},paintImageMaskXObjectRepeat:function(e,t,s,n){var i=e.width,a=e.height,o=this.current.fillColor,l=this.current.patternFill,c=this.cachedCanvases.getCanvas("maskCanvas",i,a),h=c.context
h.save(),r(h,e),h.globalCompositeOperation="source-in",h.fillStyle=l?o.getPattern(h,this):o,h.fillRect(0,0,i,a),h.restore()
for(var d=this.ctx,u=0,p=n.length;u<p;u+=2)d.save(),d.transform(t,0,0,s,n[u],n[u+1]),d.scale(1,-1),d.drawImage(c.canvas,0,0,i,a,0,-1,1,1),d.restore()},paintImageMaskXObjectGroup:function(e){for(var t=this.ctx,s=this.current.fillColor,n=this.current.patternFill,i=0,a=e.length;i<a;i++){var o=e[i],l=o.width,c=o.height,h=this.cachedCanvases.getCanvas("maskCanvas",l,c),d=h.context
d.save(),r(d,o),d.globalCompositeOperation="source-in",d.fillStyle=n?s.getPattern(d,this):s,d.fillRect(0,0,l,c),d.restore(),t.save(),t.transform.apply(t,o.transform),t.scale(1,-1),t.drawImage(h.canvas,0,0,l,c,0,-1,1,1),t.restore()}},paintImageXObject:function(e){const t=e.startsWith("g_")?this.commonObjs.get(e):this.objs.get(e)
t?this.paintInlineImageXObject(t):(0,s.warn)("Dependent image isn't ready yet")},paintImageXObjectRepeat:function(e,t,r,n){const i=e.startsWith("g_")?this.commonObjs.get(e):this.objs.get(e)
if(i){for(var a=i.width,o=i.height,l=[],c=0,h=n.length;c<h;c+=2)l.push({transform:[t,0,0,r,n[c],n[c+1]],x:0,y:0,w:a,h:o})
this.paintInlineImageXObjectGroup(i,l)}else(0,s.warn)("Dependent image isn't ready yet")},paintInlineImageXObject:function(e){var r=e.width,s=e.height,n=this.ctx
this.save(),n.scale(1/r,-1/s)
var i,a,o=n.mozCurrentTransformInverse,l=o[0],c=o[1],h=Math.max(Math.sqrt(l*l+c*c),1),d=o[2],u=o[3],p=Math.max(Math.sqrt(d*d+u*u),1)
if("function"==typeof HTMLElement&&e instanceof HTMLElement||!e.data)i=e
else{var g=(a=this.cachedCanvases.getCanvas("inlineImage",r,s)).context
t(g,e),i=a.canvas}for(var f=r,m=s,A="prescale1";h>2&&f>1||p>2&&m>1;){var b=f,_=m
h>2&&f>1&&(h/=f/(b=Math.ceil(f/2))),p>2&&m>1&&(p/=m/(_=Math.ceil(m/2))),(g=(a=this.cachedCanvases.getCanvas(A,b,_)).context).clearRect(0,0,b,_),g.drawImage(i,0,0,f,m,0,0,b,_),i=a.canvas,f=b,m=_,A="prescale1"===A?"prescale2":"prescale1"}if(n.drawImage(i,0,0,f,m,0,-s,r,s),this.imageLayer){var y=this.getCanvasPosition(0,-s)
this.imageLayer.appendImage({imgData:e,left:y[0],top:y[1],width:r/o[0],height:s/o[3]})}this.restore()},paintInlineImageXObjectGroup:function(e,r){var s=this.ctx,n=e.width,i=e.height,a=this.cachedCanvases.getCanvas("inlineImage",n,i)
t(a.context,e)
for(var o=0,l=r.length;o<l;o++){var c=r[o]
if(s.save(),s.transform.apply(s,c.transform),s.scale(1,-1),s.drawImage(a.canvas,c.x,c.y,c.w,c.h,0,-1,1,1),this.imageLayer){var h=this.getCanvasPosition(c.x,c.y)
this.imageLayer.appendImage({imgData:e,left:h[0],top:h[1],width:n,height:i})}s.restore()}},paintSolidColorImageMask:function(){this.ctx.fillRect(0,0,1,1)},paintXObject:function(){(0,s.warn)("Unsupported 'paintXObject' command.")},markPoint:function(e){},markPointProps:function(e,t){},beginMarkedContent:function(e){},beginMarkedContentProps:function(e,t){},endMarkedContent:function(){},beginCompat:function(){},endCompat:function(){},consumePath:function(){var e=this.ctx
this.pendingClip&&(this.pendingClip===y?e.clip("evenodd"):e.clip(),this.pendingClip=null),e.beginPath()},getSinglePixelWidth(e){if(null===this._cachedGetSinglePixelWidth){const e=this.ctx.mozCurrentTransformInverse
this._cachedGetSinglePixelWidth=Math.sqrt(Math.max(e[0]*e[0]+e[1]*e[1],e[2]*e[2]+e[3]*e[3]))}return this._cachedGetSinglePixelWidth},getCanvasPosition:function(e,t){var r=this.ctx.mozCurrentTransform
return[r[0]*e+r[2]*t+r[4],r[1]*e+r[3]*t+r[5]]}},s.OPS)e.prototype[s.OPS[v]]=e.prototype[v]
return e}()
t.CanvasGraphics=d},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.getShadingPatternFromIR=function(e){var t=n[e[0]]
if(!t)throw new Error("Unknown IR type: "+e[0])
return t.fromIR(e)},t.TilingPattern=void 0
var s=r(2),n={}
function i(e,t){if(!t||"undefined"==typeof Path2D)return
const r=t[2]-t[0],s=t[3]-t[1],n=new Path2D
n.rect(t[0],t[1],r,s),e.clip(n)}n.RadialAxial={fromIR:function(e){var t=e[1],r=e[2],s=e[3],n=e[4],a=e[5],o=e[6],l=e[7]
return{type:"Pattern",getPattern:function(e){var c
i(e,r),"axial"===t?c=e.createLinearGradient(n[0],n[1],a[0],a[1]):"radial"===t&&(c=e.createRadialGradient(n[0],n[1],o,a[0],a[1],l))
for(var h=0,d=s.length;h<d;++h){var u=s[h]
c.addColorStop(u[0],u[1])}return c}}}}
var a=function(){function e(e,t,r,s,n,i,a,o){var l,c=t.coords,h=t.colors,d=e.data,u=4*e.width
c[r+1]>c[s+1]&&(l=r,r=s,s=l,l=i,i=a,a=l),c[s+1]>c[n+1]&&(l=s,s=n,n=l,l=a,a=o,o=l),c[r+1]>c[s+1]&&(l=r,r=s,s=l,l=i,i=a,a=l)
var p=(c[r]+t.offsetX)*t.scaleX,g=(c[r+1]+t.offsetY)*t.scaleY,f=(c[s]+t.offsetX)*t.scaleX,m=(c[s+1]+t.offsetY)*t.scaleY,A=(c[n]+t.offsetX)*t.scaleX,b=(c[n+1]+t.offsetY)*t.scaleY
if(!(g>=b))for(var _,y,v,S,x,C,P,k,R=h[i],w=h[i+1],T=h[i+2],E=h[a],F=h[a+1],L=h[a+2],I=h[o],M=h[o+1],O=h[o+2],N=Math.round(g),D=Math.round(b),j=N;j<=D;j++){if(j<m){let e
e=j<g?0:g===m?1:(g-j)/(g-m),_=p-(p-f)*e,y=R-(R-E)*e,v=w-(w-F)*e,S=T-(T-L)*e}else{let e
e=j>b?1:m===b?0:(m-j)/(m-b),_=f-(f-A)*e,y=E-(E-I)*e,v=F-(F-M)*e,S=L-(L-O)*e}let e
e=j<g?0:j>b?1:(g-j)/(g-b),x=p-(p-A)*e,C=R-(R-I)*e,P=w-(w-M)*e,k=T-(T-O)*e
for(var U=Math.round(Math.min(_,x)),q=Math.round(Math.max(_,x)),W=u*j+4*U,G=U;G<=q;G++)e=(_-G)/(_-x),e<0?e=0:e>1&&(e=1),d[W++]=y-(y-C)*e|0,d[W++]=v-(v-P)*e|0,d[W++]=S-(S-k)*e|0,d[W++]=255}}function t(t,r,s){var n,i,a=r.coords,o=r.colors
switch(r.type){case"lattice":var l=r.verticesPerRow,c=Math.floor(a.length/l)-1,h=l-1
for(n=0;n<c;n++)for(var d=n*l,u=0;u<h;u++,d++)e(t,s,a[d],a[d+1],a[d+l],o[d],o[d+1],o[d+l]),e(t,s,a[d+l+1],a[d+1],a[d+l],o[d+l+1],o[d+1],o[d+l])
break
case"triangles":for(n=0,i=a.length;n<i;n+=3)e(t,s,a[n],a[n+1],a[n+2],o[n],o[n+1],o[n+2])
break
default:throw new Error("illegal figure")}}return function(e,r,s,n,i,a,o,l){var c,h,d,u,p=Math.floor(e[0]),g=Math.floor(e[1]),f=Math.ceil(e[2])-p,m=Math.ceil(e[3])-g,A=Math.min(Math.ceil(Math.abs(f*r[0]*1.1)),3e3),b=Math.min(Math.ceil(Math.abs(m*r[1]*1.1)),3e3),_=f/A,y=m/b,v={coords:s,colors:n,offsetX:-p,offsetY:-g,scaleX:1/_,scaleY:1/y},S=A+4,x=b+4
if(l.isEnabled)c=l.drawFigures({width:A,height:b,backgroundColor:a,figures:i,context:v}),(h=o.getCanvas("mesh",S,x,!1)).context.drawImage(c,2,2),c=h.canvas
else{var C=(h=o.getCanvas("mesh",S,x,!1)).context,P=C.createImageData(A,b)
if(a){var k=P.data
for(d=0,u=k.length;d<u;d+=4)k[d]=a[0],k[d+1]=a[1],k[d+2]=a[2],k[d+3]=255}for(d=0;d<i.length;d++)t(P,i[d],v)
C.putImageData(P,2,2),c=h.canvas}return{canvas:c,offsetX:p-2*_,offsetY:g-2*y,scaleX:_,scaleY:y}}}()
n.Mesh={fromIR:function(e){var t=e[2],r=e[3],n=e[4],o=e[5],l=e[6],c=e[7],h=e[8]
return{type:"Pattern",getPattern:function(e,d,u){var p
if(i(e,c),u)p=s.Util.singularValueDecompose2dScale(e.mozCurrentTransform)
else if(p=s.Util.singularValueDecompose2dScale(d.baseTransform),l){var g=s.Util.singularValueDecompose2dScale(l)
p=[p[0]*g[0],p[1]*g[1]]}var f=a(o,p,t,r,n,u?null:h,d.cachedCanvases,d.webGLContext)
return u||(e.setTransform.apply(e,d.baseTransform),l&&e.transform.apply(e,l)),e.translate(f.offsetX,f.offsetY),e.scale(f.scaleX,f.scaleY),e.createPattern(f.canvas,"no-repeat")}}}},n.Dummy={fromIR:function(){return{type:"Pattern",getPattern:function(){return"hotpink"}}}}
var o=function(){var e=1,t=2
function r(e,t,r,s,n){this.operatorList=e[2],this.matrix=e[3]||[1,0,0,1,0,0],this.bbox=e[4],this.xstep=e[5],this.ystep=e[6],this.paintType=e[7],this.tilingType=e[8],this.color=t,this.canvasGraphicsFactory=s,this.baseTransform=n,this.type="Pattern",this.ctx=r}return r.prototype={createPatternCanvas:function(e){var t=this.operatorList,r=this.bbox,n=this.xstep,i=this.ystep,a=this.paintType,o=this.tilingType,l=this.color,c=this.canvasGraphicsFactory;(0,s.info)("TilingType: "+o)
var h=r[0],d=r[1],u=r[2],p=r[3],g=s.Util.singularValueDecompose2dScale(this.matrix),f=s.Util.singularValueDecompose2dScale(this.baseTransform),m=[g[0]*f[0],g[1]*f[1]],A=this.getSizeAndScale(n,this.ctx.canvas.width,m[0]),b=this.getSizeAndScale(i,this.ctx.canvas.height,m[1]),_=e.cachedCanvases.getCanvas("pattern",A.size,b.size,!0),y=_.context,v=c.createCanvasGraphics(y)
return v.groupLevel=e.groupLevel,this.setFillAndStrokeStyleToContext(v,a,l),v.transform(A.scale,0,0,b.scale,0,0),v.transform(1,0,0,1,-h,-d),this.clipBbox(v,r,h,d,u,p),v.executeOperatorList(t),this.ctx.transform(1,0,0,1,h,d),this.ctx.scale(1/A.scale,1/b.scale),_.canvas},getSizeAndScale:function(e,t,r){e=Math.abs(e)
var s=Math.max(3e3,t),n=Math.ceil(e*r)
return n>=s?n=s:r=n/e,{scale:r,size:n}},clipBbox:function(e,t,r,s,n,i){if(Array.isArray(t)&&4===t.length){var a=n-r,o=i-s
e.ctx.rect(r,s,a,o),e.clip(),e.endPath()}},setFillAndStrokeStyleToContext:function(r,n,i){const a=r.ctx,o=r.current
switch(n){case e:var l=this.ctx
a.fillStyle=l.fillStyle,a.strokeStyle=l.strokeStyle,o.fillColor=l.fillStyle,o.strokeColor=l.strokeStyle
break
case t:var c=s.Util.makeCssRgb(i[0],i[1],i[2])
a.fillStyle=c,a.strokeStyle=c,o.fillColor=c,o.strokeColor=c
break
default:throw new s.FormatError("Unsupported paint type: "+n)}},getPattern:function(e,t){(e=this.ctx).setTransform.apply(e,this.baseTransform),e.transform.apply(e,this.matrix)
var r=this.createPatternCanvas(t)
return e.createPattern(r,"repeat")}},r}()
t.TilingPattern=o},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.GlobalWorkerOptions=void 0
const s=Object.create(null)
t.GlobalWorkerOptions=s,s.workerPort=void 0===s.workerPort?null:s.workerPort,s.workerSrc=void 0===s.workerSrc?"":s.workerSrc},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.MessageHandler=void 0
var s=r(2)
const n=1,i=2,a=1,o=2,l=3,c=4,h=5,d=6,u=7,p=8
function g(e){if("object"!=typeof e||null===e)return e
switch(e.name){case"AbortException":return new s.AbortException(e.message)
case"MissingPDFException":return new s.MissingPDFException(e.message)
case"UnexpectedResponseException":return new s.UnexpectedResponseException(e.message,e.status)
case"UnknownErrorException":return new s.UnknownErrorException(e.message,e.details)
default:return new s.UnknownErrorException(e.message,e.toString())}}t.MessageHandler=class{constructor(e,t,r){this.sourceName=e,this.targetName=t,this.comObj=r,this.callbackId=1,this.streamId=1,this.postMessageTransfers=!0,this.streamSinks=Object.create(null),this.streamControllers=Object.create(null),this.callbackCapabilities=Object.create(null),this.actionHandler=Object.create(null),this._onComObjOnMessage=e=>{const t=e.data
if(t.targetName!==this.sourceName)return
if(t.stream)return void this._processStreamMessage(t)
if(t.callback){const e=t.callbackId,r=this.callbackCapabilities[e]
if(!r)throw new Error("Cannot resolve callback "+e)
if(delete this.callbackCapabilities[e],t.callback===n)r.resolve(t.data)
else{if(t.callback!==i)throw new Error("Unexpected callback case")
r.reject(g(t.reason))}return}const s=this.actionHandler[t.action]
if(!s)throw new Error("Unknown action from worker: "+t.action)
if(t.callbackId){const e=this.sourceName,a=t.sourceName
new Promise((function(e){e(s(t.data))})).then((function(s){r.postMessage({sourceName:e,targetName:a,callback:n,callbackId:t.callbackId,data:s})}),(function(s){r.postMessage({sourceName:e,targetName:a,callback:i,callbackId:t.callbackId,reason:g(s)})}))}else t.streamId?this._createStreamSink(t):s(t.data)},r.addEventListener("message",this._onComObjOnMessage)}on(e,t){const r=this.actionHandler
if(r[e])throw new Error(`There is already an actionName called "${e}"`)
r[e]=t}send(e,t,r){this._postMessage({sourceName:this.sourceName,targetName:this.targetName,action:e,data:t},r)}sendWithPromise(e,t,r){const n=this.callbackId++,i=(0,s.createPromiseCapability)()
this.callbackCapabilities[n]=i
try{this._postMessage({sourceName:this.sourceName,targetName:this.targetName,action:e,callbackId:n,data:t},r)}catch(a){i.reject(a)}return i.promise}sendWithStream(e,t,r,n){const i=this.streamId++,o=this.sourceName,l=this.targetName,c=this.comObj
return new ReadableStream({start:r=>{const a=(0,s.createPromiseCapability)()
return this.streamControllers[i]={controller:r,startCall:a,pullCall:null,cancelCall:null,isClosed:!1},this._postMessage({sourceName:o,targetName:l,action:e,streamId:i,data:t,desiredSize:r.desiredSize},n),a.promise},pull:e=>{const t=(0,s.createPromiseCapability)()
return this.streamControllers[i].pullCall=t,c.postMessage({sourceName:o,targetName:l,stream:d,streamId:i,desiredSize:e.desiredSize}),t.promise},cancel:e=>{(0,s.assert)(e instanceof Error,"cancel must have a valid reason")
const t=(0,s.createPromiseCapability)()
return this.streamControllers[i].cancelCall=t,this.streamControllers[i].isClosed=!0,c.postMessage({sourceName:o,targetName:l,stream:a,streamId:i,reason:g(e)}),t.promise}},r)}_createStreamSink(e){const t=this,r=this.actionHandler[e.action],n=e.streamId,i=this.sourceName,a=e.sourceName,o=this.comObj,d={enqueue(e,r=1,o){if(this.isCancelled)return
const l=this.desiredSize
this.desiredSize-=r,l>0&&this.desiredSize<=0&&(this.sinkCapability=(0,s.createPromiseCapability)(),this.ready=this.sinkCapability.promise),t._postMessage({sourceName:i,targetName:a,stream:c,streamId:n,chunk:e},o)},close(){this.isCancelled||(this.isCancelled=!0,o.postMessage({sourceName:i,targetName:a,stream:l,streamId:n}),delete t.streamSinks[n])},error(e){(0,s.assert)(e instanceof Error,"error must have a valid reason"),this.isCancelled||(this.isCancelled=!0,o.postMessage({sourceName:i,targetName:a,stream:h,streamId:n,reason:g(e)}))},sinkCapability:(0,s.createPromiseCapability)(),onPull:null,onCancel:null,isCancelled:!1,desiredSize:e.desiredSize,ready:null}
d.sinkCapability.resolve(),d.ready=d.sinkCapability.promise,this.streamSinks[n]=d,new Promise((function(t){t(r(e.data,d))})).then((function(){o.postMessage({sourceName:i,targetName:a,stream:p,streamId:n,success:!0})}),(function(e){o.postMessage({sourceName:i,targetName:a,stream:p,streamId:n,reason:g(e)})}))}_processStreamMessage(e){const t=e.streamId,r=this.sourceName,n=e.sourceName,i=this.comObj
switch(e.stream){case p:e.success?this.streamControllers[t].startCall.resolve():this.streamControllers[t].startCall.reject(g(e.reason))
break
case u:e.success?this.streamControllers[t].pullCall.resolve():this.streamControllers[t].pullCall.reject(g(e.reason))
break
case d:if(!this.streamSinks[t]){i.postMessage({sourceName:r,targetName:n,stream:u,streamId:t,success:!0})
break}this.streamSinks[t].desiredSize<=0&&e.desiredSize>0&&this.streamSinks[t].sinkCapability.resolve(),this.streamSinks[t].desiredSize=e.desiredSize
const{onPull:f}=this.streamSinks[e.streamId]
new Promise((function(e){e(f&&f())})).then((function(){i.postMessage({sourceName:r,targetName:n,stream:u,streamId:t,success:!0})}),(function(e){i.postMessage({sourceName:r,targetName:n,stream:u,streamId:t,reason:g(e)})}))
break
case c:if((0,s.assert)(this.streamControllers[t],"enqueue should have stream controller"),this.streamControllers[t].isClosed)break
this.streamControllers[t].controller.enqueue(e.chunk)
break
case l:if((0,s.assert)(this.streamControllers[t],"close should have stream controller"),this.streamControllers[t].isClosed)break
this.streamControllers[t].isClosed=!0,this.streamControllers[t].controller.close(),this._deleteStreamController(t)
break
case h:(0,s.assert)(this.streamControllers[t],"error should have stream controller"),this.streamControllers[t].controller.error(g(e.reason)),this._deleteStreamController(t)
break
case o:e.success?this.streamControllers[t].cancelCall.resolve():this.streamControllers[t].cancelCall.reject(g(e.reason)),this._deleteStreamController(t)
break
case a:if(!this.streamSinks[t])break
const{onCancel:m}=this.streamSinks[e.streamId]
new Promise((function(t){t(m&&m(g(e.reason)))})).then((function(){i.postMessage({sourceName:r,targetName:n,stream:o,streamId:t,success:!0})}),(function(e){i.postMessage({sourceName:r,targetName:n,stream:o,streamId:t,reason:g(e)})})),this.streamSinks[t].sinkCapability.reject(g(e.reason)),this.streamSinks[t].isCancelled=!0,delete this.streamSinks[t]
break
default:throw new Error("Unexpected stream case")}}async _deleteStreamController(e){await Promise.allSettled([this.streamControllers[e].startCall,this.streamControllers[e].pullCall,this.streamControllers[e].cancelCall].map((function(e){return e&&e.promise}))),delete this.streamControllers[e]}_postMessage(e,t){t&&this.postMessageTransfers?this.comObj.postMessage(e,t):this.comObj.postMessage(e)}destroy(){this.comObj.removeEventListener("message",this._onComObjOnMessage)}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.Metadata=void 0
var s=r(2),n=r(13)
t.Metadata=class{constructor(e){(0,s.assert)("string"==typeof e,"Metadata: input is not a string"),e=this._repair(e)
const t=(new n.SimpleXMLParser).parseFromString(e)
this._metadataMap=new Map,t&&this._parse(t)}_repair(e){return e.replace(/^[^<]+/,"").replace(/>\\376\\377([^<]+)/g,(function(e,t){const r=t.replace(/\\([0-3])([0-7])([0-7])/g,(function(e,t,r,s){return String.fromCharCode(64*t+8*r+1*s)})).replace(/&(amp|apos|gt|lt|quot);/g,(function(e,t){switch(t){case"amp":return"&"
case"apos":return"'"
case"gt":return">"
case"lt":return"<"
case"quot":return'"'}throw new Error(`_repair: ${t} isn't defined.`)}))
let s=""
for(let n=0,i=r.length;n<i;n+=2){const e=256*r.charCodeAt(n)+r.charCodeAt(n+1)
s+=e>=32&&e<127&&60!==e&&62!==e&&38!==e?String.fromCharCode(e):"&#x"+(65536+e).toString(16).substring(1)+";"}return">"+s}))}_parse(e){let t=e.documentElement
if("rdf:rdf"!==t.nodeName.toLowerCase())for(t=t.firstChild;t&&"rdf:rdf"!==t.nodeName.toLowerCase();)t=t.nextSibling
const r=t?t.nodeName.toLowerCase():null
if(!t||"rdf:rdf"!==r||!t.hasChildNodes())return
const s=t.childNodes
for(let n=0,i=s.length;n<i;n++){const e=s[n]
if("rdf:description"===e.nodeName.toLowerCase())for(let t=0,r=e.childNodes.length;t<r;t++)if("#text"!==e.childNodes[t].nodeName.toLowerCase()){const r=e.childNodes[t],s=r.nodeName.toLowerCase()
this._metadataMap.set(s,r.textContent.trim())}}}get(e){return this._metadataMap.has(e)?this._metadataMap.get(e):null}getAll(){const e=Object.create(null)
for(const[t,r]of this._metadataMap)e[t]=r
return e}has(e){return this._metadataMap.has(e)}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.SimpleXMLParser=void 0
const s=0,n=-2,i=-3,a=-4,o=-5,l=-6,c=-9
function h(e,t){const r=e[t]
return" "===r||"\n"===r||"\r"===r||"\t"===r}class d{constructor(e,t){this.nodeName=e,this.nodeValue=t,Object.defineProperty(this,"parentNode",{value:null,writable:!0})}get firstChild(){return this.childNodes&&this.childNodes[0]}get nextSibling(){const e=this.parentNode.childNodes
if(!e)return
const t=e.indexOf(this)
return-1!==t?e[t+1]:void 0}get textContent(){return this.childNodes?this.childNodes.map((function(e){return e.textContent})).join(""):this.nodeValue||""}hasChildNodes(){return this.childNodes&&this.childNodes.length>0}}t.SimpleXMLParser=class extends class{_resolveEntities(e){return e.replace(/&([^;]+);/g,((e,t)=>{if("#x"===t.substring(0,2))return String.fromCharCode(parseInt(t.substring(2),16))
if("#"===t.substring(0,1))return String.fromCharCode(parseInt(t.substring(1),10))
switch(t){case"lt":return"<"
case"gt":return">"
case"amp":return"&"
case"quot":return'"'}return this.onResolveEntity(t)}))}_parseContent(e,t){const r=[]
let s=t
function n(){for(;s<e.length&&h(e,s);)++s}for(;s<e.length&&!h(e,s)&&">"!==e[s]&&"/"!==e[s];)++s
const i=e.substring(t,s)
for(n();s<e.length&&">"!==e[s]&&"/"!==e[s]&&"?"!==e[s];){n()
let t="",i=""
for(;s<e.length&&!h(e,s)&&"="!==e[s];)t+=e[s],++s
if(n(),"="!==e[s])return null;++s,n()
const a=e[s]
if('"'!==a&&"'"!==a)return null
const o=e.indexOf(a,++s)
if(o<0)return null
i=e.substring(s,o),r.push({name:t,value:this._resolveEntities(i)}),s=o+1,n()}return{name:i,attributes:r,parsed:s-t}}_parseProcessingInstruction(e,t){let r=t
for(;r<e.length&&!h(e,r)&&">"!==e[r]&&"/"!==e[r];)++r
const s=e.substring(t,r);(function(){for(;r<e.length&&h(e,r);)++r})()
const n=r
for(;r<e.length&&("?"!==e[r]||">"!==e[r+1]);)++r
return{name:s,value:e.substring(n,r),parsed:r-t}}parseXml(e){let t=0
for(;t<e.length;){let r=t
if("<"===e[t]){++r
let t
switch(e[r]){case"/":if(++r,t=e.indexOf(">",r),t<0)return void this.onError(c)
this.onEndElement(e.substring(r,t)),r=t+1
break
case"?":++r
const s=this._parseProcessingInstruction(e,r)
if("?>"!==e.substring(r+s.parsed,r+s.parsed+2))return void this.onError(i)
this.onPi(s.name,s.value),r+=s.parsed+2
break
case"!":if("--"===e.substring(r+1,r+3)){if(t=e.indexOf("--\x3e",r+3),t<0)return void this.onError(o)
this.onComment(e.substring(r+3,t)),r=t+3}else if("[CDATA["===e.substring(r+1,r+8)){if(t=e.indexOf("]]>",r+8),t<0)return void this.onError(n)
this.onCdata(e.substring(r+8,t)),r=t+3}else{if("DOCTYPE"!==e.substring(r+1,r+8))return void this.onError(l)
{const s=e.indexOf("[",r+8)
let n=!1
if(t=e.indexOf(">",r+8),t<0)return void this.onError(a)
if(s>0&&t>s){if(t=e.indexOf("]>",r+8),t<0)return void this.onError(a)
n=!0}const i=e.substring(r+8,t+(n?1:0))
this.onDoctype(i),r=t+(n?2:1)}}break
default:const h=this._parseContent(e,r)
if(null===h)return void this.onError(l)
let d=!1
if("/>"===e.substring(r+h.parsed,r+h.parsed+2))d=!0
else if(">"!==e.substring(r+h.parsed,r+h.parsed+1))return void this.onError(c)
this.onBeginElement(h.name,h.attributes,d),r+=h.parsed+(d?2:1)}}else{for(;r<e.length&&"<"!==e[r];)r++
const s=e.substring(t,r)
this.onText(this._resolveEntities(s))}t=r}}onResolveEntity(e){return`&${e};`}onPi(e,t){}onComment(e){}onCdata(e){}onDoctype(e){}onText(e){}onBeginElement(e,t,r){}onEndElement(e){}onError(e){}}{constructor(){super(),this._currentFragment=null,this._stack=null,this._errorCode=s}parseFromString(e){if(this._currentFragment=[],this._stack=[],this._errorCode=s,this.parseXml(e),this._errorCode!==s)return
const[t]=this._currentFragment
return t?{documentElement:t}:void 0}onResolveEntity(e){switch(e){case"apos":return"'"}return super.onResolveEntity(e)}onText(e){if(function(e){for(let t=0,r=e.length;t<r;t++)if(!h(e,t))return!1
return!0}(e))return
const t=new d("#text",e)
this._currentFragment.push(t)}onCdata(e){const t=new d("#text",e)
this._currentFragment.push(t)}onBeginElement(e,t,r){const s=new d(e)
s.childNodes=[],this._currentFragment.push(s),r||(this._stack.push(this._currentFragment),this._currentFragment=s.childNodes)}onEndElement(e){this._currentFragment=this._stack.pop()||[]
const t=this._currentFragment[this._currentFragment.length-1]
if(t)for(let r=0,s=t.childNodes.length;r<s;r++)t.childNodes[r].parentNode=t}onError(e){this._errorCode=e}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.PDFDataTransportStream=void 0
var s=r(2)
t.PDFDataTransportStream=class{constructor(e,t){(0,s.assert)(t,'PDFDataTransportStream - missing required "pdfDataRangeTransport" argument.'),this._queuedChunks=[],this._progressiveDone=e.progressiveDone||!1
const r=e.initialData
if(r&&r.length>0){const e=new Uint8Array(r).buffer
this._queuedChunks.push(e)}this._pdfDataRangeTransport=t,this._isStreamingSupported=!e.disableStream,this._isRangeSupported=!e.disableRange,this._contentLength=e.length,this._fullRequestReader=null,this._rangeReaders=[],this._pdfDataRangeTransport.addRangeListener(((e,t)=>{this._onReceiveData({begin:e,chunk:t})})),this._pdfDataRangeTransport.addProgressListener(((e,t)=>{this._onProgress({loaded:e,total:t})})),this._pdfDataRangeTransport.addProgressiveReadListener((e=>{this._onReceiveData({chunk:e})})),this._pdfDataRangeTransport.addProgressiveDoneListener((()=>{this._onProgressiveDone()})),this._pdfDataRangeTransport.transportReady()}_onReceiveData(e){const t=new Uint8Array(e.chunk).buffer
if(void 0===e.begin)this._fullRequestReader?this._fullRequestReader._enqueue(t):this._queuedChunks.push(t)
else{const r=this._rangeReaders.some((function(r){return r._begin===e.begin&&(r._enqueue(t),!0)}));(0,s.assert)(r,"_onReceiveData - no `PDFDataTransportStreamRangeReader` instance found.")}}get _progressiveDataLength(){return this._fullRequestReader?this._fullRequestReader._loaded:0}_onProgress(e){if(void 0===e.total){const t=this._rangeReaders[0]
t&&t.onProgress&&t.onProgress({loaded:e.loaded})}else{const t=this._fullRequestReader
t&&t.onProgress&&t.onProgress({loaded:e.loaded,total:e.total})}}_onProgressiveDone(){this._fullRequestReader&&this._fullRequestReader.progressiveDone(),this._progressiveDone=!0}_removeRangeReader(e){const t=this._rangeReaders.indexOf(e)
t>=0&&this._rangeReaders.splice(t,1)}getFullReader(){(0,s.assert)(!this._fullRequestReader,"PDFDataTransportStream.getFullReader can only be called once.")
const e=this._queuedChunks
return this._queuedChunks=null,new n(this,e,this._progressiveDone)}getRangeReader(e,t){if(t<=this._progressiveDataLength)return null
const r=new i(this,e,t)
return this._pdfDataRangeTransport.requestDataRange(e,t),this._rangeReaders.push(r),r}cancelAllRequests(e){this._fullRequestReader&&this._fullRequestReader.cancel(e)
this._rangeReaders.slice(0).forEach((function(t){t.cancel(e)})),this._pdfDataRangeTransport.abort()}}
class n{constructor(e,t,r=!1){this._stream=e,this._done=r||!1,this._filename=null,this._queuedChunks=t||[],this._loaded=0
for(const s of this._queuedChunks)this._loaded+=s.byteLength
this._requests=[],this._headersReady=Promise.resolve(),e._fullRequestReader=this,this.onProgress=null}_enqueue(e){if(!this._done){if(this._requests.length>0){this._requests.shift().resolve({value:e,done:!1})}else this._queuedChunks.push(e)
this._loaded+=e.byteLength}}get headersReady(){return this._headersReady}get filename(){return this._filename}get isRangeSupported(){return this._stream._isRangeSupported}get isStreamingSupported(){return this._stream._isStreamingSupported}get contentLength(){return this._stream._contentLength}async read(){if(this._queuedChunks.length>0){return{value:this._queuedChunks.shift(),done:!1}}if(this._done)return{value:void 0,done:!0}
const e=(0,s.createPromiseCapability)()
return this._requests.push(e),e.promise}cancel(e){this._done=!0,this._requests.forEach((function(e){e.resolve({value:void 0,done:!0})})),this._requests=[]}progressiveDone(){this._done||(this._done=!0)}}class i{constructor(e,t,r){this._stream=e,this._begin=t,this._end=r,this._queuedChunk=null,this._requests=[],this._done=!1,this.onProgress=null}_enqueue(e){if(!this._done){if(0===this._requests.length)this._queuedChunk=e
else{this._requests.shift().resolve({value:e,done:!1}),this._requests.forEach((function(e){e.resolve({value:void 0,done:!0})})),this._requests=[]}this._done=!0,this._stream._removeRangeReader(this)}}get isStreamingSupported(){return!1}async read(){if(this._queuedChunk){const e=this._queuedChunk
return this._queuedChunk=null,{value:e,done:!1}}if(this._done)return{value:void 0,done:!0}
const e=(0,s.createPromiseCapability)()
return this._requests.push(e),e.promise}cancel(e){this._done=!0,this._requests.forEach((function(e){e.resolve({value:void 0,done:!0})})),this._requests=[],this._stream._removeRangeReader(this)}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.WebGLContext=void 0
var s=r(2)
t.WebGLContext=class{constructor({enable:e=!1}){this._enabled=!0===e}get isEnabled(){let e=this._enabled
return e&&(e=n.tryInitGL()),(0,s.shadow)(this,"isEnabled",e)}composeSMask({layer:e,mask:t,properties:r}){return n.composeSMask(e,t,r)}drawFigures({width:e,height:t,backgroundColor:r,figures:s,context:i}){return n.drawFigures(e,t,r,s,i)}clear(){n.cleanup()}}
var n=function(){function e(e,t,r){var s=e.createShader(r)
if(e.shaderSource(s,t),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){var n=e.getShaderInfoLog(s)
throw new Error("Error during shader compilation: "+n)}return s}function t(t,r){return e(t,r,t.VERTEX_SHADER)}function r(t,r){return e(t,r,t.FRAGMENT_SHADER)}function s(e,t){for(var r=e.createProgram(),s=0,n=t.length;s<n;++s)e.attachShader(r,t[s])
if(e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS)){var i=e.getProgramInfoLog(r)
throw new Error("Error during program linking: "+i)}return r}function n(e,t,r){e.activeTexture(r)
var s=e.createTexture()
return e.bindTexture(e.TEXTURE_2D,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),s}var i,a
function o(){i||(a=document.createElement("canvas"),i=a.getContext("webgl",{premultipliedalpha:!1}))}var l=null
var c=null
return{tryInitGL(){try{return o(),!!i}catch(e){}return!1},composeSMask:function(e,c,h){var d=e.width,u=e.height
l||function(){var e,n
o(),e=a,a=null,n=i,i=null
var c=s(n,[t(n,"  attribute vec2 a_position;                                      attribute vec2 a_texCoord;                                                                                                      uniform vec2 u_resolution;                                                                                                      varying vec2 v_texCoord;                                                                                                        void main() {                                                     vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;       gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);                                                                              v_texCoord = a_texCoord;                                      }                                                             "),r(n,"  precision mediump float;                                                                                                        uniform vec4 u_backdrop;                                        uniform int u_subtype;                                          uniform sampler2D u_image;                                      uniform sampler2D u_mask;                                                                                                       varying vec2 v_texCoord;                                                                                                        void main() {                                                     vec4 imageColor = texture2D(u_image, v_texCoord);               vec4 maskColor = texture2D(u_mask, v_texCoord);                 if (u_backdrop.a > 0.0) {                                         maskColor.rgb = maskColor.rgb * maskColor.a +                                   u_backdrop.rgb * (1.0 - maskColor.a);         }                                                               float lum;                                                      if (u_subtype == 0) {                                             lum = maskColor.a;                                            } else {                                                          lum = maskColor.r * 0.3 + maskColor.g * 0.59 +                        maskColor.b * 0.11;                                     }                                                               imageColor.a *= lum;                                            imageColor.rgb *= imageColor.a;                                 gl_FragColor = imageColor;                                    }                                                             ")])
n.useProgram(c)
var h={}
h.gl=n,h.canvas=e,h.resolutionLocation=n.getUniformLocation(c,"u_resolution"),h.positionLocation=n.getAttribLocation(c,"a_position"),h.backdropLocation=n.getUniformLocation(c,"u_backdrop"),h.subtypeLocation=n.getUniformLocation(c,"u_subtype")
var d=n.getAttribLocation(c,"a_texCoord"),u=n.getUniformLocation(c,"u_image"),p=n.getUniformLocation(c,"u_mask"),g=n.createBuffer()
n.bindBuffer(n.ARRAY_BUFFER,g),n.bufferData(n.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),n.STATIC_DRAW),n.enableVertexAttribArray(d),n.vertexAttribPointer(d,2,n.FLOAT,!1,0,0),n.uniform1i(u,0),n.uniform1i(p,1),l=h}()
var p=l,g=p.canvas,f=p.gl
g.width=d,g.height=u,f.viewport(0,0,f.drawingBufferWidth,f.drawingBufferHeight),f.uniform2f(p.resolutionLocation,d,u),h.backdrop?f.uniform4f(p.resolutionLocation,h.backdrop[0],h.backdrop[1],h.backdrop[2],1):f.uniform4f(p.resolutionLocation,0,0,0,0),f.uniform1i(p.subtypeLocation,"Luminosity"===h.subtype?1:0)
var m=n(f,e,f.TEXTURE0),A=n(f,c,f.TEXTURE1),b=f.createBuffer()
return f.bindBuffer(f.ARRAY_BUFFER,b),f.bufferData(f.ARRAY_BUFFER,new Float32Array([0,0,d,0,0,u,0,u,d,0,d,u]),f.STATIC_DRAW),f.enableVertexAttribArray(p.positionLocation),f.vertexAttribPointer(p.positionLocation,2,f.FLOAT,!1,0,0),f.clearColor(0,0,0,0),f.enable(f.BLEND),f.blendFunc(f.ONE,f.ONE_MINUS_SRC_ALPHA),f.clear(f.COLOR_BUFFER_BIT),f.drawArrays(f.TRIANGLES,0,6),f.flush(),f.deleteTexture(m),f.deleteTexture(A),f.deleteBuffer(b),g},drawFigures:function(e,n,l,h,d){c||function(){var e,n
o(),e=a,a=null,n=i,i=null
var l=s(n,[t(n,"  attribute vec2 a_position;                                      attribute vec3 a_color;                                                                                                         uniform vec2 u_resolution;                                      uniform vec2 u_scale;                                           uniform vec2 u_offset;                                                                                                          varying vec4 v_color;                                                                                                           void main() {                                                     vec2 position = (a_position + u_offset) * u_scale;              vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;         gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);                                                                              v_color = vec4(a_color / 255.0, 1.0);                         }                                                             "),r(n,"  precision mediump float;                                                                                                        varying vec4 v_color;                                                                                                           void main() {                                                     gl_FragColor = v_color;                                       }                                                             ")])
n.useProgram(l)
var h={}
h.gl=n,h.canvas=e,h.resolutionLocation=n.getUniformLocation(l,"u_resolution"),h.scaleLocation=n.getUniformLocation(l,"u_scale"),h.offsetLocation=n.getUniformLocation(l,"u_offset"),h.positionLocation=n.getAttribLocation(l,"a_position"),h.colorLocation=n.getAttribLocation(l,"a_color"),c=h}()
var u=c,p=u.canvas,g=u.gl
p.width=e,p.height=n,g.viewport(0,0,g.drawingBufferWidth,g.drawingBufferHeight),g.uniform2f(u.resolutionLocation,e,n)
var f,m,A,b=0
for(f=0,m=h.length;f<m;f++)switch(h[f].type){case"lattice":b+=((A=h[f].coords.length/h[f].verticesPerRow|0)-1)*(h[f].verticesPerRow-1)*6
break
case"triangles":b+=h[f].coords.length}var _=new Float32Array(2*b),y=new Uint8Array(3*b),v=d.coords,S=d.colors,x=0,C=0
for(f=0,m=h.length;f<m;f++){var P=h[f],k=P.coords,R=P.colors
switch(P.type){case"lattice":var w=P.verticesPerRow
A=k.length/w|0
for(var T=1;T<A;T++)for(var E=T*w+1,F=1;F<w;F++,E++){_[x]=v[k[E-w-1]],_[x+1]=v[k[E-w-1]+1],_[x+2]=v[k[E-w]],_[x+3]=v[k[E-w]+1],_[x+4]=v[k[E-1]],_[x+5]=v[k[E-1]+1],y[C]=S[R[E-w-1]],y[C+1]=S[R[E-w-1]+1],y[C+2]=S[R[E-w-1]+2],y[C+3]=S[R[E-w]],y[C+4]=S[R[E-w]+1],y[C+5]=S[R[E-w]+2],y[C+6]=S[R[E-1]],y[C+7]=S[R[E-1]+1],y[C+8]=S[R[E-1]+2],_[x+6]=_[x+2],_[x+7]=_[x+3],_[x+8]=_[x+4],_[x+9]=_[x+5],_[x+10]=v[k[E]],_[x+11]=v[k[E]+1],y[C+9]=y[C+3],y[C+10]=y[C+4],y[C+11]=y[C+5],y[C+12]=y[C+6],y[C+13]=y[C+7],y[C+14]=y[C+8],y[C+15]=S[R[E]],y[C+16]=S[R[E]+1],y[C+17]=S[R[E]+2]
x+=12,C+=18}break
case"triangles":for(var L=0,I=k.length;L<I;L++)_[x]=v[k[L]],_[x+1]=v[k[L]+1],y[C]=S[R[L]],y[C+1]=S[R[L]+1],y[C+2]=S[R[L]+2],x+=2,C+=3}}l?g.clearColor(l[0]/255,l[1]/255,l[2]/255,1):g.clearColor(0,0,0,0),g.clear(g.COLOR_BUFFER_BIT)
var M=g.createBuffer()
g.bindBuffer(g.ARRAY_BUFFER,M),g.bufferData(g.ARRAY_BUFFER,_,g.STATIC_DRAW),g.enableVertexAttribArray(u.positionLocation),g.vertexAttribPointer(u.positionLocation,2,g.FLOAT,!1,0,0)
var O=g.createBuffer()
return g.bindBuffer(g.ARRAY_BUFFER,O),g.bufferData(g.ARRAY_BUFFER,y,g.STATIC_DRAW),g.enableVertexAttribArray(u.colorLocation),g.vertexAttribPointer(u.colorLocation,3,g.UNSIGNED_BYTE,!1,0,0),g.uniform2f(u.scaleLocation,d.scaleX,d.scaleY),g.uniform2f(u.offsetLocation,d.offsetX,d.offsetY),g.drawArrays(g.TRIANGLES,0,b),g.flush(),g.deleteBuffer(M),g.deleteBuffer(O),p},cleanup(){l&&l.canvas&&(l.canvas.width=0,l.canvas.height=0),c&&c.canvas&&(c.canvas.width=0,c.canvas.height=0),l=null,c=null}}}()},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.AnnotationLayer=void 0
var s=r(1),n=r(2)
class i{static create(e){switch(e.data.annotationType){case n.AnnotationType.LINK:return new o(e)
case n.AnnotationType.TEXT:return new l(e)
case n.AnnotationType.WIDGET:switch(e.data.fieldType){case"Tx":return new h(e)
case"Btn":return e.data.radioButton?new u(e):e.data.checkBox?new d(e):new p(e)
case"Ch":return new g(e)}return new c(e)
case n.AnnotationType.POPUP:return new f(e)
case n.AnnotationType.FREETEXT:return new A(e)
case n.AnnotationType.LINE:return new b(e)
case n.AnnotationType.SQUARE:return new _(e)
case n.AnnotationType.CIRCLE:return new y(e)
case n.AnnotationType.POLYLINE:return new v(e)
case n.AnnotationType.CARET:return new x(e)
case n.AnnotationType.INK:return new C(e)
case n.AnnotationType.POLYGON:return new S(e)
case n.AnnotationType.HIGHLIGHT:return new P(e)
case n.AnnotationType.UNDERLINE:return new k(e)
case n.AnnotationType.SQUIGGLY:return new R(e)
case n.AnnotationType.STRIKEOUT:return new w(e)
case n.AnnotationType.STAMP:return new T(e)
case n.AnnotationType.FILEATTACHMENT:return new E(e)
default:return new a(e)}}}class a{constructor(e,t=!1,r=!1){this.isRenderable=t,this.data=e.data,this.layer=e.layer,this.page=e.page,this.viewport=e.viewport,this.linkService=e.linkService,this.downloadManager=e.downloadManager,this.imageResourcesPath=e.imageResourcesPath,this.renderInteractiveForms=e.renderInteractiveForms,this.svgFactory=e.svgFactory,t&&(this.container=this._createContainer(r))}_createContainer(e=!1){const t=this.data,r=this.page,s=this.viewport,i=document.createElement("section")
let a=t.rect[2]-t.rect[0],o=t.rect[3]-t.rect[1]
i.setAttribute("data-annotation-id",t.id)
const l=n.Util.normalizeRect([t.rect[0],r.view[3]-t.rect[1]+r.view[1],t.rect[2],r.view[3]-t.rect[3]+r.view[1]])
if(i.style.transform=`matrix(${s.transform.join(",")})`,i.style.transformOrigin=`-${l[0]}px -${l[1]}px`,!e&&t.borderStyle.width>0){i.style.borderWidth=t.borderStyle.width+"px",t.borderStyle.style!==n.AnnotationBorderStyleType.UNDERLINE&&(a-=2*t.borderStyle.width,o-=2*t.borderStyle.width)
const e=t.borderStyle.horizontalCornerRadius,r=t.borderStyle.verticalCornerRadius
if(e>0||r>0){const t=`${e}px / ${r}px`
i.style.borderRadius=t}switch(t.borderStyle.style){case n.AnnotationBorderStyleType.SOLID:i.style.borderStyle="solid"
break
case n.AnnotationBorderStyleType.DASHED:i.style.borderStyle="dashed"
break
case n.AnnotationBorderStyleType.BEVELED:(0,n.warn)("Unimplemented border style: beveled")
break
case n.AnnotationBorderStyleType.INSET:(0,n.warn)("Unimplemented border style: inset")
break
case n.AnnotationBorderStyleType.UNDERLINE:i.style.borderBottomStyle="solid"}t.color?i.style.borderColor=n.Util.makeCssRgb(0|t.color[0],0|t.color[1],0|t.color[2]):i.style.borderWidth=0}return i.style.left=l[0]+"px",i.style.top=l[1]+"px",i.style.width=a+"px",i.style.height=o+"px",i}_createPopup(e,t,r){t||((t=document.createElement("div")).style.height=e.style.height,t.style.width=e.style.width,e.appendChild(t))
const s=new m({container:e,trigger:t,color:r.color,title:r.title,modificationDate:r.modificationDate,contents:r.contents,hideWrapper:!0}).render()
s.style.left=e.style.width,e.appendChild(s)}render(){(0,n.unreachable)("Abstract method `AnnotationElement.render` called")}}class o extends a{constructor(e){super(e,!!(e.data.url||e.data.dest||e.data.action))}render(){this.container.className="linkAnnotation"
const{data:e,linkService:t}=this,r=document.createElement("a")
return e.url?(0,s.addLinkAttributes)(r,{url:e.url,target:e.newWindow?s.LinkTarget.BLANK:t.externalLinkTarget,rel:t.externalLinkRel,enabled:t.externalLinkEnabled}):e.action?this._bindNamedAction(r,e.action):this._bindLink(r,e.dest),this.container.appendChild(r),this.container}_bindLink(e,t){e.href=this.linkService.getDestinationHash(t),e.onclick=()=>(t&&this.linkService.navigateTo(t),!1),t&&(e.className="internalLink")}_bindNamedAction(e,t){e.href=this.linkService.getAnchorUrl(""),e.onclick=()=>(this.linkService.executeNamedAction(t),!1),e.className="internalLink"}}class l extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents))}render(){this.container.className="textAnnotation"
const e=document.createElement("img")
return e.style.height=this.container.style.height,e.style.width=this.container.style.width,e.src=this.imageResourcesPath+"annotation-"+this.data.name.toLowerCase()+".svg",e.alt="[{{type}} Annotation]",e.dataset.l10nId="text_annotation_type",e.dataset.l10nArgs=JSON.stringify({type:this.data.name}),this.data.hasPopup||this._createPopup(this.container,e,this.data),this.container.appendChild(e),this.container}}class c extends a{render(){return this.container}}class h extends c{constructor(e){super(e,e.renderInteractiveForms||!e.data.hasAppearance&&!!e.data.fieldValue)}render(){const e=["left","center","right"]
this.container.className="textWidgetAnnotation"
let t=null
if(this.renderInteractiveForms){if(this.data.multiLine?(t=document.createElement("textarea"),t.textContent=this.data.fieldValue):(t=document.createElement("input"),t.type="text",t.setAttribute("value",this.data.fieldValue)),t.disabled=this.data.readOnly,t.name=this.data.fieldName,null!==this.data.maxLen&&(t.maxLength=this.data.maxLen),this.data.comb){const e=(this.data.rect[2]-this.data.rect[0])/this.data.maxLen
t.classList.add("comb"),t.style.letterSpacing=`calc(${e}px - 1ch)`}}else{t=document.createElement("div"),t.textContent=this.data.fieldValue,t.style.verticalAlign="middle",t.style.display="table-cell"
let e=null
this.data.fontRefName&&this.page.commonObjs.has(this.data.fontRefName)&&(e=this.page.commonObjs.get(this.data.fontRefName)),this._setTextStyle(t,e)}return null!==this.data.textAlignment&&(t.style.textAlign=e[this.data.textAlignment]),this.container.appendChild(t),this.container}_setTextStyle(e,t){const r=e.style
if(r.fontSize=this.data.fontSize+"px",r.direction=this.data.fontDirection<0?"rtl":"ltr",!t)return
let s="normal"
t.black?s="900":t.bold&&(s="bold"),r.fontWeight=s,r.fontStyle=t.italic?"italic":"normal"
const n=t.loadedName?`"${t.loadedName}", `:"",i=t.fallbackName||"Helvetica, sans-serif"
r.fontFamily=n+i}}class d extends c{constructor(e){super(e,e.renderInteractiveForms)}render(){this.container.className="buttonWidgetAnnotation checkBox"
const e=document.createElement("input")
return e.disabled=this.data.readOnly,e.type="checkbox",e.name=this.data.fieldName,this.data.fieldValue&&"Off"!==this.data.fieldValue&&e.setAttribute("checked",!0),this.container.appendChild(e),this.container}}class u extends c{constructor(e){super(e,e.renderInteractiveForms)}render(){this.container.className="buttonWidgetAnnotation radioButton"
const e=document.createElement("input")
return e.disabled=this.data.readOnly,e.type="radio",e.name=this.data.fieldName,this.data.fieldValue===this.data.buttonValue&&e.setAttribute("checked",!0),this.container.appendChild(e),this.container}}class p extends o{render(){const e=super.render()
return e.className="buttonWidgetAnnotation pushButton",e}}class g extends c{constructor(e){super(e,e.renderInteractiveForms)}render(){this.container.className="choiceWidgetAnnotation"
const e=document.createElement("select")
e.disabled=this.data.readOnly,e.name=this.data.fieldName,this.data.combo||(e.size=this.data.options.length,this.data.multiSelect&&(e.multiple=!0))
for(const t of this.data.options){const r=document.createElement("option")
r.textContent=t.displayValue,r.value=t.exportValue,this.data.fieldValue.includes(t.displayValue)&&r.setAttribute("selected",!0),e.appendChild(r)}return this.container.appendChild(e),this.container}}class f extends a{constructor(e){super(e,!(!e.data.title&&!e.data.contents))}render(){if(this.container.className="popupAnnotation",["Line","Square","Circle","PolyLine","Polygon","Ink"].includes(this.data.parentType))return this.container
const e=`[data-annotation-id="${this.data.parentId}"]`,t=this.layer.querySelector(e)
if(!t)return this.container
const r=new m({container:this.container,trigger:t,color:this.data.color,title:this.data.title,modificationDate:this.data.modificationDate,contents:this.data.contents}),s=parseFloat(t.style.left),n=parseFloat(t.style.width)
return this.container.style.transformOrigin=`-${s+n}px -${t.style.top}`,this.container.style.left=s+n+"px",this.container.appendChild(r.render()),this.container}}class m{constructor(e){this.container=e.container,this.trigger=e.trigger,this.color=e.color,this.title=e.title,this.modificationDate=e.modificationDate,this.contents=e.contents,this.hideWrapper=e.hideWrapper||!1,this.pinned=!1}render(){const e=document.createElement("div")
e.className="popupWrapper",this.hideElement=this.hideWrapper?e:this.container,this.hideElement.setAttribute("hidden",!0)
const t=document.createElement("div")
t.className="popup"
const r=this.color
if(r){const e=.7*(255-r[0])+r[0],s=.7*(255-r[1])+r[1],i=.7*(255-r[2])+r[2]
t.style.backgroundColor=n.Util.makeCssRgb(0|e,0|s,0|i)}const i=document.createElement("h1")
i.textContent=this.title,t.appendChild(i)
const a=s.PDFDateString.toDateObject(this.modificationDate)
if(a){const e=document.createElement("span")
e.textContent="{{date}}, {{time}}",e.dataset.l10nId="annotation_date_string",e.dataset.l10nArgs=JSON.stringify({date:a.toLocaleDateString(),time:a.toLocaleTimeString()}),t.appendChild(e)}const o=this._formatContents(this.contents)
return t.appendChild(o),this.trigger.addEventListener("click",this._toggle.bind(this)),this.trigger.addEventListener("mouseover",this._show.bind(this,!1)),this.trigger.addEventListener("mouseout",this._hide.bind(this,!1)),t.addEventListener("click",this._hide.bind(this,!0)),e.appendChild(t),e}_formatContents(e){const t=document.createElement("p"),r=e.split(/(?:\r\n?|\n)/)
for(let s=0,n=r.length;s<n;++s){const e=r[s]
t.appendChild(document.createTextNode(e)),s<n-1&&t.appendChild(document.createElement("br"))}return t}_toggle(){this.pinned?this._hide(!0):this._show(!0)}_show(e=!1){e&&(this.pinned=!0),this.hideElement.hasAttribute("hidden")&&(this.hideElement.removeAttribute("hidden"),this.container.style.zIndex+=1)}_hide(e=!0){e&&(this.pinned=!1),this.hideElement.hasAttribute("hidden")||this.pinned||(this.hideElement.setAttribute("hidden",!0),this.container.style.zIndex-=1)}}class A extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){return this.container.className="freeTextAnnotation",this.data.hasPopup||this._createPopup(this.container,null,this.data),this.container}}class b extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){this.container.className="lineAnnotation"
const e=this.data,t=e.rect[2]-e.rect[0],r=e.rect[3]-e.rect[1],s=this.svgFactory.create(t,r),n=this.svgFactory.createElement("svg:line")
return n.setAttribute("x1",e.rect[2]-e.lineCoordinates[0]),n.setAttribute("y1",e.rect[3]-e.lineCoordinates[1]),n.setAttribute("x2",e.rect[2]-e.lineCoordinates[2]),n.setAttribute("y2",e.rect[3]-e.lineCoordinates[3]),n.setAttribute("stroke-width",e.borderStyle.width||1),n.setAttribute("stroke","transparent"),s.appendChild(n),this.container.append(s),this._createPopup(this.container,n,e),this.container}}class _ extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){this.container.className="squareAnnotation"
const e=this.data,t=e.rect[2]-e.rect[0],r=e.rect[3]-e.rect[1],s=this.svgFactory.create(t,r),n=e.borderStyle.width,i=this.svgFactory.createElement("svg:rect")
return i.setAttribute("x",n/2),i.setAttribute("y",n/2),i.setAttribute("width",t-n),i.setAttribute("height",r-n),i.setAttribute("stroke-width",n||1),i.setAttribute("stroke","transparent"),i.setAttribute("fill","none"),s.appendChild(i),this.container.append(s),this._createPopup(this.container,i,e),this.container}}class y extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){this.container.className="circleAnnotation"
const e=this.data,t=e.rect[2]-e.rect[0],r=e.rect[3]-e.rect[1],s=this.svgFactory.create(t,r),n=e.borderStyle.width,i=this.svgFactory.createElement("svg:ellipse")
return i.setAttribute("cx",t/2),i.setAttribute("cy",r/2),i.setAttribute("rx",t/2-n/2),i.setAttribute("ry",r/2-n/2),i.setAttribute("stroke-width",n||1),i.setAttribute("stroke","transparent"),i.setAttribute("fill","none"),s.appendChild(i),this.container.append(s),this._createPopup(this.container,i,e),this.container}}class v extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0),this.containerClassName="polylineAnnotation",this.svgElementName="svg:polyline"}render(){this.container.className=this.containerClassName
const e=this.data,t=e.rect[2]-e.rect[0],r=e.rect[3]-e.rect[1],s=this.svgFactory.create(t,r)
let n=[]
for(const a of e.vertices){const t=a.x-e.rect[0],r=e.rect[3]-a.y
n.push(t+","+r)}n=n.join(" ")
const i=this.svgFactory.createElement(this.svgElementName)
return i.setAttribute("points",n),i.setAttribute("stroke-width",e.borderStyle.width||1),i.setAttribute("stroke","transparent"),i.setAttribute("fill","none"),s.appendChild(i),this.container.append(s),this._createPopup(this.container,i,e),this.container}}class S extends v{constructor(e){super(e),this.containerClassName="polygonAnnotation",this.svgElementName="svg:polygon"}}class x extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){return this.container.className="caretAnnotation",this.data.hasPopup||this._createPopup(this.container,null,this.data),this.container}}class C extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0),this.containerClassName="inkAnnotation",this.svgElementName="svg:polyline"}render(){this.container.className=this.containerClassName
const e=this.data,t=e.rect[2]-e.rect[0],r=e.rect[3]-e.rect[1],s=this.svgFactory.create(t,r)
for(const n of e.inkLists){let t=[]
for(const s of n){const r=s.x-e.rect[0],n=e.rect[3]-s.y
t.push(`${r},${n}`)}t=t.join(" ")
const r=this.svgFactory.createElement(this.svgElementName)
r.setAttribute("points",t),r.setAttribute("stroke-width",e.borderStyle.width||1),r.setAttribute("stroke","transparent"),r.setAttribute("fill","none"),this._createPopup(this.container,r,e),s.appendChild(r)}return this.container.append(s),this.container}}class P extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){return this.container.className="highlightAnnotation",this.data.hasPopup||this._createPopup(this.container,null,this.data),this.container}}class k extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){return this.container.className="underlineAnnotation",this.data.hasPopup||this._createPopup(this.container,null,this.data),this.container}}class R extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){return this.container.className="squigglyAnnotation",this.data.hasPopup||this._createPopup(this.container,null,this.data),this.container}}class w extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){return this.container.className="strikeoutAnnotation",this.data.hasPopup||this._createPopup(this.container,null,this.data),this.container}}class T extends a{constructor(e){super(e,!!(e.data.hasPopup||e.data.title||e.data.contents),!0)}render(){return this.container.className="stampAnnotation",this.data.hasPopup||this._createPopup(this.container,null,this.data),this.container}}class E extends a{constructor(e){super(e,!0)
const{filename:t,content:r}=this.data.file
this.filename=(0,s.getFilenameFromUrl)(t),this.content=r,this.linkService.eventBus&&this.linkService.eventBus.dispatch("fileattachmentannotation",{source:this,id:(0,n.stringToPDFString)(t),filename:t,content:r})}render(){this.container.className="fileAttachmentAnnotation"
const e=document.createElement("div")
return e.style.height=this.container.style.height,e.style.width=this.container.style.width,e.addEventListener("dblclick",this._download.bind(this)),this.data.hasPopup||!this.data.title&&!this.data.contents||this._createPopup(this.container,e,this.data),this.container.appendChild(e),this.container}_download(){this.downloadManager?this.downloadManager.downloadData(this.content,this.filename,""):(0,n.warn)("Download cannot be started due to unavailable download manager")}}t.AnnotationLayer=class{static render(e){const t=[],r=[]
for(const s of e.annotations)s&&(s.annotationType!==n.AnnotationType.POPUP?t.push(s):r.push(s))
r.length&&t.push(...r)
for(const n of t){const t=i.create({data:n,layer:e.div,page:e.page,viewport:e.viewport,linkService:e.linkService,downloadManager:e.downloadManager,imageResourcesPath:e.imageResourcesPath||"",renderInteractiveForms:e.renderInteractiveForms||!1,svgFactory:new s.DOMSVGFactory})
t.isRenderable&&e.div.appendChild(t.render())}}static update(e){for(const t of e.annotations){const r=e.div.querySelector(`[data-annotation-id="${t.id}"]`)
r&&(r.style.transform=`matrix(${e.viewport.transform.join(",")})`)}e.div.removeAttribute("hidden")}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.renderTextLayer=void 0
var s=r(2),n=function(){var e=/\S/
function t(t,r,n){var i,a=document.createElement("span"),o={angle:0,canvasWidth:0,isWhitespace:!1,originalTransform:null,paddingBottom:0,paddingLeft:0,paddingRight:0,paddingTop:0,scale:1}
if(t._textDivs.push(a),i=r.str,!e.test(i))return o.isWhitespace=!0,void t._textDivProperties.set(a,o)
var l=s.Util.transform(t._viewport.transform,r.transform),c=Math.atan2(l[1],l[0]),h=n[r.fontName]
h.vertical&&(c+=Math.PI/2)
var d=Math.sqrt(l[2]*l[2]+l[3]*l[3]),u=d
let p,g
h.ascent?u=h.ascent*u:h.descent&&(u=(1+h.descent)*u),0===c?(p=l[4],g=l[5]-u):(p=l[4]+u*Math.sin(c),g=l[5]-u*Math.cos(c)),a.style.left=p+"px",a.style.top=g+"px",a.style.fontSize=d+"px",a.style.fontFamily=h.fontFamily,a.textContent=r.str,t._fontInspectorEnabled&&(a.dataset.fontName=r.fontName),0!==c&&(o.angle=c*(180/Math.PI))
let f=!1
if(r.str.length>1)f=!0
else if(r.transform[0]!==r.transform[3]){const e=Math.abs(r.transform[0]),t=Math.abs(r.transform[3])
e!==t&&Math.max(e,t)/Math.min(e,t)>1.5&&(f=!0)}if(f&&(h.vertical?o.canvasWidth=r.height*t._viewport.scale:o.canvasWidth=r.width*t._viewport.scale),t._textDivProperties.set(a,o),t._textContentStream&&t._layoutText(a),t._enhanceTextSelection){var m=1,A=0
0!==c&&(m=Math.cos(c),A=Math.sin(c))
var b,_,y=(h.vertical?r.height:r.width)*t._viewport.scale,v=d
0!==c?(b=[m,A,-A,m,p,g],_=s.Util.getAxialAlignedBoundingBox([0,0,y,v],b)):_=[p,g,p+y,g+v],t._bounds.push({left:_[0],top:_[1],right:_[2],bottom:_[3],div:a,size:[y,v],m:b})}}function r(e){if(!e._canceled){var t=e._textDivs,r=e._capability,s=t.length
if(s>1e5)return e._renderingDone=!0,void r.resolve()
if(!e._textContentStream)for(var n=0;n<s;n++)e._layoutText(t[n])
e._renderingDone=!0,r.resolve()}}function n(e,t,r){let s=0
for(let n=0;n<r;n++){const r=e[t++]
r>0&&(s=s?Math.min(r,s):r)}return s}function i(e){for(var t=e._bounds,r=e._viewport,i=function(e,t,r){var s=r.map((function(e,t){return{x1:e.left,y1:e.top,x2:e.right,y2:e.bottom,index:t,x1New:void 0,x2New:void 0}}))
a(e,s)
var n=new Array(r.length)
return s.forEach((function(e){var t=e.index
n[t]={left:e.x1New,top:0,right:e.x2New,bottom:0}})),r.map((function(t,r){var i=n[r],a=s[r]
a.x1=t.top,a.y1=e-i.right,a.x2=t.bottom,a.y2=e-i.left,a.index=r,a.x1New=void 0,a.x2New=void 0})),a(t,s),s.forEach((function(e){var t=e.index
n[t].top=e.x1New,n[t].bottom=e.x2New})),n}(r.width,r.height,t),o=0;o<i.length;o++){var l=t[o].div,c=e._textDivProperties.get(l)
if(0!==c.angle){var h=i[o],d=t[o],u=d.m,p=u[0],g=u[1],f=[[0,0],[0,d.size[1]],[d.size[0],0],d.size],m=new Float64Array(64)
f.forEach((function(e,t){var r=s.Util.applyTransform(e,u)
m[t+0]=p&&(h.left-r[0])/p,m[t+4]=g&&(h.top-r[1])/g,m[t+8]=p&&(h.right-r[0])/p,m[t+12]=g&&(h.bottom-r[1])/g,m[t+16]=g&&(h.left-r[0])/-g,m[t+20]=p&&(h.top-r[1])/p,m[t+24]=g&&(h.right-r[0])/-g,m[t+28]=p&&(h.bottom-r[1])/p,m[t+32]=p&&(h.left-r[0])/-p,m[t+36]=g&&(h.top-r[1])/-g,m[t+40]=p&&(h.right-r[0])/-p,m[t+44]=g&&(h.bottom-r[1])/-g,m[t+48]=g&&(h.left-r[0])/g,m[t+52]=p&&(h.top-r[1])/-p,m[t+56]=g&&(h.right-r[0])/g,m[t+60]=p&&(h.bottom-r[1])/-p}))
var A=1+Math.min(Math.abs(p),Math.abs(g))
c.paddingLeft=n(m,32,16)/A,c.paddingTop=n(m,48,16)/A,c.paddingRight=n(m,0,16)/A,c.paddingBottom=n(m,16,16)/A,e._textDivProperties.set(l,c)}else c.paddingLeft=t[o].left-i[o].left,c.paddingTop=t[o].top-i[o].top,c.paddingRight=i[o].right-t[o].right,c.paddingBottom=i[o].bottom-t[o].bottom,e._textDivProperties.set(l,c)}}function a(e,t){t.sort((function(e,t){return e.x1-t.x1||e.index-t.index}))
var r=[{start:-1/0,end:1/0,boundary:{x1:-1/0,y1:-1/0,x2:0,y2:1/0,index:-1,x1New:0,x2New:0}}]
t.forEach((function(e){for(var t=0;t<r.length&&r[t].end<=e.y1;)t++
for(var s,n,i=r.length-1;i>=0&&r[i].start>=e.y2;)i--
var a,o,l=-1/0
for(a=t;a<=i;a++){var c;(c=(n=(s=r[a]).boundary).x2>e.x1?n.index>e.index?n.x1New:e.x1:void 0===n.x2New?(n.x2+e.x1)/2:n.x2New)>l&&(l=c)}for(e.x1New=l,a=t;a<=i;a++)void 0===(n=(s=r[a]).boundary).x2New?n.x2>e.x1?n.index>e.index&&(n.x2New=n.x2):n.x2New=l:n.x2New>l&&(n.x2New=Math.max(l,n.x2))
var h=[],d=null
for(a=t;a<=i;a++){var u=(n=(s=r[a]).boundary).x2>e.x2?n:e
d===u?h[h.length-1].end=s.end:(h.push({start:s.start,end:s.end,boundary:u}),d=u)}for(r[t].start<e.y1&&(h[0].start=e.y1,h.unshift({start:r[t].start,end:e.y1,boundary:r[t].boundary})),e.y2<r[i].end&&(h[h.length-1].end=e.y2,h.push({start:e.y2,end:r[i].end,boundary:r[i].boundary})),a=t;a<=i;a++)if(void 0===(n=(s=r[a]).boundary).x2New){var p=!1
for(o=t-1;!p&&o>=0&&r[o].start>=n.y1;o--)p=r[o].boundary===n
for(o=i+1;!p&&o<r.length&&r[o].end<=n.y2;o++)p=r[o].boundary===n
for(o=0;!p&&o<h.length;o++)p=h[o].boundary===n
p||(n.x2New=l)}Array.prototype.splice.apply(r,[t,i-t+1].concat(h))})),r.forEach((function(t){var r=t.boundary
void 0===r.x2New&&(r.x2New=Math.max(e,r.x2))}))}function o({textContent:e,textContentStream:t,container:r,viewport:n,textDivs:i,textContentItemsStr:a,enhanceTextSelection:o}){this._textContent=e,this._textContentStream=t,this._container=r,this._viewport=n,this._textDivs=i||[],this._textContentItemsStr=a||[],this._enhanceTextSelection=!!o,this._fontInspectorEnabled=!(!globalThis.FontInspector||!globalThis.FontInspector.enabled),this._reader=null,this._layoutTextLastFontSize=null,this._layoutTextLastFontFamily=null,this._layoutTextCtx=null,this._textDivProperties=new WeakMap,this._renderingDone=!1,this._canceled=!1,this._capability=(0,s.createPromiseCapability)(),this._renderTimer=null,this._bounds=[],this._capability.promise.finally((()=>{this._layoutTextCtx&&(this._layoutTextCtx.canvas.width=0,this._layoutTextCtx.canvas.height=0,this._layoutTextCtx=null)})).catch((()=>{}))}return o.prototype={get promise(){return this._capability.promise},cancel:function(){this._canceled=!0,this._reader&&(this._reader.cancel(new s.AbortException("TextLayer task cancelled.")),this._reader=null),null!==this._renderTimer&&(clearTimeout(this._renderTimer),this._renderTimer=null),this._capability.reject(new Error("TextLayer task cancelled."))},_processItems(e,r){for(let s=0,n=e.length;s<n;s++)this._textContentItemsStr.push(e[s].str),t(this,e[s],r)},_layoutText(e){const t=this._textDivProperties.get(e)
if(t.isWhitespace)return
let r=""
if(0!==t.canvasWidth){const{fontSize:s,fontFamily:n}=e.style
s===this._layoutTextLastFontSize&&n===this._layoutTextLastFontFamily||(this._layoutTextCtx.font=`${s} ${n}`,this._layoutTextLastFontSize=s,this._layoutTextLastFontFamily=n)
const{width:i}=this._layoutTextCtx.measureText(e.textContent)
i>0&&(t.scale=t.canvasWidth/i,r=`scaleX(${t.scale})`)}0!==t.angle&&(r=`rotate(${t.angle}deg) ${r}`),r.length>0&&(this._enhanceTextSelection&&(t.originalTransform=r),e.style.transform=r),this._textDivProperties.set(e,t),this._container.appendChild(e)},_render:function(e){const t=(0,s.createPromiseCapability)()
let n=Object.create(null)
const i=document.createElement("canvas")
if(i.mozOpaque=!0,this._layoutTextCtx=i.getContext("2d",{alpha:!1}),this._textContent){const e=this._textContent.items,r=this._textContent.styles
this._processItems(e,r),t.resolve()}else{if(!this._textContentStream)throw new Error('Neither "textContent" nor "textContentStream" parameters specified.')
{const e=()=>{this._reader.read().then((({value:r,done:s})=>{s?t.resolve():(Object.assign(n,r.styles),this._processItems(r.items,n),e())}),t.reject)}
this._reader=this._textContentStream.getReader(),e()}}t.promise.then((()=>{n=null,e?this._renderTimer=setTimeout((()=>{r(this),this._renderTimer=null}),e):r(this)}),this._capability.reject)},expandTextDivs:function(e){if(!this._enhanceTextSelection||!this._renderingDone)return
null!==this._bounds&&(i(this),this._bounds=null)
const t=[],r=[]
for(var s=0,n=this._textDivs.length;s<n;s++){const n=this._textDivs[s],i=this._textDivProperties.get(n)
i.isWhitespace||(e?(t.length=0,r.length=0,i.originalTransform&&t.push(i.originalTransform),i.paddingTop>0?(r.push(i.paddingTop+"px"),t.push(`translateY(${-i.paddingTop}px)`)):r.push(0),i.paddingRight>0?r.push(i.paddingRight/i.scale+"px"):r.push(0),i.paddingBottom>0?r.push(i.paddingBottom+"px"):r.push(0),i.paddingLeft>0?(r.push(i.paddingLeft/i.scale+"px"),t.push(`translateX(${-i.paddingLeft/i.scale}px)`)):r.push(0),n.style.padding=r.join(" "),t.length&&(n.style.transform=t.join(" "))):(n.style.padding=null,n.style.transform=i.originalTransform))}}},function(e){var t=new o({textContent:e.textContent,textContentStream:e.textContentStream,container:e.container,viewport:e.viewport,textDivs:e.textDivs,textContentItemsStr:e.textContentItemsStr,enhanceTextSelection:e.enhanceTextSelection})
return t._render(e.timeout),t}}()
t.renderTextLayer=n},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.SVGGraphics=void 0
var s=r(2),n=r(1),i=r(4)
let a=function(){throw new Error("Not implemented: SVGGraphics")}
t.SVGGraphics=a
{const e={fontStyle:"normal",fontWeight:"normal",fillColor:"#000000"},r="http://www.w3.org/XML/1998/namespace",c="http://www.w3.org/1999/xlink",h=["butt","round","square"],d=["miter","round","bevel"],u=function(){const e=new Uint8Array([137,80,78,71,13,10,26,10]),t=new Int32Array(256)
for(let s=0;s<256;s++){let e=s
for(let t=0;t<8;t++)e=1&e?3988292384^e>>1&2147483647:e>>1&2147483647
t[s]=e}function r(e,r,s,n){let i=n
const a=r.length
s[i]=a>>24&255,s[i+1]=a>>16&255,s[i+2]=a>>8&255,s[i+3]=255&a,i+=4,s[i]=255&e.charCodeAt(0),s[i+1]=255&e.charCodeAt(1),s[i+2]=255&e.charCodeAt(2),s[i+3]=255&e.charCodeAt(3),i+=4,s.set(r,i),i+=r.length
const o=function(e,r,s){let n=-1
for(let i=r;i<s;i++){const r=255&(n^e[i])
n=n>>>8^t[r]}return-1^n}(s,n+4,i)
s[i]=o>>24&255,s[i+1]=o>>16&255,s[i+2]=o>>8&255,s[i+3]=255&o}function n(e){let t=e.length
const r=65535,s=Math.ceil(t/r),n=new Uint8Array(2+t+5*s+4)
let i=0
n[i++]=120,n[i++]=156
let a=0
for(;t>r;)n[i++]=0,n[i++]=255,n[i++]=255,n[i++]=0,n[i++]=0,n.set(e.subarray(a,a+r),i),i+=r,a+=r,t-=r
n[i++]=1,n[i++]=255&t,n[i++]=t>>8&255,n[i++]=255&~t,n[i++]=(65535&~t)>>8&255,n.set(e.subarray(a),i),i+=e.length-a
const o=function(e,t,r){let s=1,n=0
for(let i=t;i<r;++i)s=(s+(255&e[i]))%65521,n=(n+s)%65521
return n<<16|s}(e,0,e.length)
return n[i++]=o>>24&255,n[i++]=o>>16&255,n[i++]=o>>8&255,n[i++]=255&o,n}function a(t,a,o,l){const c=t.width,h=t.height
let d,u,p
const g=t.data
switch(a){case s.ImageKind.GRAYSCALE_1BPP:u=0,d=1,p=c+7>>3
break
case s.ImageKind.RGB_24BPP:u=2,d=8,p=3*c
break
case s.ImageKind.RGBA_32BPP:u=6,d=8,p=4*c
break
default:throw new Error("invalid format")}const f=new Uint8Array((1+p)*h)
let m=0,A=0
for(let e=0;e<h;++e)f[m++]=0,f.set(g.subarray(A,A+p),m),A+=p,m+=p
if(a===s.ImageKind.GRAYSCALE_1BPP&&l){m=0
for(let e=0;e<h;e++){m++
for(let e=0;e<p;e++)f[m++]^=255}}const b=new Uint8Array([c>>24&255,c>>16&255,c>>8&255,255&c,h>>24&255,h>>16&255,h>>8&255,255&h,d,u,0,0,0]),_=function(e){if(!i.isNodeJS)return n(e)
try{let t
t=parseInt(process.versions.node)>=8?e:Buffer.from(e)
const r=require("zlib").deflateSync(t,{level:9})
return r instanceof Uint8Array?r:new Uint8Array(r)}catch(t){(0,s.warn)("Not compressing PNG because zlib.deflateSync is unavailable: "+t)}return n(e)}(f),y=e.length+36+b.length+_.length,v=new Uint8Array(y)
let S=0
return v.set(e,S),S+=e.length,r("IHDR",b,v,S),S+=12+b.length,r("IDATA",_,v,S),S+=12+_.length,r("IEND",new Uint8Array(0),v,S),(0,s.createObjectURL)(v,"image/png",o)}return function(e,t,r){return a(e,void 0===e.kind?s.ImageKind.GRAYSCALE_1BPP:e.kind,t,r)}}()
class p{constructor(){this.fontSizeScale=1,this.fontWeight=e.fontWeight,this.fontSize=0,this.textMatrix=s.IDENTITY_MATRIX,this.fontMatrix=s.FONT_IDENTITY_MATRIX,this.leading=0,this.textRenderingMode=s.TextRenderingMode.FILL,this.textMatrixScale=1,this.x=0,this.y=0,this.lineX=0,this.lineY=0,this.charSpacing=0,this.wordSpacing=0,this.textHScale=1,this.textRise=0,this.fillColor=e.fillColor,this.strokeColor="#000000",this.fillAlpha=1,this.strokeAlpha=1,this.lineWidth=1,this.lineJoin="",this.lineCap="",this.miterLimit=0,this.dashArray=[],this.dashPhase=0,this.dependencies=[],this.activeClipUrl=null,this.clipGroup=null,this.maskId=""}clone(){return Object.create(this)}setCurrentPoint(e,t){this.x=e,this.y=t}}function o(e){if(Number.isInteger(e))return e.toString()
const t=e.toFixed(10)
let r=t.length-1
if("0"!==t[r])return t
do{r--}while("0"===t[r])
return t.substring(0,"."===t[r]?r:r+1)}function l(e){if(0===e[4]&&0===e[5]){if(0===e[1]&&0===e[2])return 1===e[0]&&1===e[3]?"":`scale(${o(e[0])} ${o(e[3])})`
if(e[0]===e[3]&&e[1]===-e[2]){return`rotate(${o(180*Math.acos(e[0])/Math.PI)})`}}else if(1===e[0]&&0===e[1]&&0===e[2]&&1===e[3])return`translate(${o(e[4])} ${o(e[5])})`
return`matrix(${o(e[0])} ${o(e[1])} ${o(e[2])} ${o(e[3])} ${o(e[4])} `+o(e[5])+")"}let g=0,f=0,m=0
t.SVGGraphics=a=class{constructor(e,t,r=!1){this.svgFactory=new n.DOMSVGFactory,this.current=new p,this.transformMatrix=s.IDENTITY_MATRIX,this.transformStack=[],this.extraStack=[],this.commonObjs=e,this.objs=t,this.pendingClip=null,this.pendingEOFill=!1,this.embedFonts=!1,this.embeddedFonts=Object.create(null),this.cssStyle=null,this.forceDataSchema=!!r,this._operatorIdMapping=[]
for(const n in s.OPS)this._operatorIdMapping[s.OPS[n]]=n}save(){this.transformStack.push(this.transformMatrix)
const e=this.current
this.extraStack.push(e),this.current=e.clone()}restore(){this.transformMatrix=this.transformStack.pop(),this.current=this.extraStack.pop(),this.pendingClip=null,this.tgrp=null}group(e){this.save(),this.executeOpTree(e),this.restore()}loadDependencies(e){const t=e.fnArray,r=e.argsArray
for(let n=0,i=t.length;n<i;n++)if(t[n]===s.OPS.dependency)for(const e of r[n]){const t=e.startsWith("g_")?this.commonObjs:this.objs,r=new Promise((r=>{t.get(e,r)}))
this.current.dependencies.push(r)}return Promise.all(this.current.dependencies)}transform(e,t,r,n,i,a){const o=[e,t,r,n,i,a]
this.transformMatrix=s.Util.transform(this.transformMatrix,o),this.tgrp=null}getSVG(e,t){this.viewport=t
const r=this._initialize(t)
return this.loadDependencies(e).then((()=>(this.transformMatrix=s.IDENTITY_MATRIX,this.executeOpTree(this.convertOpList(e)),r)))}convertOpList(e){const t=this._operatorIdMapping,r=e.argsArray,s=e.fnArray,n=[]
for(let i=0,a=s.length;i<a;i++){const e=s[i]
n.push({fnId:e,fn:t[e],args:r[i]})}return function(e){let t=[]
const r=[]
for(const s of e)"save"!==s.fn?"restore"===s.fn?t=r.pop():t.push(s):(t.push({fnId:92,fn:"group",items:[]}),r.push(t),t=t[t.length-1].items)
return t}(n)}executeOpTree(e){for(const t of e){const e=t.fn,r=t.fnId,n=t.args
switch(0|r){case s.OPS.beginText:this.beginText()
break
case s.OPS.dependency:break
case s.OPS.setLeading:this.setLeading(n)
break
case s.OPS.setLeadingMoveText:this.setLeadingMoveText(n[0],n[1])
break
case s.OPS.setFont:this.setFont(n)
break
case s.OPS.showText:case s.OPS.showSpacedText:this.showText(n[0])
break
case s.OPS.endText:this.endText()
break
case s.OPS.moveText:this.moveText(n[0],n[1])
break
case s.OPS.setCharSpacing:this.setCharSpacing(n[0])
break
case s.OPS.setWordSpacing:this.setWordSpacing(n[0])
break
case s.OPS.setHScale:this.setHScale(n[0])
break
case s.OPS.setTextMatrix:this.setTextMatrix(n[0],n[1],n[2],n[3],n[4],n[5])
break
case s.OPS.setTextRise:this.setTextRise(n[0])
break
case s.OPS.setTextRenderingMode:this.setTextRenderingMode(n[0])
break
case s.OPS.setLineWidth:this.setLineWidth(n[0])
break
case s.OPS.setLineJoin:this.setLineJoin(n[0])
break
case s.OPS.setLineCap:this.setLineCap(n[0])
break
case s.OPS.setMiterLimit:this.setMiterLimit(n[0])
break
case s.OPS.setFillRGBColor:this.setFillRGBColor(n[0],n[1],n[2])
break
case s.OPS.setStrokeRGBColor:this.setStrokeRGBColor(n[0],n[1],n[2])
break
case s.OPS.setStrokeColorN:this.setStrokeColorN(n)
break
case s.OPS.setFillColorN:this.setFillColorN(n)
break
case s.OPS.shadingFill:this.shadingFill(n[0])
break
case s.OPS.setDash:this.setDash(n[0],n[1])
break
case s.OPS.setRenderingIntent:this.setRenderingIntent(n[0])
break
case s.OPS.setFlatness:this.setFlatness(n[0])
break
case s.OPS.setGState:this.setGState(n[0])
break
case s.OPS.fill:this.fill()
break
case s.OPS.eoFill:this.eoFill()
break
case s.OPS.stroke:this.stroke()
break
case s.OPS.fillStroke:this.fillStroke()
break
case s.OPS.eoFillStroke:this.eoFillStroke()
break
case s.OPS.clip:this.clip("nonzero")
break
case s.OPS.eoClip:this.clip("evenodd")
break
case s.OPS.paintSolidColorImageMask:this.paintSolidColorImageMask()
break
case s.OPS.paintImageXObject:this.paintImageXObject(n[0])
break
case s.OPS.paintInlineImageXObject:this.paintInlineImageXObject(n[0])
break
case s.OPS.paintImageMaskXObject:this.paintImageMaskXObject(n[0])
break
case s.OPS.paintFormXObjectBegin:this.paintFormXObjectBegin(n[0],n[1])
break
case s.OPS.paintFormXObjectEnd:this.paintFormXObjectEnd()
break
case s.OPS.closePath:this.closePath()
break
case s.OPS.closeStroke:this.closeStroke()
break
case s.OPS.closeFillStroke:this.closeFillStroke()
break
case s.OPS.closeEOFillStroke:this.closeEOFillStroke()
break
case s.OPS.nextLine:this.nextLine()
break
case s.OPS.transform:this.transform(n[0],n[1],n[2],n[3],n[4],n[5])
break
case s.OPS.constructPath:this.constructPath(n[0],n[1])
break
case s.OPS.endPath:this.endPath()
break
case 92:this.group(t.items)
break
default:(0,s.warn)("Unimplemented operator "+e)}}}setWordSpacing(e){this.current.wordSpacing=e}setCharSpacing(e){this.current.charSpacing=e}nextLine(){this.moveText(0,this.current.leading)}setTextMatrix(e,t,r,s,n,i){const a=this.current
a.textMatrix=a.lineMatrix=[e,t,r,s,n,i],a.textMatrixScale=Math.sqrt(e*e+t*t),a.x=a.lineX=0,a.y=a.lineY=0,a.xcoords=[],a.ycoords=[],a.tspan=this.svgFactory.createElement("svg:tspan"),a.tspan.setAttributeNS(null,"font-family",a.fontFamily),a.tspan.setAttributeNS(null,"font-size",o(a.fontSize)+"px"),a.tspan.setAttributeNS(null,"y",o(-a.y)),a.txtElement=this.svgFactory.createElement("svg:text"),a.txtElement.appendChild(a.tspan)}beginText(){const e=this.current
e.x=e.lineX=0,e.y=e.lineY=0,e.textMatrix=s.IDENTITY_MATRIX,e.lineMatrix=s.IDENTITY_MATRIX,e.textMatrixScale=1,e.tspan=this.svgFactory.createElement("svg:tspan"),e.txtElement=this.svgFactory.createElement("svg:text"),e.txtgrp=this.svgFactory.createElement("svg:g"),e.xcoords=[],e.ycoords=[]}moveText(e,t){const r=this.current
r.x=r.lineX+=e,r.y=r.lineY+=t,r.xcoords=[],r.ycoords=[],r.tspan=this.svgFactory.createElement("svg:tspan"),r.tspan.setAttributeNS(null,"font-family",r.fontFamily),r.tspan.setAttributeNS(null,"font-size",o(r.fontSize)+"px"),r.tspan.setAttributeNS(null,"y",o(-r.y))}showText(t){const n=this.current,i=n.font,a=n.fontSize
if(0===a)return
const c=n.fontSizeScale,h=n.charSpacing,d=n.wordSpacing,u=n.fontDirection,p=n.textHScale*u,g=i.vertical,f=g?1:-1,m=i.defaultVMetrics,A=a*n.fontMatrix[0]
let b=0
for(const e of t){if(null===e){b+=u*d
continue}if((0,s.isNum)(e)){b+=f*e*a/1e3
continue}const t=(e.isSpace?d:0)+h,r=e.fontChar
let o,l,p,_=e.width
if(g){let t
const r=e.vmetric||m
t=e.vmetric?r[1]:.5*_,t=-t*A
const s=r[2]*A
_=r?-r[0]:_,o=t/c,l=(b+s)/c}else o=b/c,l=0;(e.isInFont||i.missingFile)&&(n.xcoords.push(n.x+o),g&&n.ycoords.push(-n.y+l),n.tspan.textContent+=r),p=g?_*A-t*u:_*A+t*u,b+=p}n.tspan.setAttributeNS(null,"x",n.xcoords.map(o).join(" ")),g?n.tspan.setAttributeNS(null,"y",n.ycoords.map(o).join(" ")):n.tspan.setAttributeNS(null,"y",o(-n.y)),g?n.y-=b:n.x+=b*p,n.tspan.setAttributeNS(null,"font-family",n.fontFamily),n.tspan.setAttributeNS(null,"font-size",o(n.fontSize)+"px"),n.fontStyle!==e.fontStyle&&n.tspan.setAttributeNS(null,"font-style",n.fontStyle),n.fontWeight!==e.fontWeight&&n.tspan.setAttributeNS(null,"font-weight",n.fontWeight)
const _=n.textRenderingMode&s.TextRenderingMode.FILL_STROKE_MASK
if(_===s.TextRenderingMode.FILL||_===s.TextRenderingMode.FILL_STROKE?(n.fillColor!==e.fillColor&&n.tspan.setAttributeNS(null,"fill",n.fillColor),n.fillAlpha<1&&n.tspan.setAttributeNS(null,"fill-opacity",n.fillAlpha)):n.textRenderingMode===s.TextRenderingMode.ADD_TO_PATH?n.tspan.setAttributeNS(null,"fill","transparent"):n.tspan.setAttributeNS(null,"fill","none"),_===s.TextRenderingMode.STROKE||_===s.TextRenderingMode.FILL_STROKE){const e=1/(n.textMatrixScale||1)
this._setStrokeAttributes(n.tspan,e)}let y=n.textMatrix
0!==n.textRise&&(y=y.slice(),y[5]+=n.textRise),n.txtElement.setAttributeNS(null,"transform",`${l(y)} scale(${o(p)}, -1)`),n.txtElement.setAttributeNS(r,"xml:space","preserve"),n.txtElement.appendChild(n.tspan),n.txtgrp.appendChild(n.txtElement),this._ensureTransformGroup().appendChild(n.txtElement)}setLeadingMoveText(e,t){this.setLeading(-t),this.moveText(e,t)}addFontStyle(e){if(!e.data)throw new Error('addFontStyle: No font data available, ensure that the "fontExtraProperties" API parameter is set.')
this.cssStyle||(this.cssStyle=this.svgFactory.createElement("svg:style"),this.cssStyle.setAttributeNS(null,"type","text/css"),this.defs.appendChild(this.cssStyle))
const t=(0,s.createObjectURL)(e.data,e.mimetype,this.forceDataSchema)
this.cssStyle.textContent+=`@font-face { font-family: "${e.loadedName}"; src: url(${t}); }\n`}setFont(e){const t=this.current,r=this.commonObjs.get(e[0])
let n=e[1]
t.font=r,!this.embedFonts||r.missingFile||this.embeddedFonts[r.loadedName]||(this.addFontStyle(r),this.embeddedFonts[r.loadedName]=r),t.fontMatrix=r.fontMatrix?r.fontMatrix:s.FONT_IDENTITY_MATRIX
let i="normal"
r.black?i="900":r.bold&&(i="bold")
const a=r.italic?"italic":"normal"
n<0?(n=-n,t.fontDirection=-1):t.fontDirection=1,t.fontSize=n,t.fontFamily=r.loadedName,t.fontWeight=i,t.fontStyle=a,t.tspan=this.svgFactory.createElement("svg:tspan"),t.tspan.setAttributeNS(null,"y",o(-t.y)),t.xcoords=[],t.ycoords=[]}endText(){const e=this.current
e.textRenderingMode&s.TextRenderingMode.ADD_TO_PATH_FLAG&&e.txtElement&&e.txtElement.hasChildNodes()&&(e.element=e.txtElement,this.clip("nonzero"),this.endPath())}setLineWidth(e){e>0&&(this.current.lineWidth=e)}setLineCap(e){this.current.lineCap=h[e]}setLineJoin(e){this.current.lineJoin=d[e]}setMiterLimit(e){this.current.miterLimit=e}setStrokeAlpha(e){this.current.strokeAlpha=e}setStrokeRGBColor(e,t,r){this.current.strokeColor=s.Util.makeCssRgb(e,t,r)}setFillAlpha(e){this.current.fillAlpha=e}setFillRGBColor(e,t,r){this.current.fillColor=s.Util.makeCssRgb(e,t,r),this.current.tspan=this.svgFactory.createElement("svg:tspan"),this.current.xcoords=[],this.current.ycoords=[]}setStrokeColorN(e){this.current.strokeColor=this._makeColorN_Pattern(e)}setFillColorN(e){this.current.fillColor=this._makeColorN_Pattern(e)}shadingFill(e){const t=this.viewport.width,r=this.viewport.height,n=s.Util.inverseTransform(this.transformMatrix),i=s.Util.applyTransform([0,0],n),a=s.Util.applyTransform([0,r],n),o=s.Util.applyTransform([t,0],n),l=s.Util.applyTransform([t,r],n),c=Math.min(i[0],a[0],o[0],l[0]),h=Math.min(i[1],a[1],o[1],l[1]),d=Math.max(i[0],a[0],o[0],l[0]),u=Math.max(i[1],a[1],o[1],l[1]),p=this.svgFactory.createElement("svg:rect")
p.setAttributeNS(null,"x",c),p.setAttributeNS(null,"y",h),p.setAttributeNS(null,"width",d-c),p.setAttributeNS(null,"height",u-h),p.setAttributeNS(null,"fill",this._makeShadingPattern(e)),this.current.fillAlpha<1&&p.setAttributeNS(null,"fill-opacity",this.current.fillAlpha),this._ensureTransformGroup().appendChild(p)}_makeColorN_Pattern(e){return"TilingPattern"===e[0]?this._makeTilingPattern(e):this._makeShadingPattern(e)}_makeTilingPattern(e){const t=e[1],r=e[2],n=e[3]||s.IDENTITY_MATRIX,[i,a,o,l]=e[4],c=e[5],h=e[6],d=e[7],u="shading"+m++,[p,g]=s.Util.applyTransform([i,a],n),[f,A]=s.Util.applyTransform([o,l],n),[b,_]=s.Util.singularValueDecompose2dScale(n),y=c*b,v=h*_,S=this.svgFactory.createElement("svg:pattern")
S.setAttributeNS(null,"id",u),S.setAttributeNS(null,"patternUnits","userSpaceOnUse"),S.setAttributeNS(null,"width",y),S.setAttributeNS(null,"height",v),S.setAttributeNS(null,"x",""+p),S.setAttributeNS(null,"y",""+g)
const x=this.svg,C=this.transformMatrix,P=this.current.fillColor,k=this.current.strokeColor,R=this.svgFactory.create(f-p,A-g)
if(this.svg=R,this.transformMatrix=n,2===d){const e=s.Util.makeCssRgb(...t)
this.current.fillColor=e,this.current.strokeColor=e}return this.executeOpTree(this.convertOpList(r)),this.svg=x,this.transformMatrix=C,this.current.fillColor=P,this.current.strokeColor=k,S.appendChild(R.childNodes[0]),this.defs.appendChild(S),`url(#${u})`}_makeShadingPattern(e){switch(e[0]){case"RadialAxial":const t="shading"+m++,r=e[3]
let n
switch(e[1]){case"axial":const r=e[4],s=e[5]
n=this.svgFactory.createElement("svg:linearGradient"),n.setAttributeNS(null,"id",t),n.setAttributeNS(null,"gradientUnits","userSpaceOnUse"),n.setAttributeNS(null,"x1",r[0]),n.setAttributeNS(null,"y1",r[1]),n.setAttributeNS(null,"x2",s[0]),n.setAttributeNS(null,"y2",s[1])
break
case"radial":const i=e[4],a=e[5],o=e[6],l=e[7]
n=this.svgFactory.createElement("svg:radialGradient"),n.setAttributeNS(null,"id",t),n.setAttributeNS(null,"gradientUnits","userSpaceOnUse"),n.setAttributeNS(null,"cx",a[0]),n.setAttributeNS(null,"cy",a[1]),n.setAttributeNS(null,"r",l),n.setAttributeNS(null,"fx",i[0]),n.setAttributeNS(null,"fy",i[1]),n.setAttributeNS(null,"fr",o)
break
default:throw new Error("Unknown RadialAxial type: "+e[1])}for(const e of r){const t=this.svgFactory.createElement("svg:stop")
t.setAttributeNS(null,"offset",e[0]),t.setAttributeNS(null,"stop-color",e[1]),n.appendChild(t)}return this.defs.appendChild(n),`url(#${t})`
case"Mesh":return(0,s.warn)("Unimplemented pattern Mesh"),null
case"Dummy":return"hotpink"
default:throw new Error("Unknown IR type: "+e[0])}}setDash(e,t){this.current.dashArray=e,this.current.dashPhase=t}constructPath(e,t){const r=this.current
let n=r.x,i=r.y,a=[],l=0
for(const c of e)switch(0|c){case s.OPS.rectangle:n=t[l++],i=t[l++]
const e=n+t[l++],r=i+t[l++]
a.push("M",o(n),o(i),"L",o(e),o(i),"L",o(e),o(r),"L",o(n),o(r),"Z")
break
case s.OPS.moveTo:n=t[l++],i=t[l++],a.push("M",o(n),o(i))
break
case s.OPS.lineTo:n=t[l++],i=t[l++],a.push("L",o(n),o(i))
break
case s.OPS.curveTo:n=t[l+4],i=t[l+5],a.push("C",o(t[l]),o(t[l+1]),o(t[l+2]),o(t[l+3]),o(n),o(i)),l+=6
break
case s.OPS.curveTo2:a.push("C",o(n),o(i),o(t[l]),o(t[l+1]),o(t[l+2]),o(t[l+3])),n=t[l+2],i=t[l+3],l+=4
break
case s.OPS.curveTo3:n=t[l+2],i=t[l+3],a.push("C",o(t[l]),o(t[l+1]),o(n),o(i),o(n),o(i)),l+=4
break
case s.OPS.closePath:a.push("Z")}a=a.join(" "),r.path&&e.length>0&&e[0]!==s.OPS.rectangle&&e[0]!==s.OPS.moveTo?a=r.path.getAttributeNS(null,"d")+a:(r.path=this.svgFactory.createElement("svg:path"),this._ensureTransformGroup().appendChild(r.path)),r.path.setAttributeNS(null,"d",a),r.path.setAttributeNS(null,"fill","none"),r.element=r.path,r.setCurrentPoint(n,i)}endPath(){const e=this.current
if(e.path=null,!this.pendingClip)return
if(!e.element)return void(this.pendingClip=null)
const t="clippath"+g++,r=this.svgFactory.createElement("svg:clipPath")
r.setAttributeNS(null,"id",t),r.setAttributeNS(null,"transform",l(this.transformMatrix))
const s=e.element.cloneNode(!0)
"evenodd"===this.pendingClip?s.setAttributeNS(null,"clip-rule","evenodd"):s.setAttributeNS(null,"clip-rule","nonzero"),this.pendingClip=null,r.appendChild(s),this.defs.appendChild(r),e.activeClipUrl&&(e.clipGroup=null,this.extraStack.forEach((function(e){e.clipGroup=null})),r.setAttributeNS(null,"clip-path",e.activeClipUrl)),e.activeClipUrl=`url(#${t})`,this.tgrp=null}clip(e){this.pendingClip=e}closePath(){const e=this.current
if(e.path){const t=e.path.getAttributeNS(null,"d")+"Z"
e.path.setAttributeNS(null,"d",t)}}setLeading(e){this.current.leading=-e}setTextRise(e){this.current.textRise=e}setTextRenderingMode(e){this.current.textRenderingMode=e}setHScale(e){this.current.textHScale=e/100}setRenderingIntent(e){}setFlatness(e){}setGState(e){for(const[t,r]of e)switch(t){case"LW":this.setLineWidth(r)
break
case"LC":this.setLineCap(r)
break
case"LJ":this.setLineJoin(r)
break
case"ML":this.setMiterLimit(r)
break
case"D":this.setDash(r[0],r[1])
break
case"RI":this.setRenderingIntent(r)
break
case"FL":this.setFlatness(r)
break
case"Font":this.setFont(r)
break
case"CA":this.setStrokeAlpha(r)
break
case"ca":this.setFillAlpha(r)
break
default:(0,s.warn)("Unimplemented graphic state operator "+t)}}fill(){const e=this.current
e.element&&(e.element.setAttributeNS(null,"fill",e.fillColor),e.element.setAttributeNS(null,"fill-opacity",e.fillAlpha),this.endPath())}stroke(){const e=this.current
e.element&&(this._setStrokeAttributes(e.element),e.element.setAttributeNS(null,"fill","none"),this.endPath())}_setStrokeAttributes(e,t=1){const r=this.current
let s=r.dashArray
1!==t&&s.length>0&&(s=s.map((function(e){return t*e}))),e.setAttributeNS(null,"stroke",r.strokeColor),e.setAttributeNS(null,"stroke-opacity",r.strokeAlpha),e.setAttributeNS(null,"stroke-miterlimit",o(r.miterLimit)),e.setAttributeNS(null,"stroke-linecap",r.lineCap),e.setAttributeNS(null,"stroke-linejoin",r.lineJoin),e.setAttributeNS(null,"stroke-width",o(t*r.lineWidth)+"px"),e.setAttributeNS(null,"stroke-dasharray",s.map(o).join(" ")),e.setAttributeNS(null,"stroke-dashoffset",o(t*r.dashPhase)+"px")}eoFill(){this.current.element&&this.current.element.setAttributeNS(null,"fill-rule","evenodd"),this.fill()}fillStroke(){this.stroke(),this.fill()}eoFillStroke(){this.current.element&&this.current.element.setAttributeNS(null,"fill-rule","evenodd"),this.fillStroke()}closeStroke(){this.closePath(),this.stroke()}closeFillStroke(){this.closePath(),this.fillStroke()}closeEOFillStroke(){this.closePath(),this.eoFillStroke()}paintSolidColorImageMask(){const e=this.svgFactory.createElement("svg:rect")
e.setAttributeNS(null,"x","0"),e.setAttributeNS(null,"y","0"),e.setAttributeNS(null,"width","1px"),e.setAttributeNS(null,"height","1px"),e.setAttributeNS(null,"fill",this.current.fillColor),this._ensureTransformGroup().appendChild(e)}paintImageXObject(e){const t=this.objs.get(e)
t?this.paintInlineImageXObject(t):(0,s.warn)(`Dependent image with object ID ${e} is not ready yet`)}paintInlineImageXObject(e,t){const r=e.width,s=e.height,n=u(e,this.forceDataSchema,!!t),i=this.svgFactory.createElement("svg:rect")
i.setAttributeNS(null,"x","0"),i.setAttributeNS(null,"y","0"),i.setAttributeNS(null,"width",o(r)),i.setAttributeNS(null,"height",o(s)),this.current.element=i,this.clip("nonzero")
const a=this.svgFactory.createElement("svg:image")
a.setAttributeNS(c,"xlink:href",n),a.setAttributeNS(null,"x","0"),a.setAttributeNS(null,"y",o(-s)),a.setAttributeNS(null,"width",o(r)+"px"),a.setAttributeNS(null,"height",o(s)+"px"),a.setAttributeNS(null,"transform",`scale(${o(1/r)} ${o(-1/s)})`),t?t.appendChild(a):this._ensureTransformGroup().appendChild(a)}paintImageMaskXObject(e){const t=this.current,r=e.width,s=e.height,n=t.fillColor
t.maskId="mask"+f++
const i=this.svgFactory.createElement("svg:mask")
i.setAttributeNS(null,"id",t.maskId)
const a=this.svgFactory.createElement("svg:rect")
a.setAttributeNS(null,"x","0"),a.setAttributeNS(null,"y","0"),a.setAttributeNS(null,"width",o(r)),a.setAttributeNS(null,"height",o(s)),a.setAttributeNS(null,"fill",n),a.setAttributeNS(null,"mask",`url(#${t.maskId})`),this.defs.appendChild(i),this._ensureTransformGroup().appendChild(a),this.paintInlineImageXObject(e,i)}paintFormXObjectBegin(e,t){if(Array.isArray(e)&&6===e.length&&this.transform(e[0],e[1],e[2],e[3],e[4],e[5]),t){const e=t[2]-t[0],r=t[3]-t[1],s=this.svgFactory.createElement("svg:rect")
s.setAttributeNS(null,"x",t[0]),s.setAttributeNS(null,"y",t[1]),s.setAttributeNS(null,"width",o(e)),s.setAttributeNS(null,"height",o(r)),this.current.element=s,this.clip("nonzero"),this.endPath()}}paintFormXObjectEnd(){}_initialize(e){const t=this.svgFactory.create(e.width,e.height),r=this.svgFactory.createElement("svg:defs")
t.appendChild(r),this.defs=r
const s=this.svgFactory.createElement("svg:g")
return s.setAttributeNS(null,"transform",l(e.transform)),t.appendChild(s),this.svg=s,t}_ensureClipGroup(){if(!this.current.clipGroup){const e=this.svgFactory.createElement("svg:g")
e.setAttributeNS(null,"clip-path",this.current.activeClipUrl),this.svg.appendChild(e),this.current.clipGroup=e}return this.current.clipGroup}_ensureTransformGroup(){return this.tgrp||(this.tgrp=this.svgFactory.createElement("svg:g"),this.tgrp.setAttributeNS(null,"transform",l(this.transformMatrix)),this.current.activeClipUrl?this._ensureClipGroup().appendChild(this.tgrp):this.svg.appendChild(this.tgrp)),this.tgrp}}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.PDFNodeStream=void 0
var s=r(2),n=r(20)
const i=require("fs"),a=require("http"),o=require("https"),l=require("url"),c=/^file:\/\/\/[a-zA-Z]:\//
t.PDFNodeStream=class{constructor(e){this.source=e,this.url=function(e){const t=l.parse(e)
return"file:"===t.protocol||t.host?t:/^[a-z]:[/\\]/i.test(e)?l.parse("file:///"+e):(t.host||(t.protocol="file:"),t)}(e.url),this.isHttp="http:"===this.url.protocol||"https:"===this.url.protocol,this.isFsUrl="file:"===this.url.protocol,this.httpHeaders=this.isHttp&&e.httpHeaders||{},this._fullRequestReader=null,this._rangeRequestReaders=[]}get _progressiveDataLength(){return this._fullRequestReader?this._fullRequestReader._loaded:0}getFullReader(){return(0,s.assert)(!this._fullRequestReader,"PDFNodeStream.getFullReader can only be called once."),this._fullRequestReader=this.isFsUrl?new f(this):new p(this),this._fullRequestReader}getRangeReader(e,t){if(t<=this._progressiveDataLength)return null
const r=this.isFsUrl?new m(this,e,t):new g(this,e,t)
return this._rangeRequestReaders.push(r),r}cancelAllRequests(e){this._fullRequestReader&&this._fullRequestReader.cancel(e)
this._rangeRequestReaders.slice(0).forEach((function(t){t.cancel(e)}))}}
class h{constructor(e){this._url=e.url,this._done=!1,this._storedError=null,this.onProgress=null
const t=e.source
this._contentLength=t.length,this._loaded=0,this._filename=null,this._disableRange=t.disableRange||!1,this._rangeChunkSize=t.rangeChunkSize,this._rangeChunkSize||this._disableRange||(this._disableRange=!0),this._isStreamingSupported=!t.disableStream,this._isRangeSupported=!t.disableRange,this._readableStream=null,this._readCapability=(0,s.createPromiseCapability)(),this._headersCapability=(0,s.createPromiseCapability)()}get headersReady(){return this._headersCapability.promise}get filename(){return this._filename}get contentLength(){return this._contentLength}get isRangeSupported(){return this._isRangeSupported}get isStreamingSupported(){return this._isStreamingSupported}async read(){if(await this._readCapability.promise,this._done)return{value:void 0,done:!0}
if(this._storedError)throw this._storedError
const e=this._readableStream.read()
if(null===e)return this._readCapability=(0,s.createPromiseCapability)(),this.read()
this._loaded+=e.length,this.onProgress&&this.onProgress({loaded:this._loaded,total:this._contentLength})
return{value:new Uint8Array(e).buffer,done:!1}}cancel(e){this._readableStream?this._readableStream.destroy(e):this._error(e)}_error(e){this._storedError=e,this._readCapability.resolve()}_setReadableStream(e){this._readableStream=e,e.on("readable",(()=>{this._readCapability.resolve()})),e.on("end",(()=>{e.destroy(),this._done=!0,this._readCapability.resolve()})),e.on("error",(e=>{this._error(e)})),!this._isStreamingSupported&&this._isRangeSupported&&this._error(new s.AbortException("streaming is disabled")),this._storedError&&this._readableStream.destroy(this._storedError)}}class d{constructor(e){this._url=e.url,this._done=!1,this._storedError=null,this.onProgress=null,this._loaded=0,this._readableStream=null,this._readCapability=(0,s.createPromiseCapability)()
const t=e.source
this._isStreamingSupported=!t.disableStream}get isStreamingSupported(){return this._isStreamingSupported}async read(){if(await this._readCapability.promise,this._done)return{value:void 0,done:!0}
if(this._storedError)throw this._storedError
const e=this._readableStream.read()
if(null===e)return this._readCapability=(0,s.createPromiseCapability)(),this.read()
this._loaded+=e.length,this.onProgress&&this.onProgress({loaded:this._loaded})
return{value:new Uint8Array(e).buffer,done:!1}}cancel(e){this._readableStream?this._readableStream.destroy(e):this._error(e)}_error(e){this._storedError=e,this._readCapability.resolve()}_setReadableStream(e){this._readableStream=e,e.on("readable",(()=>{this._readCapability.resolve()})),e.on("end",(()=>{e.destroy(),this._done=!0,this._readCapability.resolve()})),e.on("error",(e=>{this._error(e)})),this._storedError&&this._readableStream.destroy(this._storedError)}}function u(e,t){return{protocol:e.protocol,auth:e.auth,host:e.hostname,port:e.port,path:e.path,method:"GET",headers:t}}class p extends h{constructor(e){super(e)
const t=t=>{if(404===t.statusCode){const e=new s.MissingPDFException(`Missing PDF "${this._url}".`)
return this._storedError=e,void this._headersCapability.reject(e)}this._headersCapability.resolve(),this._setReadableStream(t)
const r=e=>this._readableStream.headers[e.toLowerCase()],{allowRangeRequests:i,suggestedLength:a}=(0,n.validateRangeRequestCapabilities)({getResponseHeader:r,isHttp:e.isHttp,rangeChunkSize:this._rangeChunkSize,disableRange:this._disableRange})
this._isRangeSupported=i,this._contentLength=a||this._contentLength,this._filename=(0,n.extractFilenameFromHeader)(r)}
this._request=null,"http:"===this._url.protocol?this._request=a.request(u(this._url,e.httpHeaders),t):this._request=o.request(u(this._url,e.httpHeaders),t),this._request.on("error",(e=>{this._storedError=e,this._headersCapability.reject(e)})),this._request.end()}}class g extends d{constructor(e,t,r){super(e),this._httpHeaders={}
for(const s in e.httpHeaders){const t=e.httpHeaders[s]
void 0!==t&&(this._httpHeaders[s]=t)}this._httpHeaders.Range=`bytes=${t}-${r-1}`
const n=e=>{if(404!==e.statusCode)this._setReadableStream(e)
else{const e=new s.MissingPDFException(`Missing PDF "${this._url}".`)
this._storedError=e}}
this._request=null,"http:"===this._url.protocol?this._request=a.request(u(this._url,this._httpHeaders),n):this._request=o.request(u(this._url,this._httpHeaders),n),this._request.on("error",(e=>{this._storedError=e})),this._request.end()}}class f extends h{constructor(e){super(e)
let t=decodeURIComponent(this._url.path)
c.test(this._url.href)&&(t=t.replace(/^\//,"")),i.lstat(t,((e,r)=>{if(e)return"ENOENT"===e.code&&(e=new s.MissingPDFException(`Missing PDF "${t}".`)),this._storedError=e,void this._headersCapability.reject(e)
this._contentLength=r.size,this._setReadableStream(i.createReadStream(t)),this._headersCapability.resolve()}))}}class m extends d{constructor(e,t,r){super(e)
let s=decodeURIComponent(this._url.path)
c.test(this._url.href)&&(s=s.replace(/^\//,"")),this._setReadableStream(i.createReadStream(s,{start:t,end:r-1}))}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.createResponseStatusError=function(e,t){if(404===e||0===e&&t.startsWith("file:"))return new s.MissingPDFException('Missing PDF "'+t+'".')
return new s.UnexpectedResponseException("Unexpected server response ("+e+') while retrieving PDF "'+t+'".',e)},t.extractFilenameFromHeader=function(e){const t=e("Content-Disposition")
if(t){let e=(0,n.getFilenameFromContentDispositionHeader)(t)
if(e.includes("%"))try{e=decodeURIComponent(e)}catch(r){}if(/\.pdf$/i.test(e))return e}return null},t.validateRangeRequestCapabilities=function({getResponseHeader:e,isHttp:t,rangeChunkSize:r,disableRange:n}){(0,s.assert)(r>0,"Range chunk size must be larger than zero")
const i={allowRangeRequests:!1,suggestedLength:void 0},a=parseInt(e("Content-Length"),10)
if(!Number.isInteger(a))return i
if(i.suggestedLength=a,a<=2*r)return i
if(n||!t)return i
if("bytes"!==e("Accept-Ranges"))return i
if("identity"!==(e("Content-Encoding")||"identity"))return i
return i.allowRangeRequests=!0,i},t.validateResponseStatus=function(e){return 200===e||206===e}
var s=r(2),n=r(21)},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.getFilenameFromContentDispositionHeader=function(e){let t=!0,r=s("filename\\*","i").exec(e)
if(r){r=r[1]
let e=a(r)
return e=unescape(e),e=o(e),e=l(e),i(e)}if(r=function(e){const t=[]
let r
const n=s("filename\\*((?!0\\d)\\d+)(\\*?)","ig")
for(;null!==(r=n.exec(e));){let[,e,s,n]=r
if(e=parseInt(e,10),e in t){if(0===e)break}else t[e]=[s,n]}const i=[]
for(let s=0;s<t.length&&s in t;++s){let[e,r]=t[s]
r=a(r),e&&(r=unescape(r),0===s&&(r=o(r))),i.push(r)}return i.join("")}(e),r){return i(l(r))}if(r=s("filename","i").exec(e),r){r=r[1]
let e=a(r)
return e=l(e),i(e)}function s(e,t){return new RegExp("(?:^|;)\\s*"+e+'\\s*=\\s*([^";\\s][^;\\s]*|"(?:[^"\\\\]|\\\\"?)+"?)',t)}function n(e,r){if(e){if(!/^[\x00-\xFF]+$/.test(r))return r
try{const s=new TextDecoder(e,{fatal:!0}),n=Array.from(r,(function(e){return 255&e.charCodeAt(0)}))
r=s.decode(new Uint8Array(n)),t=!1}catch(s){if(/^utf-?8$/i.test(e))try{r=decodeURIComponent(escape(r)),t=!1}catch(n){}}}return r}function i(e){return t&&/[\x80-\xff]/.test(e)&&(e=n("utf-8",e),t&&(e=n("iso-8859-1",e))),e}function a(e){if(e.startsWith('"')){const t=e.slice(1).split('\\"')
for(let e=0;e<t.length;++e){const r=t[e].indexOf('"');-1!==r&&(t[e]=t[e].slice(0,r),t.length=e+1),t[e]=t[e].replace(/\\(.)/g,"$1")}e=t.join('"')}return e}function o(e){const t=e.indexOf("'")
if(-1===t)return e
return n(e.slice(0,t),e.slice(t+1).replace(/^[^']*'/,""))}function l(e){return!e.startsWith("=?")||/[\x00-\x19\x80-\xff]/.test(e)?e:e.replace(/=\?([\w-]*)\?([QqBb])\?((?:[^?]|\?(?!=))*)\?=/g,(function(e,t,r,s){if("q"===r||"Q"===r)return n(t,s=(s=s.replace(/_/g," ")).replace(/=([0-9a-fA-F]{2})/g,(function(e,t){return String.fromCharCode(parseInt(t,16))})))
try{s=atob(s)}catch(i){}return n(t,s)}))}return""}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.PDFNetworkStream=void 0
var s=r(2),n=r(20)
class i{constructor(e,t){this.url=e,t=t||{},this.isHttp=/^https?:/i.test(e),this.httpHeaders=this.isHttp&&t.httpHeaders||{},this.withCredentials=t.withCredentials||!1,this.getXhr=t.getXhr||function(){return new XMLHttpRequest},this.currXhrId=0,this.pendingRequests=Object.create(null)}requestRange(e,t,r){const s={begin:e,end:t}
for(const n in r)s[n]=r[n]
return this.request(s)}requestFull(e){return this.request(e)}request(e){const t=this.getXhr(),r=this.currXhrId++,s=this.pendingRequests[r]={xhr:t}
t.open("GET",this.url),t.withCredentials=this.withCredentials
for(const n in this.httpHeaders){const e=this.httpHeaders[n]
void 0!==e&&t.setRequestHeader(n,e)}return this.isHttp&&"begin"in e&&"end"in e?(t.setRequestHeader("Range",`bytes=${e.begin}-${e.end-1}`),s.expectedStatus=206):s.expectedStatus=200,t.responseType="arraybuffer",e.onError&&(t.onerror=function(r){e.onError(t.status)}),t.onreadystatechange=this.onStateChange.bind(this,r),t.onprogress=this.onProgress.bind(this,r),s.onHeadersReceived=e.onHeadersReceived,s.onDone=e.onDone,s.onError=e.onError,s.onProgress=e.onProgress,t.send(null),r}onProgress(e,t){const r=this.pendingRequests[e]
r&&r.onProgress&&r.onProgress(t)}onStateChange(e,t){const r=this.pendingRequests[e]
if(!r)return
const n=r.xhr
if(n.readyState>=2&&r.onHeadersReceived&&(r.onHeadersReceived(),delete r.onHeadersReceived),4!==n.readyState)return
if(!(e in this.pendingRequests))return
if(delete this.pendingRequests[e],0===n.status&&this.isHttp)return void(r.onError&&r.onError(n.status))
const i=n.status||200
if(!(200===i&&206===r.expectedStatus)&&i!==r.expectedStatus)return void(r.onError&&r.onError(n.status))
const a=function(e){const t=e.response
return"string"!=typeof t?t:(0,s.stringToBytes)(t).buffer}(n)
if(206===i){const e=n.getResponseHeader("Content-Range"),t=/bytes (\d+)-(\d+)\/(\d+)/.exec(e)
r.onDone({begin:parseInt(t[1],10),chunk:a})}else a?r.onDone({begin:0,chunk:a}):r.onError&&r.onError(n.status)}hasPendingRequests(){for(const e in this.pendingRequests)return!0
return!1}getRequestXhr(e){return this.pendingRequests[e].xhr}isPendingRequest(e){return e in this.pendingRequests}abortAllRequests(){for(const e in this.pendingRequests)this.abortRequest(0|e)}abortRequest(e){const t=this.pendingRequests[e].xhr
delete this.pendingRequests[e],t.abort()}}t.PDFNetworkStream=class{constructor(e){this._source=e,this._manager=new i(e.url,{httpHeaders:e.httpHeaders,withCredentials:e.withCredentials}),this._rangeChunkSize=e.rangeChunkSize,this._fullRequestReader=null,this._rangeRequestReaders=[]}_onRangeRequestReaderClosed(e){const t=this._rangeRequestReaders.indexOf(e)
t>=0&&this._rangeRequestReaders.splice(t,1)}getFullReader(){return(0,s.assert)(!this._fullRequestReader,"PDFNetworkStream.getFullReader can only be called once."),this._fullRequestReader=new a(this._manager,this._source),this._fullRequestReader}getRangeReader(e,t){const r=new o(this._manager,e,t)
return r.onClosed=this._onRangeRequestReaderClosed.bind(this),this._rangeRequestReaders.push(r),r}cancelAllRequests(e){this._fullRequestReader&&this._fullRequestReader.cancel(e)
this._rangeRequestReaders.slice(0).forEach((function(t){t.cancel(e)}))}}
class a{constructor(e,t){this._manager=e
const r={onHeadersReceived:this._onHeadersReceived.bind(this),onDone:this._onDone.bind(this),onError:this._onError.bind(this),onProgress:this._onProgress.bind(this)}
this._url=t.url,this._fullRequestId=e.requestFull(r),this._headersReceivedCapability=(0,s.createPromiseCapability)(),this._disableRange=t.disableRange||!1,this._contentLength=t.length,this._rangeChunkSize=t.rangeChunkSize,this._rangeChunkSize||this._disableRange||(this._disableRange=!0),this._isStreamingSupported=!1,this._isRangeSupported=!1,this._cachedChunks=[],this._requests=[],this._done=!1,this._storedError=void 0,this._filename=null,this.onProgress=null}_onHeadersReceived(){const e=this._fullRequestId,t=this._manager.getRequestXhr(e),r=e=>t.getResponseHeader(e),{allowRangeRequests:s,suggestedLength:i}=(0,n.validateRangeRequestCapabilities)({getResponseHeader:r,isHttp:this._manager.isHttp,rangeChunkSize:this._rangeChunkSize,disableRange:this._disableRange})
s&&(this._isRangeSupported=!0),this._contentLength=i||this._contentLength,this._filename=(0,n.extractFilenameFromHeader)(r),this._isRangeSupported&&this._manager.abortRequest(e),this._headersReceivedCapability.resolve()}_onDone(e){if(e)if(this._requests.length>0){this._requests.shift().resolve({value:e.chunk,done:!1})}else this._cachedChunks.push(e.chunk)
this._done=!0,this._cachedChunks.length>0||(this._requests.forEach((function(e){e.resolve({value:void 0,done:!0})})),this._requests=[])}_onError(e){const t=this._url,r=(0,n.createResponseStatusError)(e,t)
this._storedError=r,this._headersReceivedCapability.reject(r),this._requests.forEach((function(e){e.reject(r)})),this._requests=[],this._cachedChunks=[]}_onProgress(e){this.onProgress&&this.onProgress({loaded:e.loaded,total:e.lengthComputable?e.total:this._contentLength})}get filename(){return this._filename}get isRangeSupported(){return this._isRangeSupported}get isStreamingSupported(){return this._isStreamingSupported}get contentLength(){return this._contentLength}get headersReady(){return this._headersReceivedCapability.promise}async read(){if(this._storedError)throw this._storedError
if(this._cachedChunks.length>0){return{value:this._cachedChunks.shift(),done:!1}}if(this._done)return{value:void 0,done:!0}
const e=(0,s.createPromiseCapability)()
return this._requests.push(e),e.promise}cancel(e){this._done=!0,this._headersReceivedCapability.reject(e),this._requests.forEach((function(e){e.resolve({value:void 0,done:!0})})),this._requests=[],this._manager.isPendingRequest(this._fullRequestId)&&this._manager.abortRequest(this._fullRequestId),this._fullRequestReader=null}}class o{constructor(e,t,r){this._manager=e
const s={onDone:this._onDone.bind(this),onProgress:this._onProgress.bind(this)}
this._requestId=e.requestRange(t,r,s),this._requests=[],this._queuedChunk=null,this._done=!1,this.onProgress=null,this.onClosed=null}_close(){this.onClosed&&this.onClosed(this)}_onDone(e){const t=e.chunk
if(this._requests.length>0){this._requests.shift().resolve({value:t,done:!1})}else this._queuedChunk=t
this._done=!0,this._requests.forEach((function(e){e.resolve({value:void 0,done:!0})})),this._requests=[],this._close()}_onProgress(e){!this.isStreamingSupported&&this.onProgress&&this.onProgress({loaded:e.loaded})}get isStreamingSupported(){return!1}async read(){if(null!==this._queuedChunk){const e=this._queuedChunk
return this._queuedChunk=null,{value:e,done:!1}}if(this._done)return{value:void 0,done:!0}
const e=(0,s.createPromiseCapability)()
return this._requests.push(e),e.promise}cancel(e){this._done=!0,this._requests.forEach((function(e){e.resolve({value:void 0,done:!0})})),this._requests=[],this._manager.isPendingRequest(this._requestId)&&this._manager.abortRequest(this._requestId),this._close()}}},function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.PDFFetchStream=void 0
var s=r(2),n=r(20)
function i(e,t,r){return{method:"GET",headers:e,signal:r&&r.signal,mode:"cors",credentials:t?"include":"same-origin",redirect:"follow"}}function a(e){const t=new Headers
for(const r in e){const s=e[r]
void 0!==s&&t.append(r,s)}return t}t.PDFFetchStream=class{constructor(e){this.source=e,this.isHttp=/^https?:/i.test(e.url),this.httpHeaders=this.isHttp&&e.httpHeaders||{},this._fullRequestReader=null,this._rangeRequestReaders=[]}get _progressiveDataLength(){return this._fullRequestReader?this._fullRequestReader._loaded:0}getFullReader(){return(0,s.assert)(!this._fullRequestReader,"PDFFetchStream.getFullReader can only be called once."),this._fullRequestReader=new o(this),this._fullRequestReader}getRangeReader(e,t){if(t<=this._progressiveDataLength)return null
const r=new l(this,e,t)
return this._rangeRequestReaders.push(r),r}cancelAllRequests(e){this._fullRequestReader&&this._fullRequestReader.cancel(e)
this._rangeRequestReaders.slice(0).forEach((function(t){t.cancel(e)}))}}
class o{constructor(e){this._stream=e,this._reader=null,this._loaded=0,this._filename=null
const t=e.source
this._withCredentials=t.withCredentials||!1,this._contentLength=t.length,this._headersCapability=(0,s.createPromiseCapability)(),this._disableRange=t.disableRange||!1,this._rangeChunkSize=t.rangeChunkSize,this._rangeChunkSize||this._disableRange||(this._disableRange=!0),"undefined"!=typeof AbortController&&(this._abortController=new AbortController),this._isStreamingSupported=!t.disableStream,this._isRangeSupported=!t.disableRange,this._headers=a(this._stream.httpHeaders)
const r=t.url
fetch(r,i(this._headers,this._withCredentials,this._abortController)).then((e=>{if(!(0,n.validateResponseStatus)(e.status))throw(0,n.createResponseStatusError)(e.status,r)
this._reader=e.body.getReader(),this._headersCapability.resolve()
const t=t=>e.headers.get(t),{allowRangeRequests:i,suggestedLength:a}=(0,n.validateRangeRequestCapabilities)({getResponseHeader:t,isHttp:this._stream.isHttp,rangeChunkSize:this._rangeChunkSize,disableRange:this._disableRange})
this._isRangeSupported=i,this._contentLength=a||this._contentLength,this._filename=(0,n.extractFilenameFromHeader)(t),!this._isStreamingSupported&&this._isRangeSupported&&this.cancel(new s.AbortException("Streaming is disabled."))})).catch(this._headersCapability.reject),this.onProgress=null}get headersReady(){return this._headersCapability.promise}get filename(){return this._filename}get contentLength(){return this._contentLength}get isRangeSupported(){return this._isRangeSupported}get isStreamingSupported(){return this._isStreamingSupported}async read(){await this._headersCapability.promise
const{value:e,done:t}=await this._reader.read()
if(t)return{value:e,done:t}
this._loaded+=e.byteLength,this.onProgress&&this.onProgress({loaded:this._loaded,total:this._contentLength})
return{value:new Uint8Array(e).buffer,done:!1}}cancel(e){this._reader&&this._reader.cancel(e),this._abortController&&this._abortController.abort()}}class l{constructor(e,t,r){this._stream=e,this._reader=null,this._loaded=0
const o=e.source
this._withCredentials=o.withCredentials||!1,this._readCapability=(0,s.createPromiseCapability)(),this._isStreamingSupported=!o.disableStream,"undefined"!=typeof AbortController&&(this._abortController=new AbortController),this._headers=a(this._stream.httpHeaders),this._headers.append("Range",`bytes=${t}-${r-1}`)
const l=o.url
fetch(l,i(this._headers,this._withCredentials,this._abortController)).then((e=>{if(!(0,n.validateResponseStatus)(e.status))throw(0,n.createResponseStatusError)(e.status,l)
this._readCapability.resolve(),this._reader=e.body.getReader()})),this.onProgress=null}get isStreamingSupported(){return this._isStreamingSupported}async read(){await this._readCapability.promise
const{value:e,done:t}=await this._reader.read()
if(t)return{value:e,done:t}
this._loaded+=e.byteLength,this.onProgress&&this.onProgress({loaded:this._loaded})
return{value:new Uint8Array(e).buffer,done:!1}}cancel(e){this._reader&&this._reader.cancel(e),this._abortController&&this._abortController.abort()}}}])}))