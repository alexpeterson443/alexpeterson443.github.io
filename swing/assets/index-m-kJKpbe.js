(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=1e3,t=1001,n=1002,r=1003,i=1004,a=1005,o=1006,s=1007,c=1008,l=1009,u=1010,d=1011,f=1012,p=1013,m=1014,h=1015,g=1016,_=1017,v=1018,y=1020,b=35902,x=35899,S=1021,C=1022,w=1023,T=1026,E=1027,D=1028,O=1029,k=1030,A=1031,j=1033,M=33776,N=33777,ee=33778,P=33779,F=35840,te=35841,ne=35842,re=35843,ie=36196,ae=37492,oe=37496,se=37808,ce=37809,le=37810,ue=37811,de=37812,fe=37813,pe=37814,me=37815,I=37816,he=37817,ge=37818,_e=37819,L=37820,ve=37821,R=36492,ye=36494,be=36495,xe=36283,Se=36284,Ce=36285,we=36286,Te=2300,Ee=2301,De=2302,Oe=2400,ke=2401,Ae=2402,je=3200,Me=3201,Ne=`srgb`,Pe=`srgb-linear`,Fe=`linear`,Ie=`srgb`,Le=7680,Re=35044,ze=35048,Be=2e3,Ve=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},He=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Ue=1234567,We=Math.PI/180,Ge=180/Math.PI;function Ke(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(He[e&255]+He[e>>8&255]+He[e>>16&255]+He[e>>24&255]+`-`+He[t&255]+He[t>>8&255]+`-`+He[t>>16&15|64]+He[t>>24&255]+`-`+He[n&63|128]+He[n>>8&255]+`-`+He[n>>16&255]+He[n>>24&255]+He[r&255]+He[r>>8&255]+He[r>>16&255]+He[r>>24&255]).toLowerCase()}function z(e,t,n){return Math.max(t,Math.min(n,e))}function qe(e,t){return(e%t+t)%t}function Je(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function Ye(e,t,n){return e===t?0:(n-e)/(t-e)}function Xe(e,t,n){return(1-n)*e+n*t}function Ze(e,t,n,r){return Xe(e,t,1-Math.exp(-n*r))}function Qe(e,t=1){return t-Math.abs(qe(e,t*2)-t)}function $e(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function et(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function tt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function nt(e,t){return e+Math.random()*(t-e)}function rt(e){return e*(.5-Math.random())}function it(e){e!==void 0&&(Ue=e);let t=Ue+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function at(e){return e*We}function ot(e){return e*Ge}function st(e){return!(e&e-1)&&e!==0}function ct(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function lt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function ut(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:console.warn(`THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function dt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function ft(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var pt={DEG2RAD:We,RAD2DEG:Ge,generateUUID:Ke,clamp:z,euclideanModulo:qe,mapLinear:Je,inverseLerp:Ye,lerp:Xe,damp:Ze,pingpong:Qe,smoothstep:$e,smootherstep:et,randInt:tt,randFloat:nt,randFloatSpread:rt,seededRandom:it,degToRad:at,radToDeg:ot,isPowerOfTwo:st,ceilPowerOfTwo:ct,floorPowerOfTwo:lt,setQuaternionFromProperEuler:ut,normalize:ft,denormalize:dt},B=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},mt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0){e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;return}if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(z(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},V=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(gt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(gt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ht.copy(this).projectOnVector(e),this.sub(ht)}reflect(e){return this.sub(ht.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ht=new V,gt=new mt,H=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(_t.makeScale(e,t)),this}rotate(e){return this.premultiply(_t.makeRotation(-e)),this}translate(e,t){return this.premultiply(_t.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},_t=new H;function vt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function yt(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function bt(){let e=yt(`canvas`);return e.style.display=`block`,e}var xt={};function St(e){e in xt||(xt[e]=!0,console.warn(e))}function Ct(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var wt=new H().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Tt=new H().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Et(){let e={enabled:!0,workingColorSpace:Pe,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Ot(e.r),e.g=Ot(e.g),e.b=Ot(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=kt(e.r),e.g=kt(e.g),e.b=kt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Fe:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return St(`THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return St(`THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Pe]:{primaries:t,whitePoint:r,transfer:Fe,toXYZ:wt,fromXYZ:Tt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Ne},outputColorSpaceConfig:{drawingBufferColorSpace:Ne}},[Ne]:{primaries:t,whitePoint:r,transfer:Ie,toXYZ:wt,fromXYZ:Tt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Ne}}}),e}var Dt=Et();function Ot(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function kt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var At,jt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{At===void 0&&(At=yt(`canvas`)),At.width=e.width,At.height=e.height;let t=At.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=At}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=yt(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Ot(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Ot(t[e]/255)*255):t[e]=Ot(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Mt=0,Nt=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Mt++}),this.uuid=Ke(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Pt(r[t].image)):e.push(Pt(r[t]))}else e=Pt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Pt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?jt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var Ft=0,It=new V,Lt=class r extends Ve{constructor(e=r.DEFAULT_IMAGE,n=r.DEFAULT_MAPPING,i=t,a=t,s=o,u=c,d=w,f=l,p=r.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ft++}),this.uuid=Ke(),this.name=``,this.source=new Nt(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=s,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new H,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(It).x}get height(){return this.source.getSize(It).y}get depth(){return this.source.getSize(It).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(r){if(this.mapping!==300)return r;if(r.applyMatrix3(this.matrix),r.x<0||r.x>1)switch(this.wrapS){case e:r.x-=Math.floor(r.x);break;case t:r.x=r.x<0?0:1;break;case n:Math.abs(Math.floor(r.x)%2)===1?r.x=Math.ceil(r.x)-r.x:r.x-=Math.floor(r.x)}if(r.y<0||r.y>1)switch(this.wrapT){case e:r.y-=Math.floor(r.y);break;case t:r.y=r.y<0?0:1;break;case n:Math.abs(Math.floor(r.y)%2)===1?r.y=Math.ceil(r.y)-r.y:r.y-=Math.floor(r.y)}return this.flipY&&(r.y=1-r.y),r}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Lt.DEFAULT_IMAGE=null,Lt.DEFAULT_MAPPING=300,Lt.DEFAULT_ANISOTROPY=1;var Rt=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this.w=z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this.w=z(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},zt=class extends Ve{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:o,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Rt(0,0,e,t),this.scissorTest=!1,this.viewport=new Rt(0,0,e,t);let r=new Lt({width:e,height:t,depth:n.depth});this.textures=[];let i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:o,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Nt(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},Bt=class extends zt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Vt=class extends Lt{constructor(e=null,n=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Ht=class extends Lt{constructor(e=null,n=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ut=class{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Gt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Gt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Gt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Gt):Gt.fromBufferAttribute(r,t),Gt.applyMatrix4(e.matrixWorld),this.expandByPoint(Gt);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Kt.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Kt.copy(e.boundingBox)),Kt.applyMatrix4(e.matrixWorld),this.union(Kt)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Gt),Gt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter($t),en.subVectors(this.max,$t),qt.subVectors(e.a,$t),Jt.subVectors(e.b,$t),Yt.subVectors(e.c,$t),Xt.subVectors(Jt,qt),Zt.subVectors(Yt,Jt),Qt.subVectors(qt,Yt);let t=[0,-Xt.z,Xt.y,0,-Zt.z,Zt.y,0,-Qt.z,Qt.y,Xt.z,0,-Xt.x,Zt.z,0,-Zt.x,Qt.z,0,-Qt.x,-Xt.y,Xt.x,0,-Zt.y,Zt.x,0,-Qt.y,Qt.x,0];return!rn(t,qt,Jt,Yt,en)||(t=[1,0,0,0,1,0,0,0,1],!rn(t,qt,Jt,Yt,en))?!1:(tn.crossVectors(Xt,Zt),t=[tn.x,tn.y,tn.z],rn(t,qt,Jt,Yt,en))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Gt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Gt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Wt[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Wt[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Wt[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Wt[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Wt[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Wt[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Wt[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Wt[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Wt),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Wt=[new V,new V,new V,new V,new V,new V,new V,new V],Gt=new V,Kt=new Ut,qt=new V,Jt=new V,Yt=new V,Xt=new V,Zt=new V,Qt=new V,$t=new V,en=new V,tn=new V,nn=new V;function rn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){nn.fromArray(e,a);let o=i.x*Math.abs(nn.x)+i.y*Math.abs(nn.y)+i.z*Math.abs(nn.z),s=t.dot(nn),c=n.dot(nn),l=r.dot(nn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var an=new Ut,on=new V,sn=new V,cn=class{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?an.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;on.subVectors(e,this.center);let t=on.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(on,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(sn.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(on.copy(e.center).add(sn)),this.expandByPoint(on.copy(e.center).sub(sn))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},ln=new V,un=new V,dn=new V,fn=new V,pn=new V,mn=new V,hn=new V,gn=class{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ln)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ln.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ln.copy(this.origin).addScaledVector(this.direction,t),ln.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){un.copy(e).add(t).multiplyScalar(.5),dn.copy(t).sub(e).normalize(),fn.copy(this.origin).sub(un);let i=e.distanceTo(t)*.5,a=-this.direction.dot(dn),o=fn.dot(this.direction),s=-fn.dot(dn),c=fn.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(un).addScaledVector(dn,d),f}intersectSphere(e,t){ln.subVectors(e.center,this.origin);let n=ln.dot(this.direction),r=ln.dot(ln)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,ln)!==null}intersectTriangle(e,t,n,r,i){pn.subVectors(t,e),mn.subVectors(n,e),hn.crossVectors(pn,mn);let a=this.direction.dot(hn),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;fn.subVectors(this.origin,e);let s=o*this.direction.dot(mn.crossVectors(fn,mn));if(s<0)return null;let c=o*this.direction.dot(pn.cross(fn));if(c<0||s+c>a)return null;let l=-o*fn.dot(hn);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},_n=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/vn.setFromMatrixColumn(e,0).length(),i=1/vn.setFromMatrixColumn(e,1).length(),a=1/vn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(bn,e,xn)}lookAt(e,t,n){let r=this.elements;return wn.subVectors(e,t),wn.lengthSq()===0&&(wn.z=1),wn.normalize(),Sn.crossVectors(n,wn),Sn.lengthSq()===0&&(Math.abs(n.z)===1?wn.x+=1e-4:wn.z+=1e-4,wn.normalize(),Sn.crossVectors(n,wn)),Sn.normalize(),Cn.crossVectors(wn,Sn),r[0]=Sn.x,r[4]=Cn.x,r[8]=wn.x,r[1]=Sn.y,r[5]=Cn.y,r[9]=wn.y,r[2]=Sn.z,r[6]=Cn.z,r[10]=wn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],ee=r[7],P=r[11],F=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*ee,i[8]=a*C+o*D+s*j+c*P,i[12]=a*w+o*O+s*M+c*F,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*ee,i[9]=l*C+u*D+d*j+f*P,i[13]=l*w+u*O+d*M+f*F,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*ee,i[10]=p*C+m*D+h*j+g*P,i[14]=p*w+m*O+h*M+g*F,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*ee,i[11]=_*C+v*D+y*j+b*P,i[15]=_*w+v*O+y*M+b*F,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=vn.set(r[0],r[1],r[2]).length(),a=vn.set(r[4],r[5],r[6]).length(),o=vn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],yn.copy(this);let s=1/i,c=1/a,l=1/o;return yn.elements[0]*=s,yn.elements[1]*=s,yn.elements[2]*=s,yn.elements[4]*=c,yn.elements[5]*=c,yn.elements[6]*=c,yn.elements[8]*=l,yn.elements[9]*=l,yn.elements[10]*=l,t.setFromRotationMatrix(yn),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=Be,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Be,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},vn=new V,yn=new _n,bn=new V(0,0,0),xn=new V(1,1,1),Sn=new V,Cn=new V,wn=new V,Tn=new _n,En=new mt,Dn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-z(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-z(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(z(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Tn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Tn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return En.setFromEuler(this),this.setFromQuaternion(En,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Dn.DEFAULT_ORDER=`XYZ`;var On=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},kn=0,An=new V,jn=new mt,Mn=new _n,Nn=new V,Pn=new V,Fn=new V,In=new mt,Ln=new V(1,0,0),Rn=new V(0,1,0),zn=new V(0,0,1),Bn={type:`added`},Vn={type:`removed`},Hn={type:`childadded`,child:null},Un={type:`childremoved`,child:null},Wn=class e extends Ve{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:kn++}),this.uuid=Ke(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new V,n=new Dn,r=new mt,i=new V(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new _n},normalMatrix:{value:new H}}),this.matrix=new _n,this.matrixWorld=new _n,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new On,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return jn.setFromAxisAngle(e,t),this.quaternion.multiply(jn),this}rotateOnWorldAxis(e,t){return jn.setFromAxisAngle(e,t),this.quaternion.premultiply(jn),this}rotateX(e){return this.rotateOnAxis(Ln,e)}rotateY(e){return this.rotateOnAxis(Rn,e)}rotateZ(e){return this.rotateOnAxis(zn,e)}translateOnAxis(e,t){return An.copy(e).applyQuaternion(this.quaternion),this.position.add(An.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ln,e)}translateY(e){return this.translateOnAxis(Rn,e)}translateZ(e){return this.translateOnAxis(zn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Mn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Nn.copy(e):Nn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Pn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Mn.lookAt(Pn,Nn,this.up):Mn.lookAt(Nn,Pn,this.up),this.quaternion.setFromRotationMatrix(Mn),r&&(Mn.extractRotation(r.matrixWorld),jn.setFromRotationMatrix(Mn),this.quaternion.premultiply(jn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Bn),Hn.child=e,this.dispatchEvent(Hn),Hn.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Vn),Un.child=e,this.dispatchEvent(Un),Un.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Mn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Mn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Mn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Bn),Hn.child=e,this.dispatchEvent(Hn),Hn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Pn,e,Fn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Pn,In,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};Wn.DEFAULT_UP=new V(0,1,0),Wn.DEFAULT_MATRIX_AUTO_UPDATE=!0,Wn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Gn=new V,Kn=new V,qn=new V,Jn=new V,Yn=new V,Xn=new V,Zn=new V,Qn=new V,$n=new V,er=new V,tr=new Rt,nr=new Rt,rr=new Rt,ir=class e{constructor(e=new V,t=new V,n=new V){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Gn.subVectors(e,t),r.cross(Gn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Gn.subVectors(r,t),Kn.subVectors(n,t),qn.subVectors(e,t);let a=Gn.dot(Gn),o=Gn.dot(Kn),s=Gn.dot(qn),c=Kn.dot(Kn),l=Kn.dot(qn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Jn)!==null&&Jn.x>=0&&Jn.y>=0&&Jn.x+Jn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Jn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Jn.x),s.addScaledVector(a,Jn.y),s.addScaledVector(o,Jn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return tr.setScalar(0),nr.setScalar(0),rr.setScalar(0),tr.fromBufferAttribute(e,t),nr.fromBufferAttribute(e,n),rr.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(tr,i.x),a.addScaledVector(nr,i.y),a.addScaledVector(rr,i.z),a}static isFrontFacing(e,t,n,r){return Gn.subVectors(n,t),Kn.subVectors(e,t),Gn.cross(Kn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Gn.subVectors(this.c,this.b),Kn.subVectors(this.a,this.b),Gn.cross(Kn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Yn.subVectors(r,n),Xn.subVectors(i,n),Qn.subVectors(e,n);let s=Yn.dot(Qn),c=Xn.dot(Qn);if(s<=0&&c<=0)return t.copy(n);$n.subVectors(e,r);let l=Yn.dot($n),u=Xn.dot($n);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Yn,a);er.subVectors(e,i);let f=Yn.dot(er),p=Xn.dot(er);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Xn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Zn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Zn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Yn,a).addScaledVector(Xn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ar={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},or={h:0,s:0,l:0},sr={h:0,s:0,l:0};function cr(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var U=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ne){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Dt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,Dt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Dt.workingColorSpace){if(e=qe(e,1),t=z(t,0,1),n=z(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=cr(i,r,e+1/3),this.g=cr(i,r,e),this.b=cr(i,r,e-1/3)}return Dt.colorSpaceToWorking(this,r),this}setStyle(e,t=Ne){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ne){let n=ar[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ot(e.r),this.g=Ot(e.g),this.b=Ot(e.b),this}copyLinearToSRGB(e){return this.r=kt(e.r),this.g=kt(e.g),this.b=kt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ne){return Dt.workingToColorSpace(lr.copy(this),e),Math.round(z(lr.r*255,0,255))*65536+Math.round(z(lr.g*255,0,255))*256+Math.round(z(lr.b*255,0,255))}getHexString(e=Ne){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Dt.workingColorSpace){Dt.workingToColorSpace(lr.copy(this),t);let n=lr.r,r=lr.g,i=lr.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Dt.workingColorSpace){return Dt.workingToColorSpace(lr.copy(this),t),e.r=lr.r,e.g=lr.g,e.b=lr.b,e}getStyle(e=Ne){Dt.workingToColorSpace(lr.copy(this),e);let t=lr.r,n=lr.g,r=lr.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(or),this.setHSL(or.h+e,or.s+t,or.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(or),e.getHSL(sr);let n=Xe(or.h,sr.h,t),r=Xe(or.s,sr.s,t),i=Xe(or.l,sr.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},lr=new U;U.NAMES=ar;var ur=0,dr=class extends Ve{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ur++}),this.uuid=Ke(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new U(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Le,this.stencilZFail=Le,this.stencilZPass=Le,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},fr=class extends dr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},pr=new V,mr=new B,hr=0,gr=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:hr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Re,this.updateRanges=[],this.gpuType=h,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)mr.fromBufferAttribute(this,t),mr.applyMatrix3(e),this.setXY(t,mr.x,mr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)pr.fromBufferAttribute(this,t),pr.applyMatrix3(e),this.setXYZ(t,pr.x,pr.y,pr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)pr.fromBufferAttribute(this,t),pr.applyMatrix4(e),this.setXYZ(t,pr.x,pr.y,pr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)pr.fromBufferAttribute(this,t),pr.applyNormalMatrix(e),this.setXYZ(t,pr.x,pr.y,pr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)pr.fromBufferAttribute(this,t),pr.transformDirection(e),this.setXYZ(t,pr.x,pr.y,pr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=dt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=dt(t,this.array)),t}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=dt(t,this.array)),t}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=dt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=dt(t,this.array)),t}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array),i=ft(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},_r=class extends gr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},vr=class extends gr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},yr=class extends gr{constructor(e,t,n){super(new Float32Array(e),t,n)}},br=0,xr=new _n,Sr=new Wn,Cr=new V,wr=new Ut,Tr=new Ut,Er=new V,Dr=class e extends Ve{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:br++}),this.uuid=Ke(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(vt(e)?vr:_r)(e,1):e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new H().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return xr.makeRotationFromQuaternion(e),this.applyMatrix4(xr),this}rotateX(e){return xr.makeRotationX(e),this.applyMatrix4(xr),this}rotateY(e){return xr.makeRotationY(e),this.applyMatrix4(xr),this}rotateZ(e){return xr.makeRotationZ(e),this.applyMatrix4(xr),this}translate(e,t,n){return xr.makeTranslation(e,t,n),this.applyMatrix4(xr),this}scale(e,t,n){return xr.makeScale(e,t,n),this.applyMatrix4(xr),this}lookAt(e){return Sr.lookAt(e),Sr.updateMatrix(),this.applyMatrix4(Sr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Cr).negate(),this.translate(Cr.x,Cr.y,Cr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new yr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&console.warn(`THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ut);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];wr.setFromBufferAttribute(n),this.morphTargetsRelative?(Er.addVectors(this.boundingBox.min,wr.min),this.boundingBox.expandByPoint(Er),Er.addVectors(this.boundingBox.max,wr.max),this.boundingBox.expandByPoint(Er)):(this.boundingBox.expandByPoint(wr.min),this.boundingBox.expandByPoint(wr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new cn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new V,1/0);return}if(e){let n=this.boundingSphere.center;if(wr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Tr.setFromBufferAttribute(n),this.morphTargetsRelative?(Er.addVectors(wr.min,Tr.min),wr.expandByPoint(Er),Er.addVectors(wr.max,Tr.max),wr.expandByPoint(Er)):(wr.expandByPoint(Tr.min),wr.expandByPoint(Tr.max))}wr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Er.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Er));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Er.fromBufferAttribute(a,t),o&&(Cr.fromBufferAttribute(e,t),Er.add(Cr)),r=Math.max(r,n.distanceToSquared(Er))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new gr(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new V,s[e]=new V;let c=new V,l=new V,u=new V,d=new B,f=new B,p=new B,m=new V,h=new V;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new V,y=new V,b=new V,x=new V;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new gr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new V,i=new V,a=new V,o=new V,s=new V,c=new V,l=new V,u=new V;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Er.fromBufferAttribute(e,t),Er.normalize(),e.setXYZ(t,Er.x,Er.y,Er.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new gr(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Or=new _n,kr=new gn,Ar=new cn,jr=new V,Mr=new V,Nr=new V,Pr=new V,Fr=new V,Ir=new V,Lr=new V,Rr=new V,zr=class extends Wn{constructor(e=new Dr,t=new fr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Ir.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Fr.fromBufferAttribute(s,e),a?Ir.addScaledVector(Fr,r):Ir.addScaledVector(Fr.sub(t),r))}t.add(Ir)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ar.copy(n.boundingSphere),Ar.applyMatrix4(i),kr.copy(e.ray).recast(e.near),!(Ar.containsPoint(kr.origin)===!1&&(kr.intersectSphere(Ar,jr)===null||kr.origin.distanceToSquared(jr)>(e.far-e.near)**2))&&(Or.copy(i).invert(),kr.copy(e.ray).applyMatrix4(Or),(n.boundingBox===null||kr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,kr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Vr(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Vr(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Vr(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Vr(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Br(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Rr.copy(s),Rr.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Rr);return l<n.near||l>n.far?null:{distance:l,point:Rr.clone(),object:e}}function Vr(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Mr),e.getVertexPosition(c,Nr),e.getVertexPosition(l,Pr);let u=Br(e,t,n,r,Mr,Nr,Pr,Lr);if(u){let e=new V;ir.getBarycoord(Lr,Mr,Nr,Pr,e),i&&(u.uv=ir.getInterpolatedAttribute(i,s,c,l,e,new B)),a&&(u.uv1=ir.getInterpolatedAttribute(a,s,c,l,e,new B)),o&&(u.normal=ir.getInterpolatedAttribute(o,s,c,l,e,new V),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new V,materialIndex:0};ir.getNormal(Mr,Nr,Pr,t.normal),u.face=t,u.barycoord=e}return u}var Hr=class e extends Dr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new yr(c,3)),this.setAttribute(`normal`,new yr(l,3)),this.setAttribute(`uv`,new yr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new V;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Ur(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function Wr(e){let t={};for(let n=0;n<e.length;n++){let r=Ur(e[n]);for(let e in r)t[e]=r[e]}return t}function Gr(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Kr(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Dt.workingColorSpace}var qr={clone:Ur,merge:Wr},Jr=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Yr=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Xr=class extends dr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Jr,this.fragmentShader=Yr,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ur(e.uniforms),this.uniformsGroups=Gr(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Zr=class extends Wn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new _n,this.projectionMatrix=new _n,this.projectionMatrixInverse=new _n,this.coordinateSystem=Be,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Qr=new V,$r=new B,ei=new B,ti=class extends Zr{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ge*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(We*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ge*2*Math.atan(Math.tan(We*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Qr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Qr.x,Qr.y).multiplyScalar(-e/Qr.z),Qr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Qr.x,Qr.y).multiplyScalar(-e/Qr.z)}getViewSize(e,t){return this.getViewBounds(e,$r,ei),t.subVectors(ei,$r)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(We*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ni=-90,ri=1,ii=class extends Wn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new ti(ni,ri,e,t);r.layers=this.layers,this.add(r);let i=new ti(ni,ri,e,t);i.layers=this.layers,this.add(i);let a=new ti(ni,ri,e,t);a.layers=this.layers,this.add(a);let o=new ti(ni,ri,e,t);o.layers=this.layers,this.add(o);let s=new ti(ni,ri,e,t);s.layers=this.layers,this.add(s);let c=new ti(ni,ri,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},ai=class extends Lt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},oi=class extends Bt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new ai(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Hr(5,5,5),i=new Xr({name:`CubemapFromEquirect`,uniforms:Ur(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new zr(r,i),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=o),new ii(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},si=class extends Wn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},ci={type:`move`},li=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new si,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new si,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new si,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ci)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new si;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},ui=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new U(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},di=class extends Wn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Dn,this.environmentIntensity=1,this.environmentRotation=new Dn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},fi=class extends Lt{constructor(e=null,t=1,n=1,i,a,o,s,c,l=r,u=r,d,f){super(null,o,s,c,l,u,i,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},pi=class extends gr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},mi=new _n,hi=new _n,gi=[],_i=new Ut,vi=new _n,yi=new zr,bi=new cn,xi=class extends zr{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new pi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,vi)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ut),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,mi),_i.copy(e.boundingBox).applyMatrix4(mi),this.boundingBox.union(_i)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new cn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,mi),bi.copy(e.boundingSphere).applyMatrix4(mi),this.boundingSphere.union(bi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(yi.geometry=this.geometry,yi.material=this.material,yi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),bi.copy(this.boundingSphere),bi.applyMatrix4(n),e.ray.intersectsSphere(bi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,mi),hi.multiplyMatrices(n,mi),yi.matrixWorld=hi,yi.raycast(e,gi);for(let e=0,n=gi.length;e<n;e++){let n=gi[e];n.instanceId=i,n.object=this,t.push(n)}gi.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new pi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new fi(new Float32Array(r*this.count),r,this.count,D,h));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;i[s]=o,i.set(n,s+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Si=new V,Ci=new V,wi=new H,Ti=class{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Si.subVectors(n,t).cross(Ci.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Si),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||wi.getNormalMatrix(e),r=this.coplanarPoint(Si).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ei=new cn,Di=new B(.5,.5),Oi=new V,ki=class{constructor(e=new Ti,t=new Ti,n=new Ti,r=new Ti,i=new Ti,a=new Ti){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Be,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ei.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ei.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ei)}intersectsSprite(e){return Ei.center.set(0,0,0),Ei.radius=.7071067811865476+Di.distanceTo(e.center),Ei.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ei)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Oi.x=r.normal.x>0?e.max.x:e.min.x,Oi.y=r.normal.y>0?e.max.y:e.min.y,Oi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Oi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Ai=class extends dr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new U(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ji=new V,Mi=new V,Ni=new _n,Pi=new gn,Fi=new cn,Ii=new V,Li=new V,Ri=class extends Wn{constructor(e=new Dr,t=new Ai){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)ji.fromBufferAttribute(t,e-1),Mi.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=ji.distanceTo(Mi);e.setAttribute(`lineDistance`,new yr(n,1))}else console.warn(`THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fi.copy(n.boundingSphere),Fi.applyMatrix4(r),Fi.radius+=i,e.ray.intersectsSphere(Fi)===!1)return;Ni.copy(r).invert(),Pi.copy(e.ray).applyMatrix4(Ni);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=zi(this,e,Pi,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=zi(this,e,Pi,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=zi(this,e,Pi,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=zi(this,e,Pi,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function zi(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(ji.fromBufferAttribute(s,i),Mi.fromBufferAttribute(s,a),n.distanceSqToSegment(ji,Mi,Ii,Li)>r)return;Ii.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Ii);if(!(c<t.near||c>t.far))return{distance:c,point:Li.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Bi=new V,Vi=new V,Hi=class extends Ri{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Bi.fromBufferAttribute(t,e),Vi.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Bi.distanceTo(Vi);e.setAttribute(`lineDistance`,new yr(n,1))}else console.warn(`THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},Ui=class extends dr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new U(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Wi=new _n,Gi=new gn,Ki=new cn,qi=new V,Ji=class extends Wn{constructor(e=new Dr,t=new Ui){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ki.copy(n.boundingSphere),Ki.applyMatrix4(r),Ki.radius+=i,e.ray.intersectsSphere(Ki)===!1)return;Wi.copy(r).invert(),Gi.copy(e.ray).applyMatrix4(Wi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);qi.fromBufferAttribute(l,n),Yi(qi,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)qi.fromBufferAttribute(l,a),Yi(qi,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Yi(e,t,n,r,i,a,o){let s=Gi.distanceSqToPoint(e);if(s<n){let n=new V;Gi.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Xi=class extends Lt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Zi=class extends Lt{constructor(e,t,n=m,i,a,o,s=r,c=r,l,u=T,d=1){if(u!==1026&&u!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},i,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Nt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Qi=class extends Lt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},$i=class e extends Dr{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new V,g=new V;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new yr(o,3)),this.setAttribute(`normal`,new yr(s,3)),this.setAttribute(`uv`,new yr(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},ea=class e extends Dr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new yr(u,3)),this.setAttribute(`normal`,new yr(d,3)),this.setAttribute(`uv`,new yr(f,2));function _(){let a=new V,_=new V,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new B,m=new V,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ta=class e extends ea{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},na=class e extends Dr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new yr(i,3)),this.setAttribute(`normal`,new yr(i.slice(),3)),this.setAttribute(`uv`,new yr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new V,r=new V,i=new V;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new V;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new V;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new V,t=new V,n=new V,r=new V,o=new B,s=new B,c=new B;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.details)}},ra=class e extends na{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},ia=class e extends Dr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new yr(p,3)),this.setAttribute(`normal`,new yr(m,3)),this.setAttribute(`uv`,new yr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},aa=class extends Xr{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},oa=class extends dr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new U(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new U(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},sa=class extends oa{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new B(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return z(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new U(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new U(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new U(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},ca=class extends dr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=je,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},la=class extends dr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ua(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function da(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var fa=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},pa=class extends fa{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Oe,endingEnd:Oe}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case ke:i=e,o=2*t-n;break;case Ae:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case ke:a=e,s=2*n-t;break;case Ae:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},ma=class extends fa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},ha=class extends fa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},ga=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=ua(t,this.TimeBufferType),this.values=ua(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ua(e.times,Array),values:ua(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ha(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ma(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new pa(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Te:t=this.InterpolantFactoryMethodDiscrete;break;case Ee:t=this.InterpolantFactoryMethodLinear;break;case De:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Te;case this.InterpolantFactoryMethodLinear:return Ee;case this.InterpolantFactoryMethodSmooth:return De}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&da(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===De,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};ga.prototype.ValueTypeName=``,ga.prototype.TimeBufferType=Float32Array,ga.prototype.ValueBufferType=Float32Array,ga.prototype.DefaultInterpolation=Ee;var _a=class extends ga{constructor(e,t,n){super(e,t,n)}};_a.prototype.ValueTypeName=`bool`,_a.prototype.ValueBufferType=Array,_a.prototype.DefaultInterpolation=Te,_a.prototype.InterpolantFactoryMethodLinear=void 0,_a.prototype.InterpolantFactoryMethodSmooth=void 0;var va=class extends ga{constructor(e,t,n,r){super(e,t,n,r)}};va.prototype.ValueTypeName=`color`;var ya=class extends ga{constructor(e,t,n,r){super(e,t,n,r)}};ya.prototype.ValueTypeName=`number`;var ba=class extends fa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)mt.slerpFlat(i,0,a,c-o,a,c,s);return i}},xa=class extends ga{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ba(this.times,this.values,this.getValueSize(),e)}};xa.prototype.ValueTypeName=`quaternion`,xa.prototype.InterpolantFactoryMethodSmooth=void 0;var Sa=class extends ga{constructor(e,t,n){super(e,t,n)}};Sa.prototype.ValueTypeName=`string`,Sa.prototype.ValueBufferType=Array,Sa.prototype.DefaultInterpolation=Te,Sa.prototype.InterpolantFactoryMethodLinear=void 0,Sa.prototype.InterpolantFactoryMethodSmooth=void 0;var Ca=class extends ga{constructor(e,t,n,r){super(e,t,n,r)}};Ca.prototype.ValueTypeName=`vector`;var wa=class extends Wn{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new U(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Ta=class extends wa{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Wn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new U(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Ea=new _n,Da=new V,Oa=new V,ka=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new B(512,512),this.mapType=l,this.map=null,this.mapPass=null,this.matrix=new _n,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ki,this._frameExtents=new B(1,1),this._viewportCount=1,this._viewports=[new Rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Da.setFromMatrixPosition(e.matrixWorld),t.position.copy(Da),Oa.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Oa),t.updateMatrixWorld(),Ea.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ea,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ea)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Aa=class extends Zr{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ja=class extends ka{constructor(){super(new Aa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ma=class extends wa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Wn.DEFAULT_UP),this.updateMatrix(),this.target=new Wn,this.shadow=new ja}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Na=class extends ti{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Pa=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}},Fa=`\\[\\]\\.:\\/`,Ia=RegExp(`[\\[\\]\\.:\\/]`,`g`),La=`[^\\[\\]\\.:\\/]`,Ra=`[^`+Fa.replace(`\\.`,``)+`]`,za=`((?:WC+[\\/:])*)`.replace(`WC`,La),Ba=`(WCOD+)?`.replace(`WCOD`,Ra),Va=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,La),Ha=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,La),Ua=RegExp(`^`+za+Ba+Va+Ha+`$`),Wa=[`material`,`materials`,`bones`,`map`],Ga=class{constructor(e,t,n){let r=n||Ka.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ka=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Ia,``)}static parseTrackName(e){let t=Ua.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Wa.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ka.Composite=Ga,Ka.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Ka.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Ka.prototype.GetterByBindingType=[Ka.prototype._getValue_direct,Ka.prototype._getValue_array,Ka.prototype._getValue_arrayElement,Ka.prototype._getValue_toArray],Ka.prototype.SetterByBindingTypeAndVersioning=[[Ka.prototype._setValue_direct,Ka.prototype._setValue_direct_setNeedsUpdate,Ka.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ka.prototype._setValue_array,Ka.prototype._setValue_array_setNeedsUpdate,Ka.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ka.prototype._setValue_arrayElement,Ka.prototype._setValue_arrayElement_setNeedsUpdate,Ka.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ka.prototype._setValue_fromArray,Ka.prototype._setValue_fromArray_setNeedsUpdate,Ka.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];function qa(e,t,n,r){let i=Ja(r);switch(n){case S:return e*t;case D:return e*t/i.components*i.byteLength;case O:return e*t/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case A:return e*t*2/i.components*i.byteLength;case C:return e*t*3/i.components*i.byteLength;case w:return e*t*4/i.components*i.byteLength;case j:return e*t*4/i.components*i.byteLength;case M:case N:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ee:case P:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case te:case re:return Math.max(e,16)*Math.max(t,8)/4;case F:case ne:return Math.max(e,8)*Math.max(t,8)/2;case ie:case ae:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case oe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case se:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ce:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case le:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ue:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case de:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case fe:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case pe:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case me:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case I:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case he:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case ge:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case _e:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case L:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case ve:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case R:case ye:case be:return Math.ceil(e/4)*Math.ceil(t/4)*16;case xe:case Se:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ce:case we:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Ja(e){switch(e){case l:case u:return{byteLength:1,components:1};case f:case d:case g:return{byteLength:2,components:1};case _:case v:return{byteLength:2,components:4};case m:case p:case h:return{byteLength:4,components:1};case b:case x:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`180`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`180`);function Ya(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Xa(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var W={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},G={common:{diffuse:{value:new U(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new U(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new U(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new U(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},Za={basic:{uniforms:Wr([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.fog]),vertexShader:W.meshbasic_vert,fragmentShader:W.meshbasic_frag},lambert:{uniforms:Wr([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new U(0)}}]),vertexShader:W.meshlambert_vert,fragmentShader:W.meshlambert_frag},phong:{uniforms:Wr([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new U(0)},specular:{value:new U(1118481)},shininess:{value:30}}]),vertexShader:W.meshphong_vert,fragmentShader:W.meshphong_frag},standard:{uniforms:Wr([G.common,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.roughnessmap,G.metalnessmap,G.fog,G.lights,{emissive:{value:new U(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:W.meshphysical_vert,fragmentShader:W.meshphysical_frag},toon:{uniforms:Wr([G.common,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.gradientmap,G.fog,G.lights,{emissive:{value:new U(0)}}]),vertexShader:W.meshtoon_vert,fragmentShader:W.meshtoon_frag},matcap:{uniforms:Wr([G.common,G.bumpmap,G.normalmap,G.displacementmap,G.fog,{matcap:{value:null}}]),vertexShader:W.meshmatcap_vert,fragmentShader:W.meshmatcap_frag},points:{uniforms:Wr([G.points,G.fog]),vertexShader:W.points_vert,fragmentShader:W.points_frag},dashed:{uniforms:Wr([G.common,G.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:W.linedashed_vert,fragmentShader:W.linedashed_frag},depth:{uniforms:Wr([G.common,G.displacementmap]),vertexShader:W.depth_vert,fragmentShader:W.depth_frag},normal:{uniforms:Wr([G.common,G.bumpmap,G.normalmap,G.displacementmap,{opacity:{value:1}}]),vertexShader:W.meshnormal_vert,fragmentShader:W.meshnormal_frag},sprite:{uniforms:Wr([G.sprite,G.fog]),vertexShader:W.sprite_vert,fragmentShader:W.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:W.background_vert,fragmentShader:W.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:W.backgroundCube_vert,fragmentShader:W.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:W.cube_vert,fragmentShader:W.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:W.equirect_vert,fragmentShader:W.equirect_frag},distanceRGBA:{uniforms:Wr([G.common,G.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:W.distanceRGBA_vert,fragmentShader:W.distanceRGBA_frag},shadow:{uniforms:Wr([G.lights,G.fog,{color:{value:new U(0)},opacity:{value:1}}]),vertexShader:W.shadow_vert,fragmentShader:W.shadow_frag}};Za.physical={uniforms:Wr([Za.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new U(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new U(0)},specularColor:{value:new U(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:W.meshphysical_vert,fragmentShader:W.meshphysical_frag};var Qa={r:0,b:0,g:0},$a=new Dn,eo=new _n;function to(e,t,n,r,i,a,o){let s=new U(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new zr(new Hr(1,1,1),new Xr({name:`BackgroundCubeMaterial`,uniforms:Ur(Za.backgroundCube.uniforms),vertexShader:Za.backgroundCube.vertexShader,fragmentShader:Za.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),$a.copy(n.backgroundRotation),$a.x*=-1,$a.y*=-1,$a.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&($a.y*=-1,$a.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(eo.makeRotationFromEuler($a)),u.material.toneMapped=Dt.getTransfer(r.colorSpace)!==Ie,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new zr(new ia(2,2),new Xr({name:`BackgroundMaterial`,uniforms:Ur(Za.background.uniforms),vertexShader:Za.background.vertexShader,fragmentShader:Za.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Dt.getTransfer(r.colorSpace)!==Ie,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Qa,Kr(e)),r.buffers.color.setClear(Qa.r,Qa.g,Qa.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function no(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function ro(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function io(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function ao(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Ti,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function oo(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new oi(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var so=4,co=[.125,.215,.35,.446,.526,.582],lo=20,uo=new Aa,fo=new U,po=null,mo=0,ho=0,go=!1,_o=(1+Math.sqrt(5))/2,vo=1/_o,yo=[new V(-_o,vo,0),new V(_o,vo,0),new V(-vo,0,_o),new V(vo,0,_o),new V(0,_o,-vo),new V(0,_o,vo),new V(-1,1,-1),new V(1,1,-1),new V(-1,1,1),new V(1,1,1)],bo=new V,xo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=bo}=i;po=this._renderer.getRenderTarget(),mo=this._renderer.getActiveCubeFace(),ho=this._renderer.getActiveMipmapLevel(),go=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Do(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Eo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(po,mo,ho),this._renderer.xr.enabled=go,e.scissorTest=!1,wo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),po=this._renderer.getRenderTarget(),mo=this._renderer.getActiveCubeFace(),ho=this._renderer.getActiveMipmapLevel(),go=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:o,minFilter:o,generateMipmaps:!1,type:g,format:w,colorSpace:Pe,depthBuffer:!1},r=Co(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Co(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=So(r)),this._blurMaterial=To(r,e,t)}return r}_compileMaterial(e){let t=new zr(this._lodPlanes[0],e);this._renderer.compile(t,uo)}_sceneToCubeUV(e,t,n,r,i){let a=new ti(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(fo),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new fr({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new zr(new Hr,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(fo),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;wo(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Do()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Eo());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new zr(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;wo(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,uo)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=yo[(r-t-1)%yo.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new zr(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):lo;m>lo&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${lo}`);let h=[],g=0;for(let e=0;e<lo;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];wo(t,3*v*(r>_-so?r-_+so:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,uo)}};function So(e){let t=[],n=[],r=[],i=e,a=e-so+1+co.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-so?s=co[o-e+so-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Dr;h.setAttribute(`position`,new gr(f,3)),h.setAttribute(`uv`,new gr(p,2)),h.setAttribute(`faceIndex`,new gr(m,1)),t.push(h),i>so&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function Co(e,t,n){let r=new Bt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function wo(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function To(e,t,n){let r=new Float32Array(lo),i=new V(0,1,0);return new Xr({name:`SphericalGaussianBlur`,defines:{n:lo,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Oo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Eo(){return new Xr({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Oo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Do(){return new Xr({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Oo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Oo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function ko(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new xo(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new xo(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function Ao(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&St(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function jo(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(vt(n)?vr:_r)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Mo(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function No(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Po(e,t,n){let r=new WeakMap,i=new Rt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*m*4*u),_=new Vt(g,p,m,u);_.type=h,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new B(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Fo(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var Io=new Lt,Lo=new Zi(1,1),Ro=new Vt,zo=new Ht,Bo=new ai,Vo=[],Ho=[],Uo=new Float32Array(16),Wo=new Float32Array(9),Go=new Float32Array(4);function Ko(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Vo[i];if(a===void 0&&(a=new Float32Array(i),Vo[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function qo(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Jo(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Yo(e,t){let n=Ho[t];n===void 0&&(n=new Int32Array(t),Ho[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Xo(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Zo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(qo(n,t))return;e.uniform2fv(this.addr,t),Jo(n,t)}}function Qo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(qo(n,t))return;e.uniform3fv(this.addr,t),Jo(n,t)}}function $o(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(qo(n,t))return;e.uniform4fv(this.addr,t),Jo(n,t)}}function es(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(qo(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Jo(n,t)}else{if(qo(n,r))return;Go.set(r),e.uniformMatrix2fv(this.addr,!1,Go),Jo(n,r)}}function ts(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(qo(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Jo(n,t)}else{if(qo(n,r))return;Wo.set(r),e.uniformMatrix3fv(this.addr,!1,Wo),Jo(n,r)}}function ns(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(qo(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Jo(n,t)}else{if(qo(n,r))return;Uo.set(r),e.uniformMatrix4fv(this.addr,!1,Uo),Jo(n,r)}}function rs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function is(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(qo(n,t))return;e.uniform2iv(this.addr,t),Jo(n,t)}}function as(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(qo(n,t))return;e.uniform3iv(this.addr,t),Jo(n,t)}}function os(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(qo(n,t))return;e.uniform4iv(this.addr,t),Jo(n,t)}}function ss(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function cs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(qo(n,t))return;e.uniform2uiv(this.addr,t),Jo(n,t)}}function ls(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(qo(n,t))return;e.uniform3uiv(this.addr,t),Jo(n,t)}}function us(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(qo(n,t))return;e.uniform4uiv(this.addr,t),Jo(n,t)}}function ds(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Lo.compareFunction=515,a=Lo):a=Io,n.setTexture2D(t||a,i)}function fs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||zo,i)}function ps(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Bo,i)}function ms(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Ro,i)}function hs(e){switch(e){case 5126:return Xo;case 35664:return Zo;case 35665:return Qo;case 35666:return $o;case 35674:return es;case 35675:return ts;case 35676:return ns;case 5124:case 35670:return rs;case 35667:case 35671:return is;case 35668:case 35672:return as;case 35669:case 35673:return os;case 5125:return ss;case 36294:return cs;case 36295:return ls;case 36296:return us;case 35678:case 36198:case 36298:case 36306:case 35682:return ds;case 35679:case 36299:case 36307:return fs;case 35680:case 36300:case 36308:case 36293:return ps;case 36289:case 36303:case 36311:case 36292:return ms}}function gs(e,t){e.uniform1fv(this.addr,t)}function _s(e,t){let n=Ko(t,this.size,2);e.uniform2fv(this.addr,n)}function vs(e,t){let n=Ko(t,this.size,3);e.uniform3fv(this.addr,n)}function ys(e,t){let n=Ko(t,this.size,4);e.uniform4fv(this.addr,n)}function bs(e,t){let n=Ko(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function xs(e,t){let n=Ko(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Ss(e,t){let n=Ko(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Cs(e,t){e.uniform1iv(this.addr,t)}function ws(e,t){e.uniform2iv(this.addr,t)}function Ts(e,t){e.uniform3iv(this.addr,t)}function Es(e,t){e.uniform4iv(this.addr,t)}function Ds(e,t){e.uniform1uiv(this.addr,t)}function Os(e,t){e.uniform2uiv(this.addr,t)}function ks(e,t){e.uniform3uiv(this.addr,t)}function As(e,t){e.uniform4uiv(this.addr,t)}function js(e,t,n){let r=this.cache,i=t.length,a=Yo(n,i);qo(r,a)||(e.uniform1iv(this.addr,a),Jo(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||Io,a[e])}function Ms(e,t,n){let r=this.cache,i=t.length,a=Yo(n,i);qo(r,a)||(e.uniform1iv(this.addr,a),Jo(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||zo,a[e])}function Ns(e,t,n){let r=this.cache,i=t.length,a=Yo(n,i);qo(r,a)||(e.uniform1iv(this.addr,a),Jo(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Bo,a[e])}function Ps(e,t,n){let r=this.cache,i=t.length,a=Yo(n,i);qo(r,a)||(e.uniform1iv(this.addr,a),Jo(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Ro,a[e])}function Fs(e){switch(e){case 5126:return gs;case 35664:return _s;case 35665:return vs;case 35666:return ys;case 35674:return bs;case 35675:return xs;case 35676:return Ss;case 5124:case 35670:return Cs;case 35667:case 35671:return ws;case 35668:case 35672:return Ts;case 35669:case 35673:return Es;case 5125:return Ds;case 36294:return Os;case 36295:return ks;case 36296:return As;case 35678:case 36198:case 36298:case 36306:case 35682:return js;case 35679:case 36299:case 36307:return Ms;case 35680:case 36300:case 36308:case 36293:return Ns;case 36289:case 36303:case 36311:case 36292:return Ps}}var Is=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=hs(t.type)}},Ls=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Fs(t.type)}},Rs=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},zs=/(\w+)(\])?(\[|\.)?/g;function Bs(e,t){e.seq.push(t),e.map[t.id]=t}function Vs(e,t,n){let r=e.name,i=r.length;for(zs.lastIndex=0;;){let a=zs.exec(r),o=zs.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Bs(n,l===void 0?new Is(s,e,t):new Ls(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Rs(s),Bs(n,e)),n=e}}}var Hs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Vs(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Us(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Ws=37297,Gs=0;function Ks(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var qs=new H;function Js(e){Dt._getMatrix(qs,Dt.workingColorSpace,e);let t=`mat3( ${qs.elements.map(e=>e.toFixed(4))} )`;switch(Dt.getTransfer(e)){case Fe:return[t,`LinearTransferOETF`];case Ie:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Ys(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Ks(e.getShaderSource(t),r)}return i}function Xs(e,t){let n=Js(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function Zs(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Qs=new V;function $s(){return Dt.getLuminanceCoefficients(Qs),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Qs.x.toFixed(4)}, ${Qs.y.toFixed(4)}, ${Qs.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function ec(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(rc).join(`
`)}function tc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function nc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function rc(e){return e!==``}function ic(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ac(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var oc=/^[ \t]*#include +<([\w\d./]+)>/gm;function sc(e){return e.replace(oc,lc)}var cc=new Map;function lc(e,t){let n=W[t];if(n===void 0){let e=cc.get(t);if(e!==void 0)n=W[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return sc(n)}var uc=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function dc(e){return e.replace(uc,fc)}function fc(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function pc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function mc(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function hc(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function gc(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function _c(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function vc(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function yc(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=mc(n),l=hc(n),u=gc(n),d=_c(n),f=vc(n),p=ec(n),m=tc(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(rc).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(rc).join(`
`),_.length>0&&(_+=`
`)):(g=[pc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(rc).join(`
`),_=[pc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:W.tonemapping_pars_fragment,n.toneMapping===0?``:Zs(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,W.colorspace_pars_fragment,Xs(`linearToOutputTexel`,n.outputColorSpace),$s(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(rc).join(`
`)),o=sc(o),o=ic(o,n),o=ac(o,n),s=sc(s),s=ic(s,n),s=ac(s,n),o=dc(o),s=dc(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Us(i,i.VERTEX_SHADER,y),S=Us(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Ys(i,x,`vertex`),n=Ys(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Hs(i,h),T=nc(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Ws)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Gs++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var bc=0,xc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Sc(e),t.set(e,n)),n}},Sc=class{constructor(e){this.id=bc++,this.code=e,this.usedTimes=0}};function Cc(e,t,n,r,i,a,o){let s=new On,c=new xc,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=Za[C];D=e.vertexShader,O=e.fragmentShader}else D=a.vertexShader,O=a.fragmentShader,c.update(a),k=c.getVertexShaderID(a),A=c.getFragmentShaderID(a);let j=e.getRenderTarget(),M=e.state.buffers.depth.getReversed(),N=_.isInstancedMesh===!0,ee=_.isBatchedMesh===!0,P=!!a.map,F=!!a.matcap,te=!!x,ne=!!a.aoMap,re=!!a.lightMap,ie=!!a.bumpMap,ae=!!a.normalMap,oe=!!a.displacementMap,se=!!a.emissiveMap,ce=!!a.metalnessMap,le=!!a.roughnessMap,ue=a.anisotropy>0,de=a.clearcoat>0,fe=a.dispersion>0,pe=a.iridescence>0,me=a.sheen>0,I=a.transmission>0,he=ue&&!!a.anisotropyMap,ge=de&&!!a.clearcoatMap,_e=de&&!!a.clearcoatNormalMap,L=de&&!!a.clearcoatRoughnessMap,ve=pe&&!!a.iridescenceMap,R=pe&&!!a.iridescenceThicknessMap,ye=me&&!!a.sheenColorMap,be=me&&!!a.sheenRoughnessMap,xe=!!a.specularMap,Se=!!a.specularColorMap,Ce=!!a.specularIntensityMap,we=I&&!!a.transmissionMap,Te=I&&!!a.thicknessMap,Ee=!!a.gradientMap,De=!!a.alphaMap,Oe=a.alphaTest>0,ke=!!a.alphaHash,Ae=!!a.extensions,je=0;a.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(je=e.toneMapping);let Me={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:O,defines:a.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:ee,batchingColor:ee&&_._colorsTexture!==null,instancing:N,instancingColor:N&&_.instanceColor!==null,instancingMorph:N&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Pe,alphaToCoverage:!!a.alphaToCoverage,map:P,matcap:F,envMap:te,envMapMode:te&&x.mapping,envMapCubeUVHeight:S,aoMap:ne,lightMap:re,bumpMap:ie,normalMap:ae,displacementMap:f&&oe,emissiveMap:se,normalMapObjectSpace:ae&&a.normalMapType===1,normalMapTangentSpace:ae&&a.normalMapType===0,metalnessMap:ce,roughnessMap:le,anisotropy:ue,anisotropyMap:he,clearcoat:de,clearcoatMap:ge,clearcoatNormalMap:_e,clearcoatRoughnessMap:L,dispersion:fe,iridescence:pe,iridescenceMap:ve,iridescenceThicknessMap:R,sheen:me,sheenColorMap:ye,sheenRoughnessMap:be,specularMap:xe,specularColorMap:Se,specularIntensityMap:Ce,transmission:I,transmissionMap:we,thicknessMap:Te,gradientMap:Ee,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:De,alphaTest:Oe,alphaHash:ke,combine:a.combine,mapUv:P&&h(a.map.channel),aoMapUv:ne&&h(a.aoMap.channel),lightMapUv:re&&h(a.lightMap.channel),bumpMapUv:ie&&h(a.bumpMap.channel),normalMapUv:ae&&h(a.normalMap.channel),displacementMapUv:oe&&h(a.displacementMap.channel),emissiveMapUv:se&&h(a.emissiveMap.channel),metalnessMapUv:ce&&h(a.metalnessMap.channel),roughnessMapUv:le&&h(a.roughnessMap.channel),anisotropyMapUv:he&&h(a.anisotropyMap.channel),clearcoatMapUv:ge&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:_e&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:L&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:R&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:ye&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:be&&h(a.sheenRoughnessMap.channel),specularMapUv:xe&&h(a.specularMap.channel),specularColorMapUv:Se&&h(a.specularColorMap.channel),specularIntensityMapUv:Ce&&h(a.specularIntensityMap.channel),transmissionMapUv:we&&h(a.transmissionMap.channel),thicknessMapUv:Te&&h(a.thicknessMap.channel),alphaMapUv:De&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(ae||ue),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(P||De),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:M,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:je,decodeVideoTexture:P&&a.map.isVideoTexture===!0&&Dt.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:se&&a.emissiveMap.isVideoTexture===!0&&Dt.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Ae&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ae&&a.extensions.multiDraw===!0||ee)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Me.vertexUv1s=l.has(1),Me.vertexUv2s=l.has(2),Me.vertexUv3s=l.has(3),l.clear(),Me}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=Za[t];n=qr.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new yc(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function wc(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Tc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ec(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Dc(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Tc),r.length>1&&r.sort(t||Ec),i.length>1&&i.sort(t||Ec)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function Oc(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Dc,e.set(t,[i])):n>=r.length?(i=new Dc,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function kc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new V,color:new U};break;case`SpotLight`:n={position:new V,direction:new V,color:new U,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new U,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new U,groundColor:new U};break;case`RectAreaLight`:n={color:new U,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function Ac(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var jc=0;function Mc(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Nc(e){let t=new kc,n=Ac(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new _n,o=new _n;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Mc);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=G.LTC_FLOAT_1,r.rectAreaLTC2=G.LTC_FLOAT_2):(r.rectAreaLTC1=G.LTC_HALF_1,r.rectAreaLTC2=G.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=jc++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Pc(e){let t=new Nc(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function Fc(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Pc(e),t.set(n,[a])):r>=i.length?(a=new Pc(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Ic=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Lc=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Rc(e,t,n){let i=new ki,a=new B,o=new B,s=new Rt,c=new ca({depthPacking:Me}),l=new la,u={},d=n.maxTextureSize,f={0:1,1:0,2:2},p=new Xr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new B},radius:{value:4}},vertexShader:Ic,fragmentShader:Lc}),m=p.clone();m.defines.HORIZONTAL_PASS=1;let h=new Dr;h.setAttribute(`position`,new gr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new zr(h,p),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let v=this.type;this.render=function(t,n,c){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||t.length===0)return;let l=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.state;p.setBlending(0),p.buffers.depth.getReversed()===!0?p.buffers.color.setClear(0,0,0,0):p.buffers.color.setClear(1,1,1,1),p.buffers.depth.setTest(!0),p.setScissorTest(!1);let m=v!==3&&this.type===3,h=v===3&&this.type!==3;for(let l=0,u=t.length;l<u;l++){let u=t[l],f=u.shadow;if(f===void 0){console.warn(`THREE.WebGLShadowMap:`,u,`has no shadow.`);continue}if(f.autoUpdate===!1&&f.needsUpdate===!1)continue;a.copy(f.mapSize);let g=f.getFrameExtents();if(a.multiply(g),o.copy(f.mapSize),(a.x>d||a.y>d)&&(a.x>d&&(o.x=Math.floor(d/g.x),a.x=o.x*g.x,f.mapSize.x=o.x),a.y>d&&(o.y=Math.floor(d/g.y),a.y=o.y*g.y,f.mapSize.y=o.y)),f.map===null||m===!0||h===!0){let e=this.type===3?{}:{minFilter:r,magFilter:r};f.map!==null&&f.map.dispose(),f.map=new Bt(a.x,a.y,e),f.map.texture.name=u.name+`.shadowMap`,f.camera.updateProjectionMatrix()}e.setRenderTarget(f.map),e.clear();let _=f.getViewportCount();for(let e=0;e<_;e++){let t=f.getViewport(e);s.set(o.x*t.x,o.y*t.y,o.x*t.z,o.y*t.w),p.viewport(s),f.updateMatrices(u,e),i=f.getFrustum(),x(n,c,f.camera,u,this.type)}f.isPointLightShadow!==!0&&this.type===3&&y(f,c),f.needsUpdate=!1}v=this.type,_.needsUpdate=!1,e.setRenderTarget(l,u,f)};function y(n,r){let i=t.update(g);p.defines.VSM_SAMPLES!==n.blurSamples&&(p.defines.VSM_SAMPLES=n.blurSamples,m.defines.VSM_SAMPLES=n.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new Bt(a.x,a.y)),p.uniforms.shadow_pass.value=n.map.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,p,g,null),m.uniforms.shadow_pass.value=n.mapPass.texture,m.uniforms.resolution.value=n.mapSize,m.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,m,g,null)}function b(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?l:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=u[e];r===void 0&&(r={},u[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,S)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?f[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function x(n,r,a,o,s){if(n.visible===!1)return;if(n.layers.test(r.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||i.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let i=t.update(n),c=n.material;if(Array.isArray(c)){let t=i.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=b(n,d,o,s);n.onBeforeShadow(e,n,r,a,i,t,u),e.renderBufferDirect(a,null,i,t,n,u),n.onAfterShadow(e,n,r,a,i,t,u)}}}else if(c.visible){let t=b(n,c,o,s);n.onBeforeShadow(e,n,r,a,i,t,null),e.renderBufferDirect(a,null,i,t,n,null),n.onAfterShadow(e,n,r,a,i,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)x(c[e],r,a,o,s)}function S(e){e.target.removeEventListener(`dispose`,S);for(let t in u){let n=u[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var zc={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Bc(e,t){function n(){let t=!1,n=new Rt,r=null,i=new Rt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?se(e.DEPTH_TEST):ce(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=zc[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?se(e.STENCIL_TEST):ce(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new U(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,N=0,ee=e.getParameter(e.VERSION);ee.indexOf(`WebGL`)===-1?ee.indexOf(`OpenGL ES`)!==-1&&(N=parseFloat(/^OpenGL ES (\d)/.exec(ee)[1]),M=N>=2):(N=parseFloat(/^WebGL (\d)/.exec(ee)[1]),M=N>=1);let P=null,F={},te=e.getParameter(e.SCISSOR_BOX),ne=e.getParameter(e.VIEWPORT),re=new Rt().fromArray(te),ie=new Rt().fromArray(ne);function ae(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let oe={};oe[e.TEXTURE_2D]=ae(e.TEXTURE_2D,e.TEXTURE_2D,1),oe[e.TEXTURE_CUBE_MAP]=ae(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[e.TEXTURE_2D_ARRAY]=ae(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),oe[e.TEXTURE_3D]=ae(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),se(e.DEPTH_TEST),o.setFunc(3),he(!1),ge(1),se(e.CULL_FACE),me(0);function se(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function ce(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function le(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function ue(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function de(t){return m!==t&&(e.useProgram(t),m=t,!0)}let fe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};fe[103]=e.MIN,fe[104]=e.MAX;let pe={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function me(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(ce(e.BLEND),h=!1);return}if(h===!1&&(se(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(fe[n],fe[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(pe[r],pe[i],pe[o],pe[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function I(t,n){t.side===2?ce(e.CULL_FACE):se(e.CULL_FACE);let r=t.side===1;n&&(r=!r),he(r),t.blending===1&&t.transparent===!1?me(0):me(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),L(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?se(e.SAMPLE_ALPHA_TO_COVERAGE):ce(e.SAMPLE_ALPHA_TO_COVERAGE)}function he(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function ge(t){t===0?ce(e.CULL_FACE):(se(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function _e(t){t!==O&&(M&&e.lineWidth(t),O=t)}function L(t,n,r){t?(se(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):ce(e.POLYGON_OFFSET_FILL)}function ve(t){t?se(e.SCISSOR_TEST):ce(e.SCISSOR_TEST)}function R(t){t===void 0&&(t=e.TEXTURE0+j-1),P!==t&&(e.activeTexture(t),P=t)}function ye(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+j-1:P);let i=F[r];i===void 0&&(i={type:void 0,texture:void 0},F[r]=i),(i.type!==t||i.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||oe[t]),i.type=t,i.texture=n)}function be(){let t=F[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function xe(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(t){re.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),re.copy(t))}function Me(t){ie.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ie.copy(t))}function Ne(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Pe(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Fe(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},P=null,F={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new U(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,re.set(0,0,e.canvas.width,e.canvas.height),ie.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:se,disable:ce,bindFramebuffer:le,drawBuffers:ue,useProgram:de,setBlending:me,setMaterial:I,setFlipSided:he,setCullFace:ge,setLineWidth:_e,setPolygonOffset:L,setScissorTest:ve,activeTexture:R,bindTexture:ye,unbindTexture:be,compressedTexImage2D:xe,compressedTexImage3D:Se,texImage2D:ke,texImage3D:Ae,updateUBOMapping:Ne,uniformBlockBinding:Pe,texStorage2D:De,texStorage3D:Oe,texSubImage2D:Ce,texSubImage3D:we,compressedTexSubImage2D:Te,compressedTexSubImage3D:Ee,scissor:je,viewport:Me,reset:Fe}}function Vc(l,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new B,y=new WeakMap,b,x=new WeakMap,S=!1;try{S=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function C(e,t){return S?new OffscreenCanvas(e,t):yt(`canvas`)}function w(e,t,n){let r=1,i=ke(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);b===void 0&&(b=C(n,a));let o=t?C(n,a):b;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function T(e){return e.generateMipmaps}function D(e){l.generateMipmap(e)}function O(e){return e.isWebGLCubeRenderTarget?l.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?l.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?l.TEXTURE_2D_ARRAY:l.TEXTURE_2D}function k(e,t,n,r,i=!1){if(e!==null){if(l[e]!==void 0)return l[e];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let a=t;if(t===l.RED&&(n===l.FLOAT&&(a=l.R32F),n===l.HALF_FLOAT&&(a=l.R16F),n===l.UNSIGNED_BYTE&&(a=l.R8)),t===l.RED_INTEGER&&(n===l.UNSIGNED_BYTE&&(a=l.R8UI),n===l.UNSIGNED_SHORT&&(a=l.R16UI),n===l.UNSIGNED_INT&&(a=l.R32UI),n===l.BYTE&&(a=l.R8I),n===l.SHORT&&(a=l.R16I),n===l.INT&&(a=l.R32I)),t===l.RG&&(n===l.FLOAT&&(a=l.RG32F),n===l.HALF_FLOAT&&(a=l.RG16F),n===l.UNSIGNED_BYTE&&(a=l.RG8)),t===l.RG_INTEGER&&(n===l.UNSIGNED_BYTE&&(a=l.RG8UI),n===l.UNSIGNED_SHORT&&(a=l.RG16UI),n===l.UNSIGNED_INT&&(a=l.RG32UI),n===l.BYTE&&(a=l.RG8I),n===l.SHORT&&(a=l.RG16I),n===l.INT&&(a=l.RG32I)),t===l.RGB_INTEGER&&(n===l.UNSIGNED_BYTE&&(a=l.RGB8UI),n===l.UNSIGNED_SHORT&&(a=l.RGB16UI),n===l.UNSIGNED_INT&&(a=l.RGB32UI),n===l.BYTE&&(a=l.RGB8I),n===l.SHORT&&(a=l.RGB16I),n===l.INT&&(a=l.RGB32I)),t===l.RGBA_INTEGER&&(n===l.UNSIGNED_BYTE&&(a=l.RGBA8UI),n===l.UNSIGNED_SHORT&&(a=l.RGBA16UI),n===l.UNSIGNED_INT&&(a=l.RGBA32UI),n===l.BYTE&&(a=l.RGBA8I),n===l.SHORT&&(a=l.RGBA16I),n===l.INT&&(a=l.RGBA32I)),t===l.RGB&&(n===l.UNSIGNED_INT_5_9_9_9_REV&&(a=l.RGB9_E5),n===l.UNSIGNED_INT_10F_11F_11F_REV&&(a=l.R11F_G11F_B10F)),t===l.RGBA){let e=i?Fe:Dt.getTransfer(r);n===l.FLOAT&&(a=l.RGBA32F),n===l.HALF_FLOAT&&(a=l.RGBA16F),n===l.UNSIGNED_BYTE&&(a=e===`srgb`?l.SRGB8_ALPHA8:l.RGBA8),n===l.UNSIGNED_SHORT_4_4_4_4&&(a=l.RGBA4),n===l.UNSIGNED_SHORT_5_5_5_1&&(a=l.RGB5_A1)}return(a===l.R16F||a===l.R32F||a===l.RG16F||a===l.RG32F||a===l.RGBA16F||a===l.RGBA32F)&&u.get(`EXT_color_buffer_float`),a}function A(e,t){let n;return e?t===null||t===1014||t===1020?n=l.DEPTH24_STENCIL8:t===1015?n=l.DEPTH32F_STENCIL8:t===1012&&(n=l.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):t===null||t===1014||t===1020?n=l.DEPTH_COMPONENT24:t===1015?n=l.DEPTH_COMPONENT32F:t===1012&&(n=l.DEPTH_COMPONENT16),n}function j(e,t){return T(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function M(e){let t=e.target;t.removeEventListener(`dispose`,M),ee(t),t.isVideoTexture&&y.delete(t)}function N(e){let t=e.target;t.removeEventListener(`dispose`,N),F(t)}function ee(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=x.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&P(e),Object.keys(r).length===0&&x.delete(n)}f.remove(e)}function P(e){let t=f.get(e);l.deleteTexture(t.__webglTexture);let n=e.source,r=x.get(n);delete r[t.__cacheKey],h.memory.textures--}function F(e){let t=f.get(e);if(e.depthTexture&&(e.depthTexture.dispose(),f.remove(e.depthTexture)),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(t.__webglFramebuffer[e]))for(let n=0;n<t.__webglFramebuffer[e].length;n++)l.deleteFramebuffer(t.__webglFramebuffer[e][n]);else l.deleteFramebuffer(t.__webglFramebuffer[e]);t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer[e])}else{if(Array.isArray(t.__webglFramebuffer))for(let e=0;e<t.__webglFramebuffer.length;e++)l.deleteFramebuffer(t.__webglFramebuffer[e]);else l.deleteFramebuffer(t.__webglFramebuffer);if(t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer),t.__webglMultisampledFramebuffer&&l.deleteFramebuffer(t.__webglMultisampledFramebuffer),t.__webglColorRenderbuffer)for(let e=0;e<t.__webglColorRenderbuffer.length;e++)t.__webglColorRenderbuffer[e]&&l.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);t.__webglDepthRenderbuffer&&l.deleteRenderbuffer(t.__webglDepthRenderbuffer)}let n=e.textures;for(let e=0,t=n.length;e<t;e++){let t=f.get(n[e]);t.__webglTexture&&(l.deleteTexture(t.__webglTexture),h.memory.textures--),f.remove(n[e])}f.remove(e)}let te=0;function ne(){te=0}function re(){let e=te;return e>=p.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+p.maxTextures),te+=1,e}function ie(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ae(e,t){let n=f.get(e);if(e.isVideoTexture&&De(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&n.__version!==e.version){let r=e.image;if(r===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(r.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{he(n,e,t);return}}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);d.bindTexture(l.TEXTURE_2D,n.__webglTexture,l.TEXTURE0+t)}function oe(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){he(n,e,t);return}d.bindTexture(l.TEXTURE_2D_ARRAY,n.__webglTexture,l.TEXTURE0+t)}function se(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){he(n,e,t);return}d.bindTexture(l.TEXTURE_3D,n.__webglTexture,l.TEXTURE0+t)}function ce(e,t){let n=f.get(e);if(e.version>0&&n.__version!==e.version){ge(n,e,t);return}d.bindTexture(l.TEXTURE_CUBE_MAP,n.__webglTexture,l.TEXTURE0+t)}let le={[e]:l.REPEAT,[t]:l.CLAMP_TO_EDGE,[n]:l.MIRRORED_REPEAT},ue={[r]:l.NEAREST,[i]:l.NEAREST_MIPMAP_NEAREST,[a]:l.NEAREST_MIPMAP_LINEAR,[o]:l.LINEAR,[s]:l.LINEAR_MIPMAP_NEAREST,[c]:l.LINEAR_MIPMAP_LINEAR},de={512:l.NEVER,519:l.ALWAYS,513:l.LESS,515:l.LEQUAL,514:l.EQUAL,518:l.GEQUAL,516:l.GREATER,517:l.NOTEQUAL};function fe(e,t){if(t.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(t.magFilter===1006||t.magFilter===1007||t.magFilter===1005||t.magFilter===1008||t.minFilter===1006||t.minFilter===1007||t.minFilter===1005||t.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),l.texParameteri(e,l.TEXTURE_WRAP_S,le[t.wrapS]),l.texParameteri(e,l.TEXTURE_WRAP_T,le[t.wrapT]),(e===l.TEXTURE_3D||e===l.TEXTURE_2D_ARRAY)&&l.texParameteri(e,l.TEXTURE_WRAP_R,le[t.wrapR]),l.texParameteri(e,l.TEXTURE_MAG_FILTER,ue[t.magFilter]),l.texParameteri(e,l.TEXTURE_MIN_FILTER,ue[t.minFilter]),t.compareFunction&&(l.texParameteri(e,l.TEXTURE_COMPARE_MODE,l.COMPARE_REF_TO_TEXTURE),l.texParameteri(e,l.TEXTURE_COMPARE_FUNC,de[t.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(t.magFilter===1003||t.minFilter!==1005&&t.minFilter!==1008||t.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(t.anisotropy>1||f.get(t).__currentAnisotropy){let n=u.get(`EXT_texture_filter_anisotropic`);l.texParameterf(e,n.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(t.anisotropy,p.getMaxAnisotropy())),f.get(t).__currentAnisotropy=t.anisotropy}}}function pe(e,t){let n=!1;e.__webglInit===void 0&&(e.__webglInit=!0,t.addEventListener(`dispose`,M));let r=t.source,i=x.get(r);i===void 0&&(i={},x.set(r,i));let a=ie(t);if(a!==e.__cacheKey){i[a]===void 0&&(i[a]={texture:l.createTexture(),usedTimes:0},h.memory.textures++,n=!0),i[a].usedTimes++;let r=i[e.__cacheKey];r!==void 0&&(i[e.__cacheKey].usedTimes--,r.usedTimes===0&&P(t)),e.__cacheKey=a,e.__webglTexture=i[a].texture}return n}function me(e,t,n){return Math.floor(Math.floor(e/n)/t)}function I(e,t,n,r){let i=e.updateRanges;if(i.length===0)d.texSubImage2D(l.TEXTURE_2D,0,0,0,t.width,t.height,n,r,t.data);else{i.sort((e,t)=>e.start-t.start);let a=0;for(let e=1;e<i.length;e++){let n=i[a],r=i[e],o=n.start+n.count,s=me(r.start,t.width,4),c=me(n.start,t.width,4);r.start<=o+1&&s===c&&me(r.start+r.count-1,t.width,4)===s?n.count=Math.max(n.count,r.start+r.count-n.start):(++a,i[a]=r)}i.length=a+1;let o=l.getParameter(l.UNPACK_ROW_LENGTH),s=l.getParameter(l.UNPACK_SKIP_PIXELS),c=l.getParameter(l.UNPACK_SKIP_ROWS);l.pixelStorei(l.UNPACK_ROW_LENGTH,t.width);for(let e=0,a=i.length;e<a;e++){let a=i[e],o=Math.floor(a.start/4),s=Math.ceil(a.count/4),c=o%t.width,u=Math.floor(o/t.width),f=s;l.pixelStorei(l.UNPACK_SKIP_PIXELS,c),l.pixelStorei(l.UNPACK_SKIP_ROWS,u),d.texSubImage2D(l.TEXTURE_2D,0,c,u,f,1,n,r,t.data)}e.clearUpdateRanges(),l.pixelStorei(l.UNPACK_ROW_LENGTH,o),l.pixelStorei(l.UNPACK_SKIP_PIXELS,s),l.pixelStorei(l.UNPACK_SKIP_ROWS,c)}}function he(e,t,n){let r=l.TEXTURE_2D;(t.isDataArrayTexture||t.isCompressedArrayTexture)&&(r=l.TEXTURE_2D_ARRAY),t.isData3DTexture&&(r=l.TEXTURE_3D);let i=pe(e,t),a=t.source;d.bindTexture(r,e.__webglTexture,l.TEXTURE0+n);let o=f.get(a);if(a.version!==o.__version||i===!0){d.activeTexture(l.TEXTURE0+n);let e=Dt.getPrimaries(Dt.workingColorSpace),s=t.colorSpace===``?null:Dt.getPrimaries(t.colorSpace),c=t.colorSpace===``||e===s?l.NONE:l.BROWSER_DEFAULT_WEBGL;l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),l.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),l.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,c);let u=w(t.image,!1,p.maxTextureSize);u=Oe(t,u);let f=m.convert(t.format,t.colorSpace),h=m.convert(t.type),g=k(t.internalFormat,f,h,t.colorSpace,t.isVideoTexture);fe(r,t);let _,v=t.mipmaps,y=t.isVideoTexture!==!0,b=o.__version===void 0||i===!0,x=a.dataReady,S=j(t,u);if(t.isDepthTexture)g=A(t.format===E,t.type),b&&(y?d.texStorage2D(l.TEXTURE_2D,1,g,u.width,u.height):d.texImage2D(l.TEXTURE_2D,0,g,u.width,u.height,0,f,h,null));else if(t.isDataTexture){if(v.length>0){y&&b&&d.texStorage2D(l.TEXTURE_2D,S,g,v[0].width,v[0].height);for(let e=0,t=v.length;e<t;e++)_=v[e],y?x&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,_.width,_.height,f,h,_.data):d.texImage2D(l.TEXTURE_2D,e,g,_.width,_.height,0,f,h,_.data);t.generateMipmaps=!1}else y?(b&&d.texStorage2D(l.TEXTURE_2D,S,g,u.width,u.height),x&&I(t,u,f,h)):d.texImage2D(l.TEXTURE_2D,0,g,u.width,u.height,0,f,h,u.data)}else if(t.isCompressedTexture){if(t.isCompressedArrayTexture){y&&b&&d.texStorage3D(l.TEXTURE_2D_ARRAY,S,g,v[0].width,v[0].height,u.depth);for(let e=0,n=v.length;e<n;e++)if(_=v[e],t.format!==1023){if(f!==null){if(y){if(x){if(t.layerUpdates.size>0){let n=qa(_.width,_.height,t.format,t.type);for(let r of t.layerUpdates){let t=_.data.subarray(r*n/_.data.BYTES_PER_ELEMENT,(r+1)*n/_.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,e,0,0,r,_.width,_.height,1,f,t)}t.clearLayerUpdates()}else d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,e,0,0,0,_.width,_.height,u.depth,f,_.data)}}else d.compressedTexImage3D(l.TEXTURE_2D_ARRAY,e,g,_.width,_.height,u.depth,0,_.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else y?x&&d.texSubImage3D(l.TEXTURE_2D_ARRAY,e,0,0,0,_.width,_.height,u.depth,f,h,_.data):d.texImage3D(l.TEXTURE_2D_ARRAY,e,g,_.width,_.height,u.depth,0,f,h,_.data)}else{y&&b&&d.texStorage2D(l.TEXTURE_2D,S,g,v[0].width,v[0].height);for(let e=0,n=v.length;e<n;e++)_=v[e],t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,_.width,_.height,f,h,_.data):d.texImage2D(l.TEXTURE_2D,e,g,_.width,_.height,0,f,h,_.data):f===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_2D,e,0,0,_.width,_.height,f,_.data):d.compressedTexImage2D(l.TEXTURE_2D,e,g,_.width,_.height,0,_.data)}}else if(t.isDataArrayTexture){if(y){if(b&&d.texStorage3D(l.TEXTURE_2D_ARRAY,S,g,u.width,u.height,u.depth),x){if(t.layerUpdates.size>0){let e=qa(u.width,u.height,t.format,t.type);for(let n of t.layerUpdates){let t=u.data.subarray(n*e/u.data.BYTES_PER_ELEMENT,(n+1)*e/u.data.BYTES_PER_ELEMENT);d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,n,u.width,u.height,1,f,h,t)}t.clearLayerUpdates()}else d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,0,u.width,u.height,u.depth,f,h,u.data)}}else d.texImage3D(l.TEXTURE_2D_ARRAY,0,g,u.width,u.height,u.depth,0,f,h,u.data)}else if(t.isData3DTexture)y?(b&&d.texStorage3D(l.TEXTURE_3D,S,g,u.width,u.height,u.depth),x&&d.texSubImage3D(l.TEXTURE_3D,0,0,0,0,u.width,u.height,u.depth,f,h,u.data)):d.texImage3D(l.TEXTURE_3D,0,g,u.width,u.height,u.depth,0,f,h,u.data);else if(t.isFramebufferTexture){if(b){if(y)d.texStorage2D(l.TEXTURE_2D,S,g,u.width,u.height);else{let e=u.width,t=u.height;for(let n=0;n<S;n++)d.texImage2D(l.TEXTURE_2D,n,g,e,t,0,f,h,null),e>>=1,t>>=1}}}else if(v.length>0){if(y&&b){let e=ke(v[0]);d.texStorage2D(l.TEXTURE_2D,S,g,e.width,e.height)}for(let e=0,t=v.length;e<t;e++)_=v[e],y?x&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f,h,_):d.texImage2D(l.TEXTURE_2D,e,g,f,h,_);t.generateMipmaps=!1}else if(y){if(b){let e=ke(u);d.texStorage2D(l.TEXTURE_2D,S,g,e.width,e.height)}x&&d.texSubImage2D(l.TEXTURE_2D,0,0,0,f,h,u)}else d.texImage2D(l.TEXTURE_2D,0,g,f,h,u);T(t)&&D(r),o.__version=a.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function ge(e,t,n){if(t.image.length!==6)return;let r=pe(e,t),i=t.source;d.bindTexture(l.TEXTURE_CUBE_MAP,e.__webglTexture,l.TEXTURE0+n);let a=f.get(i);if(i.version!==a.__version||r===!0){d.activeTexture(l.TEXTURE0+n);let e=Dt.getPrimaries(Dt.workingColorSpace),o=t.colorSpace===``?null:Dt.getPrimaries(t.colorSpace),s=t.colorSpace===``||e===o?l.NONE:l.BROWSER_DEFAULT_WEBGL;l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),l.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),l.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,s);let c=t.isCompressedTexture||t.image[0].isCompressedTexture,u=t.image[0]&&t.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!c&&!u?f[e]=w(t.image[e],!0,p.maxCubemapSize):f[e]=u?t.image[e].image:t.image[e],f[e]=Oe(t,f[e]);let h=f[0],g=m.convert(t.format,t.colorSpace),_=m.convert(t.type),v=k(t.internalFormat,g,_,t.colorSpace),y=t.isVideoTexture!==!0,b=a.__version===void 0||r===!0,x=i.dataReady,S=j(t,h);fe(l.TEXTURE_CUBE_MAP,t);let C;if(c){y&&b&&d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let e=0;e<6;e++){C=f[e].mipmaps;for(let n=0;n<C.length;n++){let r=C[n];t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,_,r.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,g,_,r.data):g===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,r.data):d.compressedTexImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,r.data)}}}else{if(C=t.mipmaps,y&&b){C.length>0&&S++;let e=ke(f[0]);d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,e.width,e.height)}for(let e=0;e<6;e++)if(u){y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,f[e].width,f[e].height,g,_,f[e].data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,f[e].width,f[e].height,0,g,_,f[e].data);for(let t=0;t<C.length;t++){let n=C[t].image[e].image;y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,n.width,n.height,g,_,n.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,n.width,n.height,0,g,_,n.data)}}else{y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,g,_,f[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,g,_,f[e]);for(let t=0;t<C.length;t++){let n=C[t];y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,g,_,n.image[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,g,_,n.image[e])}}}T(t)&&D(l.TEXTURE_CUBE_MAP),a.__version=i.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function _e(e,t,n,r,i,a){let o=m.convert(n.format,n.colorSpace),s=m.convert(n.type),c=k(n.internalFormat,o,s,n.colorSpace),u=f.get(t),p=f.get(n);if(p.__renderTarget=t,!u.__hasExternalTextures){let e=Math.max(1,t.width>>a),n=Math.max(1,t.height>>a);i===l.TEXTURE_3D||i===l.TEXTURE_2D_ARRAY?d.texImage3D(i,a,c,e,n,t.depth,0,o,s,null):d.texImage2D(i,a,c,e,n,0,o,s,null)}d.bindFramebuffer(l.FRAMEBUFFER,e),Ee(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,r,i,p.__webglTexture,0,Te(t)):(i===l.TEXTURE_2D||i>=l.TEXTURE_CUBE_MAP_POSITIVE_X&&i<=l.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&l.framebufferTexture2D(l.FRAMEBUFFER,r,i,p.__webglTexture,a),d.bindFramebuffer(l.FRAMEBUFFER,null)}function L(e,t,n){if(l.bindRenderbuffer(l.RENDERBUFFER,e),t.depthBuffer){let r=t.depthTexture,i=r&&r.isDepthTexture?r.type:null,a=A(t.stencilBuffer,i),o=t.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,s=Te(t);Ee(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,s,a,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,s,a,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,a,t.width,t.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,o,l.RENDERBUFFER,e)}else{let e=t.textures;for(let r=0;r<e.length;r++){let i=e[r],a=m.convert(i.format,i.colorSpace),o=m.convert(i.type),s=k(i.internalFormat,a,o,i.colorSpace),c=Te(t);n&&Ee(t)===!1?l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,t.width,t.height):Ee(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,c,s,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,s,t.width,t.height)}}l.bindRenderbuffer(l.RENDERBUFFER,null)}function ve(e,t){if(t&&t.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(d.bindFramebuffer(l.FRAMEBUFFER,e),!(t.depthTexture&&t.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let n=f.get(t.depthTexture);n.__renderTarget=t,(!n.__webglTexture||t.depthTexture.image.width!==t.width||t.depthTexture.image.height!==t.height)&&(t.depthTexture.image.width=t.width,t.depthTexture.image.height=t.height,t.depthTexture.needsUpdate=!0),ae(t.depthTexture,0);let r=n.__webglTexture,i=Te(t);if(t.depthTexture.format===1026)Ee(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,l.DEPTH_ATTACHMENT,l.TEXTURE_2D,r,0,i):l.framebufferTexture2D(l.FRAMEBUFFER,l.DEPTH_ATTACHMENT,l.TEXTURE_2D,r,0);else if(t.depthTexture.format===1027)Ee(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,l.DEPTH_STENCIL_ATTACHMENT,l.TEXTURE_2D,r,0,i):l.framebufferTexture2D(l.FRAMEBUFFER,l.DEPTH_STENCIL_ATTACHMENT,l.TEXTURE_2D,r,0);else throw Error(`Unknown depthTexture format`)}function R(e){let t=f.get(e),n=e.isWebGLCubeRenderTarget===!0;if(t.__boundDepthTexture!==e.depthTexture){let n=e.depthTexture;if(t.__depthDisposeCallback&&t.__depthDisposeCallback(),n){let e=()=>{delete t.__boundDepthTexture,delete t.__depthDisposeCallback,n.removeEventListener(`dispose`,e)};n.addEventListener(`dispose`,e),t.__depthDisposeCallback=e}t.__boundDepthTexture=n}if(e.depthTexture&&!t.__autoAllocateDepthBuffer){if(n)throw Error(`target.depthTexture not supported in Cube render targets`);let r=e.texture.mipmaps;r&&r.length>0?ve(t.__webglFramebuffer[0],e):ve(t.__webglFramebuffer,e)}else if(n){t.__webglDepthbuffer=[];for(let n=0;n<6;n++)if(d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[n]),t.__webglDepthbuffer[n]===void 0)t.__webglDepthbuffer[n]=l.createRenderbuffer(),L(t.__webglDepthbuffer[n],e,!1);else{let r=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,i=t.__webglDepthbuffer[n];l.bindRenderbuffer(l.RENDERBUFFER,i),l.framebufferRenderbuffer(l.FRAMEBUFFER,r,l.RENDERBUFFER,i)}}else{let n=e.texture.mipmaps;if(n&&n.length>0?d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[0]):d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer),t.__webglDepthbuffer===void 0)t.__webglDepthbuffer=l.createRenderbuffer(),L(t.__webglDepthbuffer,e,!1);else{let n=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,r=t.__webglDepthbuffer;l.bindRenderbuffer(l.RENDERBUFFER,r),l.framebufferRenderbuffer(l.FRAMEBUFFER,n,l.RENDERBUFFER,r)}}d.bindFramebuffer(l.FRAMEBUFFER,null)}function ye(e,t,n){let r=f.get(e);t!==void 0&&_e(r.__webglFramebuffer,e,e.texture,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,0),n!==void 0&&R(e)}function be(e){let t=e.texture,n=f.get(e),r=f.get(t);e.addEventListener(`dispose`,N);let i=e.textures,a=e.isWebGLCubeRenderTarget===!0,o=i.length>1;if(o||(r.__webglTexture===void 0&&(r.__webglTexture=l.createTexture()),r.__version=t.version,h.memory.textures++),a){n.__webglFramebuffer=[];for(let e=0;e<6;e++)if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer[e]=[];for(let r=0;r<t.mipmaps.length;r++)n.__webglFramebuffer[e][r]=l.createFramebuffer()}else n.__webglFramebuffer[e]=l.createFramebuffer()}else{if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer=[];for(let e=0;e<t.mipmaps.length;e++)n.__webglFramebuffer[e]=l.createFramebuffer()}else n.__webglFramebuffer=l.createFramebuffer();if(o)for(let e=0,t=i.length;e<t;e++){let t=f.get(i[e]);t.__webglTexture===void 0&&(t.__webglTexture=l.createTexture(),h.memory.textures++)}if(e.samples>0&&Ee(e)===!1){n.__webglMultisampledFramebuffer=l.createFramebuffer(),n.__webglColorRenderbuffer=[],d.bindFramebuffer(l.FRAMEBUFFER,n.__webglMultisampledFramebuffer);for(let t=0;t<i.length;t++){let r=i[t];n.__webglColorRenderbuffer[t]=l.createRenderbuffer(),l.bindRenderbuffer(l.RENDERBUFFER,n.__webglColorRenderbuffer[t]);let a=m.convert(r.format,r.colorSpace),o=m.convert(r.type),s=k(r.internalFormat,a,o,r.colorSpace,e.isXRRenderTarget===!0),c=Te(e);l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,e.width,e.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+t,l.RENDERBUFFER,n.__webglColorRenderbuffer[t])}l.bindRenderbuffer(l.RENDERBUFFER,null),e.depthBuffer&&(n.__webglDepthRenderbuffer=l.createRenderbuffer(),L(n.__webglDepthRenderbuffer,e,!0)),d.bindFramebuffer(l.FRAMEBUFFER,null)}}if(a){d.bindTexture(l.TEXTURE_CUBE_MAP,r.__webglTexture),fe(l.TEXTURE_CUBE_MAP,t);for(let r=0;r<6;r++)if(t.mipmaps&&t.mipmaps.length>0)for(let i=0;i<t.mipmaps.length;i++)_e(n.__webglFramebuffer[r][i],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else _e(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);T(t)&&D(l.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(o){for(let t=0,r=i.length;t<r;t++){let r=i[t],a=f.get(r),o=l.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(o=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(o,a.__webglTexture),fe(o,r),_e(n.__webglFramebuffer,e,r,l.COLOR_ATTACHMENT0+t,o,0),T(r)&&D(o)}d.unbindTexture()}else{let i=l.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(i,r.__webglTexture),fe(i,t),t.mipmaps&&t.mipmaps.length>0)for(let r=0;r<t.mipmaps.length;r++)_e(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,i,r);else _e(n.__webglFramebuffer,e,t,l.COLOR_ATTACHMENT0,i,0);T(t)&&D(i),d.unbindTexture()}e.depthBuffer&&R(e)}function xe(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(T(r)){let t=O(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),D(t),d.unbindTexture()}}}let Se=[],Ce=[];function we(e){if(e.samples>0){if(Ee(e)===!1){let t=e.textures,n=e.width,r=e.height,i=l.COLOR_BUFFER_BIT,a=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,o=f.get(e),s=t.length>1;if(s)for(let e=0;e<t.length;e++)d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,null),d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,null,0);d.bindFramebuffer(l.READ_FRAMEBUFFER,o.__webglMultisampledFramebuffer);let c=e.texture.mipmaps;c&&c.length>0?d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer[0]):d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer);for(let c=0;c<t.length;c++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(i|=l.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(i|=l.STENCIL_BUFFER_BIT)),s){l.framebufferRenderbuffer(l.READ_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.RENDERBUFFER,o.__webglColorRenderbuffer[c]);let e=f.get(t[c]).__webglTexture;l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,e,0)}l.blitFramebuffer(0,0,n,r,0,0,n,r,i,l.NEAREST),_===!0&&(Se.length=0,Ce.length=0,Se.push(l.COLOR_ATTACHMENT0+c),e.depthBuffer&&e.resolveDepthBuffer===!1&&(Se.push(a),Ce.push(a),l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,Ce)),l.invalidateFramebuffer(l.READ_FRAMEBUFFER,Se))}if(d.bindFramebuffer(l.READ_FRAMEBUFFER,null),d.bindFramebuffer(l.DRAW_FRAMEBUFFER,null),s)for(let e=0;e<t.length;e++){d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,o.__webglColorRenderbuffer[e]);let n=f.get(t[e]).__webglTexture;d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,n,0)}d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.resolveDepthBuffer===!1&&_){let t=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,[t])}}}function Te(e){return Math.min(p.maxSamples,e.samples)}function Ee(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function De(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Oe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Dt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function ke(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=re,this.resetTextureUnits=ne,this.setTexture2D=ae,this.setTexture2DArray=oe,this.setTexture3D=se,this.setTextureCube=ce,this.rebindTextures=ye,this.setupRenderTarget=be,this.updateRenderTargetMipmap=xe,this.updateMultisampleRenderTarget=we,this.setupDepthRenderbuffer=R,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=Ee}function Hc(e,t){function n(n,r=``){let i,a=Dt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Uc=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Wc=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Gc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Qi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Xr({vertexShader:Uc,fragmentShader:Wc,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new zr(new ia(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Kc=class extends Ve{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,u=null,d=null,f=null,p=null,h=null,g=typeof XRWebGLBinding<`u`,_=new Gc,v={},b=t.getContextAttributes(),x=null,S=null,C=[],D=[],O=new B,k=null,A=new ti;A.viewport=new Rt;let j=new ti;j.viewport=new Rt;let M=[A,j],N=new Na,ee=null,P=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new li,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new li,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new li,C[e]=t),t.getHandSpace()};function F(e){let t=D.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function te(){r.removeEventListener(`select`,F),r.removeEventListener(`selectstart`,F),r.removeEventListener(`selectend`,F),r.removeEventListener(`squeeze`,F),r.removeEventListener(`squeezestart`,F),r.removeEventListener(`squeezeend`,F),r.removeEventListener(`end`,te),r.removeEventListener(`inputsourceschange`,ne);for(let e=0;e<C.length;e++){let t=D[e];t!==null&&(D[e]=null,C[e].disconnect(t))}ee=null,P=null,_.reset();for(let e in v)delete v[e];e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,ue.stop(),n.isPresenting=!1,e.setPixelRatio(k),e.setSize(O.width,O.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,F),r.addEventListener(`selectstart`,F),r.addEventListener(`selectend`,F),r.addEventListener(`squeeze`,F),r.addEventListener(`squeezestart`,F),r.addEventListener(`squeezeend`,F),r.addEventListener(`end`,te),r.addEventListener(`inputsourceschange`,ne),b.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(O),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?E:T,a=b.stencil?y:m);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Bt(f.textureWidth,f.textureHeight,{format:w,type:l,depthTexture:new Zi(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Bt(p.framebufferWidth,p.framebufferHeight,{format:w,type:l,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ue.setContext(r),ue.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function ne(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=D.indexOf(n);r>=0&&(D[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=D.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=D.length){D.push(n),r=e;break}else if(D[e]===null){D[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let re=new V,ie=new V;function ae(e,t,n){re.setFromMatrixPosition(t.matrixWorld),ie.setFromMatrixPosition(n.matrixWorld);let r=re.distanceTo(ie),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function oe(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),N.near=j.near=A.near=t,N.far=j.far=A.far=n,(ee!==N.near||P!==N.far)&&(r.updateRenderState({depthNear:N.near,depthFar:N.far}),ee=N.near,P=N.far),N.layers.mask=e.layers.mask|6,A.layers.mask=N.layers.mask&3,j.layers.mask=N.layers.mask&5;let i=e.parent,a=N.cameras;oe(N,i);for(let e=0;e<a.length;e++)oe(a[e],i);a.length===2?ae(N,A,j):N.projectionMatrix.copy(A.projectionMatrix),se(e,N,i)};function se(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Ge*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(N)},this.getCameraTexture=function(e){return v[e]};let ce=null;function le(t,i){if(u=i.getViewerPose(c||a),h=i,u!==null){let t=u.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==N.cameras.length&&(N.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=M[n];o===void 0&&(o=new ti,o.layers.enable(n),o.viewport=new Rt,M[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(N.matrix.copy(o.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),i===!0&&N.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Qi,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=D[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}ce&&ce(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let ue=new Ya;ue.setAnimationLoop(le),this.setAnimationLoop=function(e){ce=e},this.dispose=function(){}}},qc=new Dn,Jc=new _n;function Yc(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Kr(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,qc.copy(o),qc.x*=-1,qc.y*=-1,qc.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(qc.y*=-1,qc.z*=-1),e.envMapRotation.value.setFromMatrix4(Jc.makeRotationFromEuler(qc)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Xc(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Zc=class{constructor(e={}){let{canvas:t=bt(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);m=n.getContextAttributes().alpha}else m=a;let h=new Uint32Array(4),_=new Int32Array(4),v=null,y=null,b=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let S=this,C=!1;this._outputColorSpace=Ne;let w=0,T=0,E=null,D=-1,O=null,k=new Rt,A=new Rt,j=null,M=new U(0),N=0,ee=t.width,P=t.height,F=1,te=null,ne=null,re=new Rt(0,0,ee,P),ie=new Rt(0,0,ee,P),ae=!1,oe=new ki,se=!1,ce=!1,le=new _n,ue=new V,de=new Rt,fe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},pe=!1;function me(){return E===null?F:1}let I=n;function he(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:f};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,Ue,!1),t.addEventListener(`webglcontextrestored`,We,!1),t.addEventListener(`webglcontextcreationerror`,Ge,!1),I===null){let t=`webgl2`;if(I=he(t,e),I===null)throw he(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let ge,_e,L,ve,R,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Fe,Ie,Le,Re,ze;function Ve(){ge=new Ao(I),ge.init(),Le=new Hc(I,ge),_e=new io(I,ge,e,Le),L=new Bc(I,ge),_e.reversedDepthBuffer&&p&&L.buffers.depth.setReversed(!0),ve=new No(I),R=new wc,ye=new Vc(I,ge,L,R,_e,Le,ve),be=new oo(S),xe=new ko(S),Se=new Xa(I),Re=new no(I,Se),Ce=new jo(I,Se,ve,Re),we=new Fo(I,Ce,Se,ve),Me=new Po(I,_e,ye),ke=new ao(R),Te=new Cc(S,be,xe,ge,_e,Re,ke),Ee=new Yc(S,R),De=new Oc,Oe=new Fc(ge),je=new to(S,be,xe,L,we,m,s),Ae=new Rc(S,we,_e),ze=new Xc(I,ve,_e,L),Fe=new ro(I,ge,ve),Ie=new Mo(I,ge,ve),ve.programs=Te.programs,S.capabilities=_e,S.extensions=ge,S.properties=R,S.renderLists=De,S.shadowMap=Ae,S.state=L,S.info=ve}Ve();let He=new Kc(S,I);this.xr=He,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let e=ge.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=ge.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return F},this.setPixelRatio=function(e){e!==void 0&&(F=e,this.setSize(ee,P,!1))},this.getSize=function(e){return e.set(ee,P)},this.setSize=function(e,n,r=!0){if(He.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}ee=e,P=n,t.width=Math.floor(e*F),t.height=Math.floor(n*F),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ee*F,P*F).floor()},this.setDrawingBufferSize=function(e,n,r){ee=e,P=n,F=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(k)},this.getViewport=function(e){return e.copy(re)},this.setViewport=function(e,t,n,r){e.isVector4?re.set(e.x,e.y,e.z,e.w):re.set(e,t,n,r),L.viewport(k.copy(re).multiplyScalar(F).round())},this.getScissor=function(e){return e.copy(ie)},this.setScissor=function(e,t,n,r){e.isVector4?ie.set(e.x,e.y,e.z,e.w):ie.set(e,t,n,r),L.scissor(A.copy(ie).multiplyScalar(F).round())},this.getScissorTest=function(){return ae},this.setScissorTest=function(e){L.setScissorTest(ae=e)},this.setOpaqueSort=function(e){te=e},this.setTransparentSort=function(e){ne=e},this.getClearColor=function(e){return e.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor(...arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(E!==null){let t=E.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=E.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=je.getClearColor(),r=je.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(h[0]=i,h[1]=a,h[2]=o,h[3]=r,I.clearBufferuiv(I.COLOR,0,h)):(_[0]=i,_[1]=a,_[2]=o,_[3]=r,I.clearBufferiv(I.COLOR,0,_))}else r|=I.COLOR_BUFFER_BIT}t&&(r|=I.DEPTH_BUFFER_BIT),n&&(r|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ue,!1),t.removeEventListener(`webglcontextrestored`,We,!1),t.removeEventListener(`webglcontextcreationerror`,Ge,!1),je.dispose(),De.dispose(),Oe.dispose(),R.dispose(),be.dispose(),xe.dispose(),we.dispose(),Re.dispose(),ze.dispose(),Te.dispose(),He.dispose(),He.removeEventListener(`sessionstart`,Ze),He.removeEventListener(`sessionend`,Qe),$e.stop()};function Ue(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),C=!0}function We(){console.log(`THREE.WebGLRenderer: Context Restored.`),C=!1;let e=ve.autoReset,t=Ae.enabled,n=Ae.autoUpdate,r=Ae.needsUpdate,i=Ae.type;Ve(),ve.autoReset=e,Ae.enabled=t,Ae.autoUpdate=n,Ae.needsUpdate=r,Ae.type=i}function Ge(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ke(e){let t=e.target;t.removeEventListener(`dispose`,Ke),z(t)}function z(e){qe(e),R.remove(e)}function qe(e){let t=R.get(e).programs;t!==void 0&&(t.forEach(function(e){Te.releaseProgram(e)}),e.isShaderMaterial&&Te.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=fe);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=ct(e,t,n,r,i);L.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ce.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Re.setup(i,r,s,n,c);let h,g=Fe;if(c!==null&&(h=Se.get(c),g=Ie,g.setIndex(h)),i.isMesh)r.wireframe===!0?(L.setLineWidth(r.wireframeLinewidth*me()),g.setMode(I.LINES)):g.setMode(I.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),L.setLineWidth(e*me()),i.isLineSegments?g.setMode(I.LINES):i.isLineLoop?g.setMode(I.LINE_LOOP):g.setMode(I.LINE_STRIP)}else i.isPoints?g.setMode(I.POINTS):i.isSprite&&g.setMode(I.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)St(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(ge.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Se.get(c).bytesPerElement:1,o=R.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(I,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Je(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,at(e,t,n),e.side=0,e.needsUpdate=!0,at(e,t,n),e.side=2):at(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),y=Oe.get(n),y.init(t),x.push(y),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(y.pushLight(e),e.castShadow&&y.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(y.pushLight(e),e.castShadow&&y.pushShadow(e))}),y.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Je(a,n,e),r.add(a)}else Je(t,n,e),r.add(t)}}),y=x.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){R.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}ge.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Ye=null;function Xe(e){Ye&&Ye(e)}function Ze(){$e.stop()}function Qe(){$e.start()}let $e=new Ya;$e.setAnimationLoop(Xe),typeof self<`u`&&$e.setContext(self),this.setAnimationLoop=function(e){Ye=e,He.setAnimationLoop(e),e===null?$e.stop():$e.start()},He.addEventListener(`sessionstart`,Ze),He.addEventListener(`sessionend`,Qe),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(C===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),He.enabled===!0&&He.isPresenting===!0&&(He.cameraAutoUpdate===!0&&He.updateCamera(t),t=He.getCamera()),e.isScene===!0&&e.onBeforeRender(S,e,t,E),y=Oe.get(e,x.length),y.init(t),x.push(y),le.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),oe.setFromProjectionMatrix(le,Be,t.reversedDepth),ce=this.localClippingEnabled,se=ke.init(this.clippingPlanes,ce),v=De.get(e,b.length),v.init(),b.push(v),He.enabled===!0&&He.isPresenting===!0){let e=S.xr.getDepthSensingMesh();e!==null&&et(e,t,-1/0,S.sortObjects)}et(e,t,0,S.sortObjects),v.finish(),S.sortObjects===!0&&v.sort(te,ne),pe=He.enabled===!1||He.isPresenting===!1||He.hasDepthSensing()===!1,pe&&je.addToRenderList(v,e),this.info.render.frame++,se===!0&&ke.beginShadows();let n=y.state.shadowsArray;Ae.render(n,e,t),se===!0&&ke.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=v.opaque,i=v.transmissive;if(y.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];nt(r,i,e,a)}pe&&je.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];tt(v,e,r,r.viewport)}}else i.length>0&&nt(r,i,e,t),pe&&je.render(e),tt(v,e,t);E!==null&&T===0&&(ye.updateMultisampleRenderTarget(E),ye.updateRenderTargetMipmap(E)),e.isScene===!0&&e.onAfterRender(S,e,t),Re.resetDefaultState(),D=-1,O=null,x.pop(),x.length>0?(y=x[x.length-1],se===!0&&ke.setGlobalState(S.clippingPlanes,y.state.camera)):y=null,b.pop(),v=b.length>0?b[b.length-1]:null};function et(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)y.pushLight(e),e.castShadow&&y.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||oe.intersectsSprite(e)){r&&de.setFromMatrixPosition(e.matrixWorld).applyMatrix4(le);let t=we.update(e),i=e.material;i.visible&&v.push(e,t,i,n,de.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||oe.intersectsObject(e))){let t=we.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),de.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),de.copy(e.boundingSphere.center)),de.applyMatrix4(e.matrixWorld).applyMatrix4(le)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&v.push(e,t,s,n,de.z,o)}}else i.visible&&v.push(e,t,i,n,de.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)et(i[e],t,n,r)}function tt(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;y.setupLightsView(n),se===!0&&ke.setGlobalState(S.clippingPlanes,n),r&&L.viewport(k.copy(r)),i.length>0&&rt(i,t,n),a.length>0&&rt(a,t,n),o.length>0&&rt(o,t,n),L.buffers.depth.setTest(!0),L.buffers.depth.setMask(!0),L.buffers.color.setMask(!0),L.setPolygonOffset(!1)}function nt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;y.state.transmissionRenderTarget[r.id]===void 0&&(y.state.transmissionRenderTarget[r.id]=new Bt(1,1,{generateMipmaps:!0,type:ge.has(`EXT_color_buffer_half_float`)||ge.has(`EXT_color_buffer_float`)?g:l,minFilter:c,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Dt.workingColorSpace}));let a=y.state.transmissionRenderTarget[r.id],o=r.viewport||k;a.setSize(o.z*S.transmissionResolutionScale,o.w*S.transmissionResolutionScale);let s=S.getRenderTarget(),u=S.getActiveCubeFace(),d=S.getActiveMipmapLevel();S.setRenderTarget(a),S.getClearColor(M),N=S.getClearAlpha(),N<1&&S.setClearColor(16777215,.5),S.clear(),pe&&je.render(n);let f=S.toneMapping;S.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),y.setupLightsView(r),se===!0&&ke.setGlobalState(S.clippingPlanes,r),rt(e,n,r),ye.updateMultisampleRenderTarget(a),ye.updateRenderTargetMipmap(a),ge.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,it(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(ye.updateMultisampleRenderTarget(a),ye.updateRenderTargetMipmap(a))}S.setRenderTarget(s,u,d),S.setClearColor(M,N),p!==void 0&&(r.viewport=p),S.toneMapping=f}function rt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&it(o,t,n,s,l,c)}}function it(e,t,n,r,i,a){e.onBeforeRender(S,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(S,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,S.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,S.renderBufferDirect(n,t,r,i,e,a),i.side=2):S.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(S,t,n,r,i,a)}function at(e,t,n){t.isScene!==!0&&(t=fe);let r=R.get(e),i=y.state.lights,a=y.state.shadowsArray,o=i.state.version,s=Te.getParameters(e,i.state,a,t,n),c=Te.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?xe:be).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ke),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return st(e,s),u}else s.uniforms=Te.getUniforms(e),e.onBeforeCompile(s,S),u=Te.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=ke.uniform),st(e,s),r.needsLights=ut(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function ot(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Hs.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function st(e,t){let n=R.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ct(e,t,n,r,i){t.isScene!==!0&&(t=fe),ye.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=E===null?S.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Pe,c=(r.isMeshStandardMaterial?xe:be).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(m=S.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,g=h===void 0?0:h.length,_=R.get(r),v=y.state.lights;if(se===!0&&(ce===!0||e!==O)){let t=e===O&&r.id===D;ke.setState(r,e,t)}let b=!1;r.version===_.__version?_.needsLights&&_.lightsStateVersion!==v.state.version?b=!0:_.outputColorSpace===s?i.isBatchedMesh&&_.batching===!1||!i.isBatchedMesh&&_.batching===!0||i.isBatchedMesh&&_.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&_.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&_.instancing===!1||!i.isInstancedMesh&&_.instancing===!0||i.isSkinnedMesh&&_.skinning===!1||!i.isSkinnedMesh&&_.skinning===!0||i.isInstancedMesh&&_.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&_.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&_.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&_.instancingMorph===!1&&i.morphTexture!==null?b=!0:_.envMap===c?r.fog===!0&&_.fog!==a||_.numClippingPlanes!==void 0&&(_.numClippingPlanes!==ke.numPlanes||_.numIntersection!==ke.numIntersection)?b=!0:_.vertexAlphas===l&&_.vertexTangents===u&&_.morphTargets===d&&_.morphNormals===f&&_.morphColors===p&&_.toneMapping===m?_.morphTargetsCount!==g&&(b=!0):b=!0:b=!0:b=!0:(b=!0,_.__version=r.version);let x=_.currentProgram;b===!0&&(x=at(r,t,i));let C=!1,w=!1,T=!1,k=x.getUniforms(),A=_.uniforms;if(L.useProgram(x.program)&&(C=!0,w=!0,T=!0),r.id!==D&&(D=r.id,w=!0),C||O!==e){L.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),k.setValue(I,`projectionMatrix`,e.projectionMatrix),k.setValue(I,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(I,ue.setFromMatrixPosition(e.matrixWorld)),_e.logarithmicDepthBuffer&&k.setValue(I,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(I,`isOrthographic`,e.isOrthographicCamera===!0),O!==e&&(O=e,w=!0,T=!0)}if(i.isSkinnedMesh){k.setOptional(I,i,`bindMatrix`),k.setOptional(I,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(I,`boneTexture`,e.boneTexture,ye))}i.isBatchedMesh&&(k.setOptional(I,i,`batchingTexture`),k.setValue(I,`batchingTexture`,i._matricesTexture,ye),k.setOptional(I,i,`batchingIdTexture`),k.setValue(I,`batchingIdTexture`,i._indirectTexture,ye),k.setOptional(I,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(I,`batchingColorTexture`,i._colorsTexture,ye));let j=n.morphAttributes;if((j.position!==void 0||j.normal!==void 0||j.color!==void 0)&&Me.update(i,n,x),(w||_.receiveShadow!==i.receiveShadow)&&(_.receiveShadow=i.receiveShadow,k.setValue(I,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),w&&(k.setValue(I,`toneMappingExposure`,S.toneMappingExposure),_.needsLights&&lt(A,T),a&&r.fog===!0&&Ee.refreshFogUniforms(A,a),Ee.refreshMaterialUniforms(A,r,F,P,y.state.transmissionRenderTarget[e.id]),Hs.upload(I,ot(_),A,ye)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Hs.upload(I,ot(_),A,ye),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(I,`center`,i.center),k.setValue(I,`modelViewMatrix`,i.modelViewMatrix),k.setValue(I,`normalMatrix`,i.normalMatrix),k.setValue(I,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];ze.update(n,x),ze.bind(n,x)}}return x}function lt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function ut(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(e,t,n){let r=R.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),R.get(e.texture).__webglTexture=t,R.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=R.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let dt=I.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){E=e,w=t,T=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=R.get(e);if(s.__useDefaultFramebuffer!==void 0)L.bindFramebuffer(I.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)ye.setupRenderTarget(e);else if(s.__hasExternalTextures)ye.rebindTextures(e,R.get(e.texture).__webglTexture,R.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&R.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);ye.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=R.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&ye.useMultisampledRTT(e)===!1?R.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,k.copy(e.viewport),A.copy(e.scissor),j=e.scissorTest}else k.copy(re).multiplyScalar(F).floor(),A.copy(ie).multiplyScalar(F).floor(),j=ae;if(n!==0&&(i=dt),L.bindFramebuffer(I.FRAMEBUFFER,i)&&r&&L.drawBuffers(e,i),L.viewport(k),L.scissor(A),L.setScissorTest(j),a){let r=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=R.get(e.textures[t]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,t.__webglTexture,n)}D=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){L.bindFramebuffer(I.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!_e.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!_e.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s),I.readPixels(t,n,r,i,Le.convert(c),Le.convert(l),a))}finally{let e=E===null?null:R.get(E).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){L.bindFramebuffer(I.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!_e.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!_e.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,d),I.bufferData(I.PIXEL_PACK_BUFFER,a.byteLength,I.STREAM_READ),e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s),I.readPixels(t,n,r,i,Le.convert(l),Le.convert(u),0);let f=E===null?null:R.get(E).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,f);let p=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Ct(I,p,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,d),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,a),I.deleteBuffer(d),I.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;ye.setTexture2D(e,0),I.copyTexSubImage2D(I.TEXTURE_2D,n,0,0,o,s,i,a),L.unbindTexture()};let ft=I.createFramebuffer(),pt=I.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(St(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Le.convert(t.format),_=Le.convert(t.type),v;t.isData3DTexture?(ye.setTexture3D(t,0),v=I.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(ye.setTexture2DArray(t,0),v=I.TEXTURE_2D_ARRAY):(ye.setTexture2D(t,0),v=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,t.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,t.unpackAlignment);let y=I.getParameter(I.UNPACK_ROW_LENGTH),b=I.getParameter(I.UNPACK_IMAGE_HEIGHT),x=I.getParameter(I.UNPACK_SKIP_PIXELS),S=I.getParameter(I.UNPACK_SKIP_ROWS),C=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,h.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,h.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,l),I.pixelStorei(I.UNPACK_SKIP_ROWS,u),I.pixelStorei(I.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=R.get(e),r=R.get(t),h=R.get(n.__renderTarget),g=R.get(r.__renderTarget);L.bindFramebuffer(I.READ_FRAMEBUFFER,h.__webglFramebuffer),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(e).__webglTexture,i,d+n),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(t).__webglTexture,a,m+n)),I.blitFramebuffer(l,u,o,s,f,p,o,s,I.DEPTH_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||R.has(e)){let n=R.get(e),r=R.get(t);L.bindFramebuffer(I.READ_FRAMEBUFFER,ft),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,pt);for(let e=0;e<c;e++)w?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,n.__webglTexture,i),T?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,r.__webglTexture,a),i===0?T?I.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):I.copyTexSubImage2D(v,a,f,p,l,u,o,s):I.blitFramebuffer(l,u,o,s,f,p,o,s,I.COLOR_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?I.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h);I.pixelStorei(I.UNPACK_ROW_LENGTH,y),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,b),I.pixelStorei(I.UNPACK_SKIP_PIXELS,x),I.pixelStorei(I.UNPACK_SKIP_ROWS,S),I.pixelStorei(I.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&I.generateMipmap(v),L.unbindTexture()},this.initRenderTarget=function(e){R.get(e).__webglFramebuffer===void 0&&ye.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?ye.setTextureCube(e,0):e.isData3DTexture?ye.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?ye.setTexture2DArray(e,0):ye.setTexture2D(e,0),L.unbindTexture()},this.resetState=function(){w=0,T=0,E=null,L.reset(),Re.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Be}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Dt._getUnpackColorSpace()}},Qc={physics:{gravity:19.6,mass:80,airDrag:.3,diveDrag:.11,maxNormalSpeed:42,maxDiveSpeed:56,speedLimitSoftness:6,swingSpeedSoftness:1.6,fixedHz:120},ground:{walkSpeed:2.2,jogSpeed:6.5,sprintSpeed:15,accel:38,sprintAccel:22,decel:30,turnRate:12,jumpSpeed:9.5,jumpHoldGravityScale:.55,superJumpSpeed:26,superJumpChargeTime:.45,coyoteTime:.12,jumpBuffer:.12,stepHeight:.55},air:{airSteerAccel:11,airSteerMaxSpeedGain:2,diveAccel:14,fastDiveAccel:30,trickDuration:.55},web:{maxLength:75,minLength:7,elasticity:0,stiffness:9e3,damping:900,maxStretch:1.2,restitution:.04,catchWindow:.3,catchRedirect:.55,catchMaxG:2.5,catchGive:3.5,catchSoftFrom:2,swingGravityScale:1.2,downswingPull:.4,upswingLift:.08,pumpForce:420,upswingPumpScale:.25,noStickPump:.45,swingSteerForce:1150,steerBrakeForce:1500,turnSpeedCost:.22,reelRate:14,releaseBoost:4.5,releaseUpBoost:2,autoReleaseScale:.6,autoReleasePhase:.96,chainDelay:.1,refireDelay:.3,swingJumpSpeed:8.5,swingJumpHop:3.5,swingJumpPitchBottom:12,swingJumpPitchLate:76,swingJumpTuckPhase:.5,swingJumpPerfectWindow:.13,swingJumpPerfectBonus:.5,swingSpeedPreservation:.75,fireCooldown:.12,detachAboveAnchor:.5,attachConeDeg:70,minAnchorHeightAbovePlayer:6,idealAnchorAhead:28,idealAnchorRise:21,idealArcDrop:16,minAnchorElevationDeg:24},assist:{strength:10,groundClearance:4.5,minSwingAltitude:3,groundAvoidForce:1600,autoShorten:1,autoExtend:1,cornerAvoidForce:1200,arcCorrection:2.2,arcCorrectionMaxAccel:13,swingPlaneAssist:.85,streetCentering:9,streetCenterRange:11,wallSlamBelow:3,forwardAssistForce:200,predictHorizon:1.6},anchor:{rayCount:56,wAhead:1.3,wHeight:1.1,wSide:1.6,wBottom:.8,wLength:2.2,wTall:.4,wProp:.6,wDirection:1,wCamera:.6,wInput:1.3,wClearance:2.2,wVisibility:.4,wContinuity:.5,wTurn:1.2,wSpeedGain:.5,wPlane:.9},zip:{zipSpeed:48,zipAccel:220,zipForwardDistance:45,zipBurst:11,zipMinSpeed:22,zipMaxSpeed:40,zipBurstTime:.2,maxAirZips:1,pointLaunchUp:21,pointLaunchForward:17,pointLaunchWindow:.35,pointPerfectWindow:.12,pointPerfectBonus:.3,pointMaxDistance:70,pointConeDeg:26},wall:{wallRunSpeed:16,wallRunMaxSpeed:40,wallRunUpSpeed:17,wallRunDuration:3.5,wallCrawlSpeed:4.5,wallJumpOut:10,wallJumpUp:11,wallLaunchOut:7,wallLaunchUp:9.5,stickForce:30,minEntrySpeed:4,slamSpeed:9},landing:{rollSpeed:18,hardSpeed:28,recoveryTime:.35,rollTime:.5},camera:{distance:4.5,distanceAtSpeed:7,height:1.25,shoulder:.42,fov:62,fovAtSpeed:84,speedMin:6,fovSpeedRef:52,followFreq:6.5,followFreqV:5,followDamping:.9,maxLag:2.2,lookAhead:.35,arcFrame:.024,arcPitch:.3,diveTilt:.42,attachFovKick:5,attachDragBack:.7,rollAmount:.9,rollMax:.15,shake:.3,autoRecenter:1.5,autoFollowDelay:.9,yawFollow:9,pitchRest:-.16,sensitivity:.0022}},K=Qc,$c={"physics.gravity":{min:5,max:40,step:.1},"physics.mass":{min:30,max:200,step:1},"web.elasticity":{min:0,max:1,step:.01},"web.swingGravityScale":{min:.5,max:2.5,step:.01},"web.catchRedirect":{min:0,max:1,step:.01},"web.catchMaxG":{min:0,max:15,step:.1},"web.catchGive":{min:0,max:8,step:.1},"web.swingSpeedPreservation":{min:0,max:1,step:.01},"web.downswingPull":{min:0,max:1.5,step:.01},"web.upswingLift":{min:0,max:.5,step:.01},"web.swingJumpTuckPhase":{min:.1,max:.95,step:.01},"web.swingJumpPerfectWindow":{min:.02,max:.5,step:.01},"web.autoReleasePhase":{min:.5,max:1,step:.01},"assist.strength":{min:0,max:10,step:1,label:`Swing Assist (0 raw rope – 10 full)`},"assist.autoShorten":{min:0,max:1,step:1},"assist.autoExtend":{min:0,max:1,step:1},"assist.swingPlaneAssist":{min:0,max:1,step:.01},"assist.wallSlamBelow":{min:0,max:10,step:1},"zip.maxAirZips":{min:0,max:5,step:1},"physics.fixedHz":{min:30,max:240,step:1},"camera.pitchRest":{min:-.8,max:.4,step:.01},"camera.followDamping":{min:.3,max:1.5,step:.01}};function el(e,t){let n=$c[e];if(n)return n;let r=Math.max(1,Math.abs(t));return{min:0,max:r*3,step:r>=10?1:.01}}var tl=JSON.parse(JSON.stringify(Qc));function nl(){let e=K;for(let t of Object.keys(tl))for(let n of Object.keys(tl[t]))e[t][n]=tl[t][n]}var q=(e,t,n)=>e<t?t:e>n?n:e,J=(e,t,n)=>e+(t-e)*n,rl=e=>q(e,0,1),Y=(e,t,n)=>{let r=rl((n-e)/(t-e));return r*r*(3-2*r)},il=(e,t)=>1-Math.exp(-e*t),al=Math.PI/180;new V(0,1,0);function ol(e){for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;return e}var sl=e=>Math.hypot(e.x,e.z);Array.from({length:64},()=>new V);var cl=new class{starts=new Map;avg=new Map;alpha=.08;begin(e){this.starts.set(e,performance.now())}end(e){let t=this.starts.get(e);if(t===void 0)return 0;let n=performance.now()-t,r=this.avg.get(e);return this.avg.set(e,r===void 0?n:r+(n-r)*this.alpha),n}get(e){return this.avg.get(e)??0}},ll=class e{s;constructor(e){this.s=e>>>0||2654435769}next(){let e=this.s=this.s+1831565813>>>0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}range(e,t){return e+(t-e)*this.next()}int(e,t){return Math.floor(this.range(e,t+1))}chance(e){return this.next()<e}pick(e){return e[Math.floor(this.next()*e.length)]}gauss(){let e=Math.max(1e-9,this.next());return Math.sqrt(-2*Math.log(e))*Math.cos(2*Math.PI*this.next())}fork(t){return new e(this.next()*4294967296^Math.imul(t,2246822507))}},ul={seed:1337,blocksX:6,blocksZ:8,blockSizeX:96,blockSizeZ:58,avenueWidth:26,streetWidth:17,sidewalkWidth:4.5,alleyChance:.45,alleyWidth:6.5,lotMinWidth:14,lotMaxWidth:34,buildingDensity:.93,minHeight:12,medianHeight:38,maxHeight:250,skyscraperChance:.2,downtownRadius:260,setbackChance:.7,floorHeight:3.6,propDensity:1,waterTowerChance:.35,billboardChance:.12,treeSpacing:14,lightSpacing:26},dl={Brick:0,Brownstone:1,Limestone:2,Concrete:3,Granite:4,Curtain:5,Ribbon:6},fl={Tar:0,Membrane:1,Gravel:2,Pavers:3};function pl(e,t){let n=(Math.imul(e|0,2654435761)^Math.imul(t+1,2246822507))>>>0;return n=Math.imul(n^n>>>16,2146121005)>>>0,n=Math.imul(n^n>>>15,2221713035)>>>0,(n^n>>>16)>>>0}function ml(e){return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}function hl(e,t,n){let r=[e>>16&255,e>>8&255,e&255].map(e=>e/255),i=1+t.range(-n,n),a=t.range(-n,n)*.35,o=r.map((e,t)=>q(e*i*(1+(t===0?a:t===2?-a:0)),0,1));return Math.round(o[0]*255)<<16|Math.round(o[1]*255)<<8|Math.round(o[2]*255)}function gl(e){let t=ml((e>>16&255)/255),n=ml((e>>8&255)/255),r=ml((e&255)/255),i=Math.max(t,n,r),a=Math.min(t,n,r),o=(i+a)/2;if(i===a)return[0,0,o];let s=i-a,c=o>.5?s/(2-i-a):s/(i+a);return[(i===t?(n-r)/s+(n<r?6:0):i===n?(r-t)/s+2:(t-n)/s+4)/6,c,o]}var _l={brickWall:[9124395,10110514,8073766,7289644,10508349,6236963,8802362,9389104,11770486,11106394,12433064],brickTrim:[13813680,12892316,14736594,12102544,13617595],brickFrame:[1842718,2044711,14868698,3877407,5906202,14341836],brownWall:[5979698,6833718,4994090,7557699,6440506],brownFrame:[1710618,14736853,2964012,3810328],limeWall:[13615525,14273973,12759183,12564392,14866109,11838859,13219738,14074787],limeTrim:[15130058,11049599,14208957,12168080],limeFrame:[2236444,2832945,4930346,14473420,1711392],concWall:[10263188,9210501,11117980,8158071,11709080,9607836,10722706],concFrame:[10396840,2895667,7040882,9277324],granWall:[2763051,3880499,4865850,2501424,5917764,4013890,7035472],granFrame:[4864552,1381653,3815994,6967864],granGlass:[5917240,4937050,4016722,4608072],cwWall:[9410461,5922918,3027511,10988978,4474956],cwGlass:[4025231,3104624,4620150,8021320,10135214,2770534,3356991,6262691,5599370,9075300],cwFrame:[11120821,2830131,6048310,8226187],ribWall:[14277075,13089181,10394516,4935250,9325370,12107972,15000024],ribGlass:[5205888,6126964,4016725,6978176,4808814],ribFrame:[10133668,2764081,6119782],resGlass:[9413536,10003629,9083542,10529455]};function vl(e,t){let n=e.height,r=t.next(),i;i=e.style===1?n>60?r<.8?dl.Curtain:dl.Granite:r<.6?dl.Curtain:dl.Ribbon:e.style===2?n>90?r<.5?dl.Ribbon:r<.8?dl.Concrete:dl.Granite:r<.55?dl.Ribbon:dl.Concrete:n<28?r<.45?dl.Brick:r<.75?dl.Brownstone:dl.Limestone:n<70?r<.5?dl.Brick:r<.85?dl.Limestone:dl.Concrete:r<.55?dl.Limestone:r<.75?dl.Brick:dl.Concrete;let a,o,s,c,l,u,d,f,p,m,h=!1,g=!1;switch(i){case dl.Brick:a=t.pick(_l.brickWall),o=t.pick(_l.brickTrim),s=t.pick(_l.brickFrame),c=t.pick(_l.resGlass),l=t.range(3.1,3.4),u=t.range(.95,1.25),d=t.range(1.65,1.95),f=t.range(.9,1.5),p=t.range(.8,.9),h=t.chance(.25),m=t.range(4.2,4.8);break;case dl.Brownstone:a=t.pick(_l.brownWall),o=hl(a,t,.1),s=t.pick(_l.brownFrame),c=t.pick(_l.resGlass),l=t.range(3.4,3.8),u=t.range(1,1.2),d=t.range(2,2.3),f=t.range(1.1,1.5),p=.75,h=t.chance(.1),m=t.range(4.2,4.6);break;case dl.Limestone:a=t.pick(_l.limeWall),o=t.pick(_l.limeTrim),s=t.pick(_l.limeFrame),c=t.pick(_l.resGlass),l=t.range(3.4,3.8),u=t.range(1,1.35),d=t.range(1.8,2.15),f=t.range(.7,1.2),p=.8,h=t.chance(.5),g=t.chance(.4),m=t.range(4.4,5.2);break;case dl.Concrete:a=t.pick(_l.concWall),o=a,s=t.pick(_l.concFrame),c=t.pick(_l.ribGlass),l=t.range(3.3,3.8),u=t.range(1.5,2.3),d=t.range(1.5,1.9),f=t.range(.7,1.3),p=.85,g=t.chance(.7),m=t.range(4.4,5.4);break;case dl.Granite:a=t.pick(_l.granWall),o=hl(a,t,.15),s=t.pick(_l.granFrame),c=t.pick(_l.granGlass),l=t.range(3.8,4.1),u=t.range(1.5,2.4),d=l-t.range(1,1.2),f=t.range(.7,1),p=.5,g=!0,m=t.range(5,6);break;case dl.Curtain:a=t.pick(_l.cwWall),s=t.pick(_l.cwFrame),o=s,c=t.pick(_l.cwGlass),l=t.range(3.8,4.2),u=t.range(1.35,1.7),d=l-t.range(.9,1.2),f=0,p=.08,g=!0,m=t.range(5,6.2);break;default:a=t.pick(_l.ribWall),s=t.pick(_l.ribFrame),o=a,c=t.pick(_l.ribGlass),l=t.range(3.5,3.9),u=t.range(1.4,2.2),d=t.range(1.4,1.8),f=0,p=.9,g=t.chance(.85),m=t.range(4.6,5.6)}a=hl(a,t,.07),d=Math.min(d,l-p-.45);let[_,v,y]=gl(a);e.archetype=i,e.wallColor=a,e.trimColor=o,e.frameColor=s,e.glassColor=c,e.hue=_,e.sat=v,e.light=y,e.floorH=l,e.windowW=u,e.windowH=d,e.pier=f,e.sill=p,e.groundH=m,e.paired=h,e.office=g,e.litFraction=g?t.range(.3,.55):t.range(.35,.6),e.roofKind=i<=dl.Limestone?t.chance(.6)?fl.Tar:fl.Gravel:t.chance(.65)?fl.Membrane:fl.Gravel}function yl(e,t,n){let r=t.medianHeight*Math.exp(.45*e.gauss())*J(.55,1.35,n);return e.chance(t.skyscraperChance*(.25+n*1.3))&&(r=J(110,t.maxHeight,e.next()**.8*(.5+.5*n))),q(r,t.minHeight,t.maxHeight)}function bl(e={}){let t={...ul,...e},n=new ll(t.seed),r=t.blocksX*t.blockSizeX+(t.blocksX+1)*t.avenueWidth,i=t.blocksZ*t.blockSizeZ+(t.blocksZ+1)*t.streetWidth,a=-r/2,o=-i/2,s=[],c=[];for(let e=0;e<=t.blocksX;e++)s.push(a+t.avenueWidth/2+e*(t.blockSizeX+t.avenueWidth));for(let e=0;e<=t.blocksZ;e++)c.push(o+t.streetWidth/2+e*(t.blockSizeZ+t.streetWidth));let l=[];for(let e of s)l.push({axis:`z`,c:e,from:o,to:o+i,width:t.avenueWidth,lanesPerDir:2});for(let e of c)l.push({axis:`x`,c:e,from:a,to:a+r,width:t.streetWidth,lanesPerDir:1});let u=[],d=[],f=[],p=[],m=[{x:a+r*.42,z:o+i*.4,w:1},{x:a+r*.7,z:o+i*.75,w:.7}],h=(e,n)=>{let r=0;for(let i of m){let a=Math.hypot(e-i.x,n-i.z)/t.downtownRadius;r=Math.max(r,i.w*Math.exp(-a*a))}return r},g=0,_=0,v=(e,n,r,i,a)=>{let o=(e+r)/2,s=(n+i)/2,c=h(o,s),l=yl(a,t,c),u=d.length,m=l>90?a.chance(.65)?1:2:a.chance(.62)?0:a.chance(.5)?2:1,v=[],y=l>60&&a.chance(t.setbackChance)?a.int(2,l>150?4:3):1,b=e,x=n,S=r,C=i,w=0;for(let e=0;e<y;e++){let t=e===y-1,n=t?1:J(.35,.6,a.next())+e*.1,r=t?l:Math.max(w+12,Math.min(l-10,l*n));v.push({x0:b,z0:x,x1:S,z1:C,y0:w,y1:r}),w=r;let i=a.range(2,6);if(S-b-2*i>9&&(b+=i,S-=i),C-x-2*i>9&&(x+=i,C-=i),t)break}g+=v.length,_=Math.max(_,l);let T=a.next(),E=l>150&&T<.35?`spire`:l>110&&T<.55?`crown`:T<.72?`parapet`:`flat`,D=t.floorHeight*a.range(.92,1.12),O={id:u,tiers:v,height:l,roof:E,style:m,hue:m===1?a.range(.52,.62):a.pick([.03,.06,.08,.1,.12,.58])+a.range(-.02,.02),sat:m===1?a.range(.15,.35):a.range(.08,.38),light:m===1?a.range(.18,.32):a.range(.28,.62),windowW:m===1?a.range(1.4,2.2):a.range(1,1.6),windowH:m===1?D*.85:a.range(1.5,2.2),floorH:D,litFraction:a.range(.25,.7),seed:a.next()*1e3,archetype:0,wallColor:0,trimColor:0,frameColor:0,glassColor:0,groundH:4.5,pier:1,sill:.85,paired:!1,office:!1,roofKind:0};vl(O,new ll(pl(t.seed,u))),d.push(O);let k=v[v.length-1],A=k.x1-k.x0,j=k.z1-k.z0,M=k.y1;if(E===`parapet`||E===`crown`){let e=E===`crown`?a.range(2.5,5):a.range(.8,1.3),t=.45;f.push({type:`parapet`,x:(k.x0+k.x1)/2,y:M,z:k.z0+t/2,sx:A,sy:e,sz:t,rotY:0,building:u,variant:0}),f.push({type:`parapet`,x:(k.x0+k.x1)/2,y:M,z:k.z1-t/2,sx:A,sy:e,sz:t,rotY:0,building:u,variant:0}),f.push({type:`parapet`,x:k.x0+t/2,y:M,z:(k.z0+k.z1)/2,sx:t,sy:e,sz:j-2*t,rotY:0,building:u,variant:0}),f.push({type:`parapet`,x:k.x1-t/2,y:M,z:(k.z0+k.z1)/2,sx:t,sy:e,sz:j-2*t,rotY:0,building:u,variant:0})}for(let e of v){let t=e.y1+(E===`parapet`&&e===k?1.1:0);for(let[n,r]of[[e.x0,e.z0],[e.x1,e.z0],[e.x0,e.z1],[e.x1,e.z1]])p.push({x:n,y:t,z:r,building:u,kind:`roofCorner`})}if(E===`spire`){let e=a.range(18,45);f.push({type:`antenna`,x:(k.x0+k.x1)/2,y:M,z:(k.z0+k.z1)/2,sx:1.2,sy:e,sz:1.2,rotY:0,building:u,variant:0}),p.push({x:(k.x0+k.x1)/2,y:M+e,z:(k.z0+k.z1)/2,building:u,kind:`antenna`})}let N=t.propDensity,ee=Math.floor(a.range(0,3.5)*N*Math.min(1,A*j/400));for(let e=0;e<ee;e++){let e=a.range(2,5),t=a.range(2,4),n=a.range(1.2,2.4),r=a.range(k.x0+e/2+1.5,k.x1-e/2-1.5),i=a.range(k.z0+t/2+1.5,k.z1-t/2-1.5);Number.isFinite(r)&&Number.isFinite(i)&&k.x1-k.x0>e+3&&k.z1-k.z0>t+3&&f.push({type:a.chance(.3)?`vent`:`hvac`,x:r,y:M,z:i,sx:e,sy:n,sz:t,rotY:0,building:u,variant:a.int(0,2)})}if(l>18&&l<110&&a.chance(t.waterTowerChance*N)&&A>10&&j>10){let e=a.range(2.2,3.2),t=a.range(3,5),n=a.range(4.5,6.5),r=a.range(k.x0+e+1.5,k.x1-e-1.5),i=a.range(k.z0+e+1.5,k.z1-e-1.5);f.push({type:`waterTower`,x:r,y:M,z:i,sx:e,sy:t,sz:n,rotY:a.range(0,6.28),building:u,variant:0}),p.push({x:r,y:M+t+n+e*.55,z:i,building:u,kind:`tower`})}if(l>25&&l<140&&a.chance(t.billboardChance*N)){let e=a.chance(.5),t=Math.min(e?A-2:j-2,a.range(10,18));if(t>6){let n=t*.42,r=a.chance(.5),i=e?(k.x0+k.x1)/2:r?k.x0+1.5:k.x1-1.5,o=e?r?k.z0+1.5:k.z1-1.5:(k.z0+k.z1)/2;f.push({type:`billboard`,x:i,y:M,z:o,sx:e?t:.5,sy:n+3,sz:e?.5:t,rotY:e?0:Math.PI/2,building:u,variant:a.int(0,5)}),p.push({x:i,y:M+n+3,z:o,building:u,kind:`billboard`})}}};for(let e=0;e<t.blocksX;e++)for(let r=0;r<t.blocksZ;r++){let i=s[e]+t.avenueWidth/2,a=s[e+1]-t.avenueWidth/2,o=c[r]+t.streetWidth/2,l=c[r+1]-t.streetWidth/2,m=n.fork(e*131+r*7919),g=m.chance(.06)&&h((i+a)/2,(o+l)/2)<.6;u.push({x0:i,z0:o,x1:a,z1:l,park:g});let _=t.sidewalkWidth,y=i+_,b=a-_,x=o+_,S=l-_;if(g){for(let e=0;e<18*t.propDensity;e++){let e=m.range(.8,1.3);f.push({type:`tree`,x:m.range(y+3,b-3),y:0,z:m.range(x+3,S-3),sx:e,sy:e*m.range(6,9),sz:e,rotY:m.range(0,6.28),building:-1,variant:m.int(0,2)})}continue}let C=m.chance(t.alleyChance),w=(x+S)/2+m.range(-4,4),T=C?[[x,w-t.alleyWidth/2],[w+t.alleyWidth/2,S]]:m.chance(.5)?[[x,S]]:[[x,w],[w,S]];for(let[e,n]of T){let r=y;for(;r<b-1;){let i=m.range(t.lotMinWidth,t.lotMaxWidth);b-(r+i)<t.lotMinWidth&&(i=b-r);let a=m.chance(.12)?m.range(3.5,6):0,o=Math.min(b,r+i);m.chance(t.buildingDensity)?v(r,e,o-a,n,m.fork(d.length+17)):(f.push({type:`tree`,x:(r+o)/2,y:0,z:(e+n)/2,sx:1,sy:7,sz:1,rotY:0,building:-1,variant:1}),f.push({type:`kiosk`,x:(r+o)/2+3,y:0,z:(e+n)/2+3,sx:3,sy:2.8,sz:2.5,rotY:0,building:-1,variant:0})),r=o}}let E=[[i,o+1.2,a,o+1.2,0],[i,l-1.2,a,l-1.2,Math.PI],[i+1.2,o,i+1.2,l,Math.PI/2],[a-1.2,o,a-1.2,l,-Math.PI/2]];for(let[e,n,r,i,a]of E){let o=Math.hypot(r-e,i-n),s=Math.floor(o/t.lightSpacing);for(let t=1;t<s;t++){let o=t/s,c=J(e,r,o),l=J(n,i,o);f.push({type:`streetLight`,x:c,y:0,z:l,sx:.18,sy:7.5,sz:.18,rotY:a,building:-1,variant:0}),p.push({x:c,y:7.7,z:l,building:-1,kind:`lamp`})}let c=Math.floor(o/t.treeSpacing);for(let a=0;a<c;a++){if(!m.chance(.45*t.propDensity))continue;let o=(a+.5)/c,s=J(e,r,o),l=J(n,i,o),u=m.range(.7,1.1);f.push({type:`tree`,x:s,y:0,z:l,sx:u,sy:u*m.range(5.5,8),sz:u,rotY:m.range(0,6.28),building:-1,variant:m.int(0,2)})}let l=Math.floor(o/40);for(let t=0;t<l;t++){if(!m.chance(.5))continue;let t=m.range(.1,.9);f.push({type:m.chance(.5)?`hydrant`:`bench`,x:J(e,r,t),y:0,z:J(n,i,t),sx:1,sy:1,sz:1,rotY:a,building:-1,variant:0})}}}for(let e of s)for(let n of c){let r=t.avenueWidth/2+1,i=t.streetWidth/2+1;f.push({type:`signal`,x:e+r,y:0,z:n+i,sx:.2,sy:6,sz:.2,rotY:Math.PI,building:-1,variant:0}),f.push({type:`signal`,x:e-r,y:0,z:n-i,sx:.2,sy:6,sz:.2,rotY:0,building:-1,variant:1})}return{params:t,bounds:{x0:a,z0:o,x1:a+r,z1:o+i},roads:l,blocks:u,buildings:d,props:f,perches:p,avenueX:s,streetZ:c,stats:{buildings:d.length,tiers:g,props:f.length,tallest:_}}}var X={Building:1,Prop:2,Perch:4,NoWeb:8,Low:16},xl=class{minX=new Float32Array;minY=new Float32Array;minZ=new Float32Array;maxX=new Float32Array;maxY=new Float32Array;maxZ=new Float32Array;kind=new Uint8Array;owner=new Int32Array;count=0;cell;gx0=0;gz0=0;gw=1;gh=1;cellStart=new Int32Array(1);cellItems=new Int32Array;stamp=new Uint32Array;stampId=1;pending=[];stats={raycasts:0,sphereQueries:0};constructor(e=16){this.cell=e}addBox(e,t,n,r,i,a,o,s=-1){return this.pending.push(e,t,n,r,i,a,o,s),this.pending.length/8-1}build(){let e=this.pending.length/8;this.count=e,this.minX=new Float32Array(e),this.minY=new Float32Array(e),this.minZ=new Float32Array(e),this.maxX=new Float32Array(e),this.maxY=new Float32Array(e),this.maxZ=new Float32Array(e),this.kind=new Uint8Array(e),this.owner=new Int32Array(e),this.stamp=new Uint32Array(e);let t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a=0;a<e;a++){let e=this.pending,o=a*8;this.minX[a]=e[o],this.minY[a]=e[o+1],this.minZ[a]=e[o+2],this.maxX[a]=e[o+3],this.maxY[a]=e[o+4],this.maxZ[a]=e[o+5],this.kind[a]=e[o+6],this.owner[a]=e[o+7],t=Math.min(t,e[o]),n=Math.min(n,e[o+2]),r=Math.max(r,e[o+3]),i=Math.max(i,e[o+5])}e===0&&(t=n=0,r=i=1);let a=this.cell;this.gx0=Math.floor(t/a)*a,this.gz0=Math.floor(n/a)*a,this.gw=Math.max(1,Math.ceil((r-this.gx0)/a)),this.gh=Math.max(1,Math.ceil((i-this.gz0)/a));let o=new Int32Array(this.gw*this.gh+1),s=(e,t)=>{let n=this.cx(this.minX[e]),r=this.cx(this.maxX[e]),i=this.cz(this.minZ[e]),a=this.cz(this.maxZ[e]);for(let e=i;e<=a;e++)for(let i=n;i<=r;i++)t(e*this.gw+i)};for(let t=0;t<e;t++)s(t,e=>o[e+1]++);for(let e=1;e<o.length;e++)o[e]+=o[e-1];this.cellStart=o,this.cellItems=new Int32Array(o[o.length-1]);let c=o.slice(0,-1);for(let t=0;t<e;t++)s(t,e=>{this.cellItems[c[e]++]=t});this.pending=[]}cx(e){return Math.min(this.gw-1,Math.max(0,Math.floor((e-this.gx0)/this.cell)))}cz(e){return Math.min(this.gh-1,Math.max(0,Math.floor((e-this.gz0)/this.cell)))}nextStamp(){return++this.stampId===4294967295&&(this.stamp.fill(0),this.stampId=1),this.stampId}queryRect(e,t,n,r,i){let a=this.nextStamp(),o=this.cx(e),s=this.cx(n),c=this.cz(t),l=this.cz(r);for(let u=c;u<=l;u++)for(let c=o;c<=s;c++){let o=u*this.gw+c;for(let s=this.cellStart[o];s<this.cellStart[o+1];s++){let o=this.cellItems[s];if(this.stamp[o]!==a&&(this.stamp[o]=a,!(this.maxX[o]<e||this.minX[o]>n||this.maxZ[o]<t||this.minZ[o]>r)&&i(o)===!0))return}}}rayBox(e,t,n,r,i,a,o,s,c){let l=0,u=s,d=-1,f=0,p=(this.minX[e]-t)*i,m=(this.maxX[e]-t)*i;if(p>m){let e=p;p=m,m=e}if(p>l&&(l=p,d=0,f=i>0?-1:1),m<u&&(u=m),l>u)return-1;if(p=(this.minY[e]-n)*a,m=(this.maxY[e]-n)*a,p>m){let e=p;p=m,m=e}if(p>l&&(l=p,d=1,f=a>0?-1:1),m<u&&(u=m),l>u)return-1;if(p=(this.minZ[e]-r)*o,m=(this.maxZ[e]-r)*o,p>m){let e=p;p=m,m=e}return p>l&&(l=p,d=2,f=o>0?-1:1),m<u&&(u=m),l>u||d<0?-1:(c.set(d===0?f:0,d===1?f:0,d===2?f:0),l)}_n=new V;raycast(e,t,n,r,i=0,a=!0){this.stats.raycasts++;let o=e.x,s=e.y,c=e.z,l=t.x,u=t.y,d=t.z,f=1/(l||1e-12),p=1/(u||1e-12),m=1/(d||1e-12),h=n,g=-2,_=r.normal;if(a&&u<0&&s>0){let e=-s*p;e<h&&(h=e,g=-1,_.set(0,1,0))}let v=this.nextStamp(),y=this.cell,b=Math.floor((o-this.gx0)/y),x=Math.floor((c-this.gz0)/y),S=l>0?1:-1,C=d>0?1:-1,w=Math.abs(l)<1e-9?1/0:y/Math.abs(l),T=Math.abs(d)<1e-9?1/0:y/Math.abs(d),E=Math.abs(l)<1e-9?1/0:((l>0?(b+1)*y:b*y)+this.gx0-o)/l,D=Math.abs(d)<1e-9?1/0:((d>0?(x+1)*y:x*y)+this.gz0-c)/d,O=0,k=this._n;for(let e=0;e<4096;e++){if(b>=0&&x>=0&&b<this.gw&&x<this.gh){let e=x*this.gw+b;for(let t=this.cellStart[e];t<this.cellStart[e+1];t++){let e=this.cellItems[t];if(this.stamp[e]===v||(this.stamp[e]=v,this.kind[e]&i))continue;let n=this.rayBox(e,o,s,c,f,p,m,h,k);n>=0&&n<h&&(h=n,g=e,_.copy(k))}}else if(b<0&&S<0||b>=this.gw&&S>0||x<0&&C<0||x>=this.gh&&C>0)break;if(O>h||(E<D?(O=E,E+=w,b+=S):(O=D,D+=T,x+=C),O>h))break}return g!==-2&&(r.t=h,r.box=g,r.point.set(o+l*h,s+u*h,c+d*h),!0)}lineOfSight(e,t,n=0){let r=this._los.subVectors(t,e),i=r.length();return i<1e-6||(r.multiplyScalar(1/i),!this.raycast(e,r,i-.05,this._losHit,n))}_los=new V;_losHit={t:0,point:new V,normal:new V,box:-1};resolveSphere(e,t,n,r=0,i=0){this.stats.sphereQueries++;let a=r,o=(e,t,r,i,o)=>{a>=n.length&&n.push({normal:new V,depth:0,box:-1});let s=n[a++];s.normal.set(e,t,r),s.depth=i,s.box=o};for(let n=0;n<3;n++){let n=!1;if(e.y<t&&(o(0,1,0,t-e.y,-1),e.y=t,n=!0),this.queryRect(e.x-t,e.z-t,e.x+t,e.z+t,r=>{if(this.kind[r]&i||e.y+t<this.minY[r]||e.y-t>this.maxY[r])return;let a=Math.max(this.minX[r],Math.min(e.x,this.maxX[r])),s=Math.max(this.minY[r],Math.min(e.y,this.maxY[r])),c=Math.max(this.minZ[r],Math.min(e.z,this.maxZ[r])),l=e.x-a,u=e.y-s,d=e.z-c,f=l*l+u*u+d*d;if(f>=t*t)return;let p;if(f>1e-10){let e=Math.sqrt(f);l/=e,u/=e,d/=e,p=t-e}else{let n=e.x-this.minX[r],i=this.maxX[r]-e.x,a=e.y-this.minY[r],o=this.maxY[r]-e.y,s=e.z-this.minZ[r],c=this.maxZ[r]-e.z,f=n;l=-1,u=0,d=0,i<f&&(f=i,l=1,u=0,d=0),a<f&&(f=a,l=0,u=-1,d=0),o<f&&(f=o,l=0,u=1,d=0),s<f&&(f=s,l=0,u=0,d=-1),c<f&&(f=c,l=0,u=0,d=1),p=f+t}e.x+=l*p,e.y+=u*p,e.z+=d*p,o(l,u,d,p,r),n=!0}),!n)break}return a}overlapsSphere(e,t,n=0){if(e.y<t)return!0;let r=!1;return this.queryRect(e.x-t,e.z-t,e.x+t,e.z+t,i=>{if(this.kind[i]&n)return;let a=Math.max(this.minX[i],Math.min(e.x,this.maxX[i])),o=Math.max(this.minY[i],Math.min(e.y,this.maxY[i])),s=Math.max(this.minZ[i],Math.min(e.z,this.maxZ[i])),c=e.x-a,l=e.y-o,u=e.z-s;if(c*c+l*l+u*u<t*t)return r=!0,!0}),r}_down=new V(0,-1,0);_gh={t:0,point:new V,normal:new V,box:-1};heightBelow(e,t=1e3){return this.raycast(e,this._down,t,this._gh)?this._gh.point.y:0}boxCenter(e,t){return t.set((this.minX[e]+this.maxX[e])/2,(this.minY[e]+this.maxY[e])/2,(this.minZ[e]+this.maxZ[e])/2)}};function Sl(){return{t:0,point:new V,normal:new V,box:-1}}function Cl(e){let t=new xl(16);for(let n of e.buildings)for(let e of n.tiers)t.addBox(e.x0,e.y0,e.z0,e.x1,e.y1,e.z1,X.Building,n.id);for(let n of e.props){let e=n.sx/2,r=n.sz/2;switch(n.type){case`parapet`:t.addBox(n.x-e,n.y,n.z-r,n.x+e,n.y+n.sy,n.z+r,X.Building|X.Low,n.building);break;case`hvac`:case`vent`:case`kiosk`:t.addBox(n.x-e,n.y,n.z-r,n.x+e,n.y+n.sy,n.z+r,X.Prop|X.Low,n.building);break;case`waterTower`:{let e=n.sx,r=n.sy,i=n.sz,a=e*.85;t.addBox(n.x-a,n.y+r,n.z-a,n.x+a,n.y+r+i+e*.5,n.z+a,X.Prop,n.building),t.addBox(n.x-a*.8,n.y,n.z-a*.8,n.x+a*.8,n.y+r,n.z+a*.8,X.Prop|X.NoWeb,n.building);break}case`antenna`:t.addBox(n.x-.6,n.y,n.z-.6,n.x+.6,n.y+n.sy,n.z+.6,X.Prop|X.NoWeb,n.building);break;case`billboard`:{let i=n.sy;t.addBox(n.x-e,n.y+2.2,n.z-r,n.x+e,n.y+i,n.z+r,X.Prop,n.building);break}case`streetLight`:case`signal`:t.addBox(n.x-.15,0,n.z-.15,n.x+.15,n.sy,n.z+.15,X.Prop|X.NoWeb);break;case`tree`:t.addBox(n.x-.25,0,n.z-.25,n.x+.25,n.sy*.45,n.z+.25,X.Prop|X.NoWeb)}}return t.build(),t}function wl(e){let t=e.avenueX[Math.floor(e.avenueX.length/2)],n=e.buildings[0],r=-1/0;for(let i of e.buildings){let a=i.tiers[i.tiers.length-1],o=(a.x0+a.x1)/2,s=(a.z0+a.z1)/2,c=-Math.abs(i.height-55)*.6-Math.abs(o-t)*.5-Math.abs(s-(e.bounds.z1-120))*.3;c>r&&(r=c,n=i)}let i=n.tiers[n.tiers.length-1],a=t<(i.x0+i.x1)/2,o=a?i.x0+4:i.x1-4,s=(i.z0+i.z1)/2;for(let t of e.props)t.building===n.id&&t.type!==`parapet`&&Math.abs(t.x-o)<t.sx/2+2&&Math.abs(t.z-s)<t.sz/2+2&&(s=t.z+t.sz/2+2.5<i.z1-1?t.z+t.sz/2+2.5:t.z-t.sz/2-2.5);return{x:o,y:i.y1+.2,z:s,yaw:a?Math.PI/2:-Math.PI/2}}var Tl=class{moveX=0;moveY=0;camYaw=0;camPitch=0;camForward=new V(0,0,-1);jump=!1;traverse=!1;zip=!1;dive=!1;trick=!1;drop=!1;reel=!1;jumpPressed=!1;jumpReleased=!1;traversePressed=!1;traverseReleased=!1;zipPressed=!1;trickPressed=!1;dropPressed=!1;prev={jump:!1,traverse:!1,zip:!1,trick:!1,drop:!1};latch(){let e=this.prev;this.jumpPressed=this.jump&&!e.jump,this.jumpReleased=!this.jump&&e.jump,this.traversePressed=this.traverse&&!e.traverse,this.traverseReleased=!this.traverse&&e.traverse,this.zipPressed=this.zip&&!e.zip,this.trickPressed=this.trick&&!e.trick,this.dropPressed=this.drop&&!e.drop,e.jump=this.jump,e.traverse=this.traverse,e.zip=this.zip,e.trick=this.trick,e.drop=this.drop}get moveMag(){return Math.min(1,Math.hypot(this.moveX,this.moveY))}moveWorld(e){let t=Math.sin(this.camYaw),n=Math.cos(this.camYaw);e.set(-t*this.moveY+n*this.moveX,0,-n*this.moveY-t*this.moveX);let r=e.length();return r>1&&e.multiplyScalar(1/r),e}camForwardFlat(e){return e.set(-Math.sin(this.camYaw),0,-Math.cos(this.camYaw))}},El=class{keys=new Set;mouseButtons=0;lookDX=0;lookDY=0;locked=!1;gamepadActive=!1;pressedOnce=new Set;listeners=[];constructor(e){let t=(e,t,n,r)=>{e.addEventListener(t,n,r),this.listeners.push([e,t,n])};t(window,`keydown`,e=>{let t=e.code;this.keys.has(t)||this.pressedOnce.add(t),this.keys.add(t),[`Space`,`Enter`,`NumpadEnter`,`Tab`,`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`F1`,`F2`,`F3`].includes(t)&&e.preventDefault()}),t(window,`keyup`,e=>this.keys.delete(e.code)),t(window,`blur`,()=>{this.keys.clear(),this.mouseButtons=0}),t(e,`mousedown`,t=>{let n=t;this.mouseButtons|=1<<n.button,this.locked||e.requestPointerLock?.()}),t(window,`mouseup`,e=>{this.mouseButtons&=~(1<<e.button)}),t(e,`contextmenu`,e=>e.preventDefault()),t(document,`pointerlockchange`,()=>{this.locked=document.pointerLockElement===e}),t(window,`mousemove`,e=>{if(!this.locked)return;let t=e;this.lookDX+=t.movementX,this.lookDY+=t.movementY})}key(e){return this.keys.has(e)}consume(e){let t=this.pressedOnce.has(e);return this.pressedOnce.delete(e),t}fill(e){let t=e=>this.keys.has(e),n=(t(`KeyD`)||t(`ArrowRight`)?1:0)-(t(`KeyA`)||t(`ArrowLeft`)?1:0),r=(t(`KeyW`)||t(`ArrowUp`)?1:0)-(t(`KeyS`)||t(`ArrowDown`)?1:0),i=t(`AltLeft`)||t(`KeyX`)?.35:1,a=t(`Space`),o=t(`Enter`)||t(`NumpadEnter`)||t(`ShiftLeft`)||t(`ShiftRight`)||!!(this.mouseButtons&4),s=t(`KeyE`)||!!(this.mouseButtons&2)||this.locked&&!!(this.mouseButtons&1),c=t(`KeyQ`),l=t(`KeyF`),u=t(`KeyC`),d=t(`KeyR`),f=0,p=0,m=typeof navigator<`u`&&navigator.getGamepads?navigator.getGamepads():[];for(let e of m){if(!e||e.mapping!==`standard`)continue;let t=e=>Math.abs(e)<.15?0:(e-Math.sign(e)*.15)/.85,i=t(e.axes[0]),d=t(e.axes[1]),m=t(e.axes[2]),h=t(e.axes[3]),g=t=>!!e.buttons[t]?.pressed;(Math.abs(i)+Math.abs(d)+Math.abs(m)+Math.abs(h)>0||e.buttons.some(e=>e.pressed))&&(this.gamepadActive=!0),Math.abs(i)+Math.abs(d)>0&&(n=i,r=-d),f=m,p=h,a||=g(0),u||=g(1),l||=g(3),c||=g(4),s||=g(5),o||=(e.buttons[7]?.value??0)>.3;break}let h=Math.hypot(n,r);return h>1&&(n/=h,r/=h),e.moveX=n*i,e.moveY=r*i,e.jump=a,e.traverse=o,e.zip=s,e.dive=c,e.trick=l,e.drop=u,e.reel=d,{padLookX:f,padLookY:p}}dispose(){for(let[e,t,n]of this.listeners)e.removeEventListener(t,n)}},Dl=class{active=!1;anchor=new V;anchorBox=-1;length=0;targetLength=0;age=0;tension=0;tensionAnalytic=0;stretch=0;radialVel=0;tangentialSpeed=0;distance=0;swingAngle=0;taut=!1;gEff=0;inContact=!1;catching=!1;catchArmed=!1;payout=0;rHat=new V;tmp=new V;attach(e,t,n=-1,r){this.active=!0,this.anchor.copy(e),this.anchorBox=n;let i=t.distanceTo(e);this.length=Math.max(K.web.minLength,r??i),this.targetLength=this.length,this.age=0,this.tension=0,this.inContact=!1,this.catching=!1,this.catchArmed=!0,this.payout=0,this.swingAngle=-90,this.radialVel=0,this.gEff=K.physics.gravity*K.web.swingGravityScale}detach(){this.active=!1,this.tension=0,this.taut=!1}measure(e,t,n){this.gEff=n;let r=this.rHat.subVectors(e,this.anchor),i=r.length();this.distance=i,i>1e-6?r.multiplyScalar(1/i):r.set(0,-1,0),this.radialVel=t.dot(r);let a=Math.max(0,t.lengthSq()-this.radialVel*this.radialVel);this.tangentialSpeed=Math.sqrt(a),this.stretch=i-this.length,this.taut=this.stretch>-.05,this.tensionAnalytic=this.taut?Math.max(0,K.physics.mass*(a/Math.max(1,this.length)-n*r.y)):0;let o=Math.max(-1,Math.min(1,-r.y)),s=180/Math.PI*Math.acos(o),c=r.x*t.x+r.z*t.z;this.swingAngle=c>=0?s:-s}get dir(){return this.rHat}applyForces(e,t,n){if(K.web.elasticity<=0||this.stretch<=0)return 0;let r=K.web.stiffness*this.stretch+K.web.damping*Math.max(0,this.radialVel);return n.addScaledVector(this.rHat,-r),r}constrain(e,t,n,r,i){let a=this.tmp.subVectors(e,this.anchor),o=a.length();if(o<1e-6)return 0;a.multiplyScalar(1/o);let s=this.length+K.web.maxStretch*K.web.elasticity,c=0,l=e.y,u=t.dot(a);K.web.catchMaxG<=0&&(this.catching=!1,this.catchArmed=!1),o<this.length-.3&&(this.catchArmed=!0),this.catching&&o<s-.001&&(this.catching=!1),this.catchArmed&&o>=s-.001&&(this.catchArmed=!1,u>K.web.catchSoftFrom&&(this.catching=!0,this.payout=0));let d=this.catching&&K.web.catchMaxG>0&&this.payout<K.web.catchGive;if(d&&o>s){let e=Math.min(o-s,K.web.catchGive-this.payout);this.payout+=e,this.length+=e,this.targetLength=Math.max(this.targetLength,this.length),s+=e}if(o>s&&(e.copy(this.anchor).addScaledVector(a,s),o=s),o>=s-1e-4||K.web.elasticity<=0&&o>=this.length-1e-4){let i=t.dot(a);if(i>0){let s=t.length(),u=i*(1+K.web.restitution*K.web.elasticity);if(d){let e=Math.max(0,s*s-i*i),t=Math.max(.05,K.web.catchGive-this.payout),r=Math.max(K.web.catchMaxG*K.physics.gravity,i*i/(2*t)),c=Math.max(0,-a.y)*this.gEff,l=(e/Math.max(1,o)+c+r)*n;u>l?u=l:this.catching=!1}else this.catching=!1;if(t.addScaledVector(a,-u),c=r*u/n,!(Math.abs(this.targetLength-this.length)>.001)&&this.inContact&&!this.catching){let n=this.gEff,r=Math.sqrt(Math.max(0,s*s+2*n*(l-e.y))),i=t.length();i>1e-6&&t.multiplyScalar(r/i)}if(this.age<K.web.catchWindow&&K.web.catchRedirect>0){let e=t.length(),n=1-this.age/K.web.catchWindow;e>.5&&t.multiplyScalar((e+u*K.web.catchRedirect*n)/e)}}else this.catching&&this.age>.05&&(this.catching=!1)}return this.inContact=o>=s-.001,this.tension=i+c,this.tension}takeUpSlack(e){let t=e.distanceTo(this.anchor);t<this.length&&(this.length=Math.max(K.web.minLength,t),this.targetLength>this.length&&(this.targetLength=this.length))}reel(e,t){let n=this.targetLength-this.length,r=t*e;this.length+=Math.max(-r,Math.min(r,n)),this.length=Math.max(K.web.minLength,Math.min(K.web.maxLength*1.1,this.length))}};function Ol(){return{gravity:new V,drag:new V,pump:new V,steer:new V,assist:new V,spring:0}}function kl(){return{heading:new V(0,0,-1),stick:!1,assist:1,wallLeft:1/0,wallRight:1/0}}function Al(){return q(K.assist.strength/10,0,1)}function jl(e,t){let n=K.physics.gravity*K.web.swingGravityScale;if(!t)return n;let r=e.x*t.heading.x+e.z*t.heading.z;return e.y<0&&r>0?n*(1+K.web.downswingPull):e.y>0&&r>0?n*(1-K.web.upswingLift):n}var Ml=new V,Nl=new V,Pl=new V,Fl=new V,Il=Sl(),Ll=new V;function Rl(e,t,n,r,i,a,o,s,c){let l=K.physics.mass,u=jl(t,c);n.measure(e,t,u);let d=n.dir,f=c?c.assist:Al();o.set(0,-l*u,0),s?.gravity.set(0,-l*u,0);let p=t.length(),m=K.physics.airDrag*(1-K.web.swingSpeedPreservation);o.addScaledVector(t,-m*p),s?.drag.copy(t).multiplyScalar(-m*p);let h=r.length();s?.pump.set(0,0,0),s?.steer.set(0,0,0);let g=0,_=Pl.copy(t).addScaledVector(d,-t.dot(d)),v=_.length();if(v>1e-6&&_.multiplyScalar(1/v),h>.05&&n.taut){let e=Ml.copy(r).addScaledVector(d,-r.dot(d)),n=e.length();if(n>1e-4){e.multiplyScalar(1/n);let r=t.y<0?1:K.web.upswingPumpScale;if(v>1.5){let t=e.dot(_),n=Math.max(0,t)*K.web.pumpForce*r*h,i=Math.max(0,-t)*K.web.steerBrakeForce*h;o.addScaledVector(_,n-i),s?.pump.copy(_).multiplyScalar(n-i);let a=Nl.copy(e).addScaledVector(_,-t),c=K.web.swingSteerForce*h;o.addScaledVector(a,c),s?.steer.copy(a).multiplyScalar(c),g+=a.length()*c}else o.addScaledVector(e,K.web.pumpForce*2*h),s?.pump.copy(e).multiplyScalar(K.web.pumpForce*2*h)}}let y=Ll.copy(o);if(f>0){h>.1&&(o.x+=r.x*K.assist.forwardAssistForce*f,o.z+=r.z*K.assist.forwardAssistForce*f);let s=e.y-.9-i+Math.min(0,t.y)*.45,u=K.assist.groundClearance*f;if(s<u&&t.y<.5){let e=Y(u,K.assist.minSwingAltitude*.3*f,s),t=Y(5,14,p);o.y+=K.assist.groundAvoidForce*e*f*t}let m=0,_=0;if(c)m=c.heading.x,_=c.heading.z;else{let e=Math.hypot(r.x,r.z);if(e>.05)m=r.x/e,_=r.z/e;else{let e=Math.hypot(t.x,t.z);e>=2&&(m=t.x/e,_=t.z/e)}}if(m!==0||_!==0){let e=-_,r=m,i=K.assist.swingPlaneAssist*f,a=n.tensionAnalytic;if(i>0&&n.taut&&a>0){let t=-d.x*a,n=-d.z*a,s=t*e+n*r,c=l*45,u=q(s,-c,c)*i*Y(6,16,p);o.x-=e*u,o.z-=r*u}if(c&&n.taut){let n=q(-(t.x*e+t.z*r)*K.assist.arcCorrection*f,-K.assist.arcCorrectionMaxAccel*f,K.assist.arcCorrectionMaxAccel*f);o.x+=e*n*l,o.z+=r*n*l,g+=Math.abs(n)*l*(c.stick?1:.25)}if(c&&(c.wallLeft<K.assist.streetCenterRange||c.wallRight<K.assist.streetCenterRange)){let t=K.assist.streetCenterRange,n=(Y(t,1.5,c.wallLeft)-Y(t,1.5,c.wallRight))*K.assist.streetCentering*l*f;o.x-=e*n,o.z-=r*n}}if(a&&p>6){let n=Math.min(26,p*.4);if(Fl.copy(t).multiplyScalar(1/p),a.raycast(e,Fl,n,Il,0,!1)&&Math.abs(Il.normal.y)<.5){let e=1-Il.t/n,t=Nl.copy(Il.normal).addScaledVector(Fl,-Il.normal.dot(Fl)),i=t.length(),a=0;c?.stick&&h>.05&&(a=Math.max(0,-(r.x*Il.normal.x+r.z*Il.normal.z)/h));let s=K.assist.cornerAvoidForce*e*f*(1-Y(.35,.75,a));i>.001?o.addScaledVector(t,s/i):o.addScaledVector(Il.normal,s*.5)}}}g>0&&v>3&&o.addScaledVector(_,-g*K.web.turnSpeedCost),s?.assist.copy(o).sub(y);let b=n.applyForces(e,t,o);s&&(s.spring=b)}function zl(e,t,n,r,i=Al()){if(i<=0)return;let a=K.assist.groundClearance*i,o=e.anchor.y-n-a-.9,s=e.targetLength;K.assist.autoShorten&&e.length>o?s=Math.max(K.web.minLength,o):K.assist.autoExtend&&r&&e.length<o-6&&t.y>e.anchor.y-e.length*.3&&(s=Math.min(o-2,K.web.maxLength,e.length+8)),e.targetLength=s}function Bl(e,t){let n=Math.max(1,e.length),r=Math.abs(e.swingAngle)*(Math.PI/180),i=K.physics.gravity*K.web.swingGravityScale,a=1-(n*(1-Math.cos(Math.min(r,Math.PI)))+e.tangentialSpeed*e.tangentialSpeed/(2*i))/n,o=a<=0?90:Math.min(90,180/Math.PI*Math.acos(Math.min(1,a)));t.end=Math.max(12,o),t.phase=q(e.swingAngle/t.end,-1,1),t.omega=e.tangentialSpeed/n*(180/Math.PI)}function Vl(e,t,n){let r=K.web;if(e<-.15)return n.fwd=0,n.up=r.swingJumpHop,n;let i=Y(-.1,.92,e),a=(r.swingJumpPitchBottom+(r.swingJumpPitchLate-r.swingJumpPitchBottom)*i)*(Math.PI/180),o=e<0?.55+.45*Y(-.15,0,e):1,s=r.swingJumpSpeed*o*(1+r.swingJumpPerfectBonus*q(t,0,1));return n.fwd=s*Math.cos(a),n.up=Math.max(s*Math.sin(a),e<0?r.swingJumpHop:0),n}function Hl(e,t,n){if(e<=0)return 0;let r=K.web.swingJumpTuckPhase*t,i=(e*t-r)/Math.max(n,5),a=K.web.swingJumpPerfectWindow*.5;return Math.abs(i)<=a?1:q(1-(Math.abs(i)-a)/a,0,1)*.6}function Ul(e=128){return{points:Array.from({length:e},()=>new V),count:0,minClearance:1/0,collided:!1,collideTime:1/0,endSpeed:0,endPos:new V,maxSpeed:0,progress:0,apexHeight:-1/0}}var Wl=new Dl,Gl=new V,Kl=new V,ql=new V,Jl=new V,Yl=kl(),Xl={phase:0,end:90,omega:0};function Zl(e,t,n,r,i,a,o,s,c,l,u=!0){Gl.copy(e),Kl.copy(t),l.count=0,l.minClearance=1/0,l.collided=!1,l.collideTime=1/0,l.maxSpeed=0,l.apexHeight=-1/0;let d=K.physics.mass,f=Math.min(l.points.length,Math.ceil(a/o)),p=!!n;n&&Wl.attach(n,e,-1,r);let m=!!i&&Math.hypot(i.x,i.z)>.1,h=Math.hypot(t.x,t.z);m?Yl.heading.set(i.x,0,i.z).normalize():c&&Math.hypot(c.x,c.z)>.001?Yl.heading.set(c.x,0,c.z).normalize():h>2?Yl.heading.set(t.x/h,0,t.z/h):Yl.heading.set(0,0,-1),Yl.stick=m,Yl.assist=Al(),Yl.wallLeft=Yl.wallRight=1/0;let g=m?i:Jl.copy(Yl.heading).multiplyScalar(K.web.noStickPump),_=e;for(let e=0;e<f;e++){if(p){zl(Wl,Gl,0,!1,Yl.assist),Rl(Gl,Kl,Wl,g,0,null,ql,void 0,Yl),Gl.addScaledVector(Kl,o).addScaledVector(ql,.5*o*o/d),Kl.addScaledVector(ql,o/d),Wl.age+=o;let e=K.web.stiffness*Math.max(0,Wl.stretch);Wl.constrain(Gl,Kl,o,d,e),Wl.reel(o,K.web.reelRate),Wl.takeUpSlack(Gl),u&&(Gl.y>Wl.anchor.y-K.web.detachAboveAnchor&&Kl.y>0?p=!1:Wl.age>.3&&Wl.swingAngle>8&&(Bl(Wl,Xl),(Xl.phase>=K.web.autoReleasePhase||Kl.y<=0)&&(p=!1)))}else{let e=Kl.length();ql.copy(Kl).multiplyScalar(-K.physics.airDrag*e),ql.y-=d*K.physics.gravity,Gl.addScaledVector(Kl,o).addScaledVector(ql,.5*o*o/d),Kl.addScaledVector(ql,o/d)}l.points[e].copy(Gl),l.count=e+1;let t=Gl.y-.9;t<l.minClearance&&(l.minClearance=t),Gl.y>l.apexHeight&&(l.apexHeight=Gl.y);let n=Kl.length();if(n>l.maxSpeed&&(l.maxSpeed=n),s&&!(e&1)&&s.overlapsSphere(Gl,.45)){l.collided=!0,l.collideTime=e*o;break}if(Gl.y<.5){l.collided=!0,l.collideTime=e*o;break}}return l.endSpeed=Kl.length(),l.endPos.copy(Gl),l.progress=c?(Gl.x-_.x)*c.x+(Gl.z-_.z)*c.z:0,l}var Ql=200,$l=class{world;candidates=Array.from({length:Ql},()=>({point:new V,normal:new V,box:-1,source:`ray`,valid:!1,reason:``,score:-1/0,terms:{},predicted:!1,minClearance:0,collided:!1,collideTime:1/0}));count=0;best=null;lastTimeMs=0;predictions=Array.from({length:6},()=>Ul(80));predictionCount=0;hit=Sl();dir=new V;heading=new V;toA=new V;tmp=new V;desired=new V;tdir=new V;ideal=new V;boxes=[];constructor(e){this.world=e}push(e,t,n,r){if(this.count>=Ql)return null;let i=this.candidates[this.count++];return i.point.copy(e),i.normal.copy(t),i.box=n,i.source=r,i.valid=!0,i.reason=``,i.score=-1/0,i.terms={},i.predicted=!1,i.minClearance=0,i.collided=!1,i.collideTime=1/0,i}select(e){let t=performance.now();this.count=0,this.best=null,this.predictionCount=0;let n=this.world,{pos:r,vel:i}=e,a=i.length(),o=sl(i),s=e.input.lengthSq()>.01,c=this.heading.set(0,0,0);o>2&&c.set(i.x/o,0,i.z/o).multiplyScalar(Math.min(1,o/12)*1.2),c.addScaledVector(e.input,1.4);let l=Math.hypot(e.camForward.x,e.camForward.z);l>.001&&c.add(this.tmp.set(e.camForward.x/l,0,e.camForward.z/l).multiplyScalar(.6)),c.lengthSq()<1e-6&&c.set(e.camForward.x,0,e.camForward.z),c.normalize();let u=this.desired.copy(s?e.input:c).setY(0).normalize(),d=q(K.web.idealAnchorAhead+(a-20)*.35,20,40),f=q(K.web.idealAnchorRise+(a-20)*.15,15,30),p=this.ideal.copy(r).addScaledVector(u,d);p.y+=f;let m=Math.max(K.assist.groundClearance+6,r.y-K.web.idealArcDrop-Math.max(0,-i.y)*.25),h=K.anchor.rayCount,g=K.web.attachConeDeg*al,_=Math.atan2(c.x,c.z),v=K.web.maxLength;for(let e=0;e<h;e++){let t=(e+.5)/h,i=_+Math.sin(e*2.39996)*g*Math.sqrt(t),a=(24+56*(e*.618034%1))*al,o=Math.cos(a),s=this.dir.set(Math.sin(i)*o,Math.sin(a),Math.cos(i)*o);n.raycast(r,s,v,this.hit,X.NoWeb,!1)&&this.push(this.tmp.copy(this.hit.point).addScaledVector(this.hit.normal,.05),this.hit.normal,this.hit.box,`ray`)}let y=v*.7,b=this.boxes;b.length=0,n.queryRect(p.x-y,p.z-y,p.x+y,p.z+y,e=>{!(n.kind[e]&X.Building)||n.kind[e]&(X.NoWeb|X.Low)||n.maxY[e]<r.y+K.web.minAnchorHeightAbovePlayer||b.push(e)}),b.sort((e,t)=>eu(n,e,p)-eu(n,t,p));let x=this.dir;for(let e=0;e<Math.min(24,b.length);e++){let t=b[e],i=n.minX[t],a=n.maxX[t],o=n.minZ[t],s=n.maxZ[t],c=n.maxY[t],l=q(p.y,n.minY[t]+2,c-.3);for(let e=0;e<4;e++){let n,u;if(e===0){if(r.x>=i)continue;x.set(-1,0,0),n=i,u=q(p.z,o+.3,s-.3)}else if(e===1){if(r.x<=a)continue;x.set(1,0,0),n=a,u=q(p.z,o+.3,s-.3)}else if(e===2){if(r.z>=o)continue;x.set(0,0,-1),u=o,n=q(p.x,i+.3,a-.3)}else{if(r.z<=s)continue;x.set(0,0,1),u=s,n=q(p.x,i+.3,a-.3)}let d=n+x.x*.05,f=u+x.z*.05;this.push(this.tmp.set(d,c-.3,f),x,t,`edge`),l<c-3&&this.push(this.tmp.set(d,l,f),x,t,`facade`)}}let S=K.anchor,C=this.tdir.set(o>2?i.x/o:c.x,0,o>2?i.z/o:c.z),w=Math.sign(C.x*u.z-C.z*u.x),T=s?1-q(C.dot(u),-1,1):0,E=Math.cos(K.web.attachConeDeg*al);for(let t=0;t<this.count;t++){let l=this.candidates[t],p=this.toA.subVectors(l.point,r),h=p.length(),g=p.y,_=Math.hypot(p.x,p.z),y=l.terms;if(l.box<0||!(n.kind[l.box]&(X.Building|X.Prop))||n.kind[l.box]&X.NoWeb){l.valid=!1,l.reason=`not structure`;continue}if(g<K.web.minAnchorHeightAbovePlayer){l.valid=!1,l.reason=`too low`;continue}if(h>v){l.valid=!1,l.reason=`too far`;continue}if(h<Math.max(K.web.minLength*1.4,a*.45)){l.valid=!1,l.reason=`too close`;continue}if(Math.atan2(g,_)<K.web.minAnchorElevationDeg*al){l.valid=!1,l.reason=`too shallow`;continue}let b=_>.001?p.x/_:0,x=_>.001?p.z/_:0,D=b*c.x+x*c.z;if(_>4&&D<E-(a<5?.6:0)){l.valid=!1,l.reason=`outside cone`;continue}let O=o>2?(p.x*i.x+p.z*i.z)/(_*o+1e-6):D,k=Math.acos(q(o>4?O:D,-1,1))/al;if(o>15&&k>65){l.valid=!1,l.reason=`sideways at speed`;continue}this.tmp.set(r.x,r.y+.6,r.z);let A=this.dir.subVectors(l.point,this.tmp),j=A.length();if(A.multiplyScalar(1/j),n.raycast(this.tmp,A,j-.6,this.hit,X.NoWeb,!1)){l.valid=!1,l.reason=`occluded`;continue}let M=p.x*u.x+p.z*u.z,N=Math.abs(p.x*u.z-p.z*u.x);y.ahead=q(1-((M-d)/13)**2,-3,1),y.height=q(1-((g-f)/11)**2,-2,1),y.bottom=q(1-((l.point.y-h-m)/10)**2,-2,1),y.length=-Y(45,75,h),y.prop=n.kind[l.box]&X.Building?0:-1;let ee=6+.2*Math.max(0,M);y.side=Math.exp(-((Math.max(0,N-ee)/8)**2))*2-1,y.tall=Y(r.y+5,r.y+90,n.maxY[l.box]),y.direction=.5+.5*O,y.camera=.5+.5*((p.x*e.camForward.x+p.y*e.camForward.y+p.z*e.camForward.z)/(h+1e-6)),y.input=s?.5+.5*(b*u.x+x*u.z):.5;let P=Math.sign(C.x*p.z-C.z*p.x);if(y.turn=T>.15?P===w?T:-T*.5:0,e.prevAnchor){let t=l.point.distanceTo(e.prevAnchor);y.continuity=t<6?-1:Math.min(1,t/30)}else y.continuity=.5;y.visibility=l.source===`ray`?1:.85,y.plane=o>4?(Math.exp(-((Math.max(0,k-12)/16)**2))*2-1)*(.6+.8*Math.min(1,(o-4)/16)):0,l.score=S.wAhead*y.ahead+S.wHeight*y.height+S.wSide*y.side*Math.max(.3,1-T)+S.wBottom*y.bottom+S.wLength*y.length+S.wProp*y.prop+S.wTall*y.tall+S.wDirection*y.direction+S.wCamera*y.camera+S.wInput*y.input+S.wTurn*y.turn+S.wContinuity*y.continuity+S.wVisibility*y.visibility+S.wPlane*y.plane*Math.max(.15,1-1.6*T)}let D=[];for(let e=0;e<this.count;e++)this.candidates[e].valid&&D.push(e);D.sort((e,t)=>this.candidates[t].score-this.candidates[e].score);let O=Math.min(8,D.length),k=e.stick??s;for(let t=0;t<O;t++){let o=this.candidates[D[t]],s=this.predictions[Math.min(this.predictions.length-1,this.predictionCount)];Zl(r,i,o.point,r.distanceTo(o.point),k?e.input:null,K.assist.predictHorizon,1/30,n,u,s),this.predictionCount<this.predictions.length&&this.predictionCount++,o.predicted=!0,o.minClearance=s.minClearance,o.collided=s.collided,o.collideTime=s.collideTime,s.collided&&s.collideTime<.5&&(o.valid=!1,o.reason=`immediate collision`);let c=o.terms;c.clearance=s.collided?-2+Math.min(1,s.collideTime/K.assist.predictHorizon):Math.min(1,s.minClearance/K.assist.groundClearance)-.2;let l=(s.endSpeed-a)/20,d=s.progress/(Math.max(8,a)*K.assist.predictHorizon);c.speedGain=q(l*.5+d*.5,-1,1),o.score+=S.wClearance*c.clearance+S.wSpeedGain*c.speedGain}for(let e=O;e<D.length;e++)this.candidates[D[e]].score-=1.5;let A=null;for(let e of D){let t=this.candidates[e];t.valid&&(!A||t.score>A.score)&&(A=t)}return this.best=A,this.lastTimeMs=performance.now()-t,A}};function eu(e,t,n){let r=Math.max(e.minX[t]-n.x,0,n.x-e.maxX[t]),i=Math.max(e.minZ[t]-n.z,0,n.z-e.maxZ[t]);return r*r+i*i}var tu=new Map;function nu(e){tu.set(e.id,e)}function ru(e){let t=tu.get(e);if(!t)throw Error(`state ${e} not registered`);return t}var iu=class{p;current;previous=null;time=0;history=[];lastInput=null;constructor(e){this.p=e,this.current=ru(`Airborne`)}reset(e){this.current=ru(e),this.previous=null,this.time=0,this.current.enter?.(this.p,null,this.lastInput)}step(e,t){this.lastInput=t,this.time+=e;let n=this.current.step(this.p,e,t);for(let e=0;n&&e<3&&n!==this.current.id;e++)n=this.transition(n,t)}transition(e,t){let n=this.current;n.exit?.(this.p,e),this.previous=n.id,this.current=ru(e),this.time=0,this.history.push({from:n.id,to:e,t:this.p.simTime}),this.history.length>200&&this.history.shift(),this.p.emit(`state`),this.pendingRedirect=null,this.current.enter?.(this.p,n.id,t);let r=this.pendingRedirect;return this.pendingRedirect=null,r}redirect(e){this.pendingRedirect=e}pendingRedirect=null},au=.4,ou=[-.5,0,.45],su=.9,cu=new V,lu=new V,uu=new V,du=new V;new V(0,1,0);function fu(e,t){return Math.atan2(-e,-t)}function pu(e,t){return e.moveWorld(t)}function mu(e,t,n,r=!0){let i=K.physics.mass,a=1;e.jumpHeldFromGround&&(n.jump&&e.vel.y>0&&e.stateTime<.45?a=K.ground.jumpHoldGravityScale:n.jump||(e.jumpHeldFromGround=!1));let o=n.dive&&!e.onGround;e.diveTime=o?e.diveTime+t:0;let s=cu.set(0,-i*K.physics.gravity*a,0),c=e.vel.length(),l=o?K.physics.diveDrag:K.physics.airDrag;s.addScaledVector(e.vel,-l*c);let u=pu(n,lu),d=u.length();if(r&&d>.05){u.multiplyScalar(1/d);let t=sl(e.vel);if((t>.01?e.vel.x*u.x+e.vel.z*u.z:0)<K.air.airSteerMaxSpeedGain+6&&(s.x+=u.x*i*K.air.airSteerAccel*d,s.z+=u.z*i*K.air.airSteerAccel*d),t>1){let n=e.vel.x/t,r=e.vel.z/t,a=u.x*n+u.z*r,o=u.x-n*a,c=u.z-r*a,l=i*K.air.airSteerAccel*1.1*d;s.x+=o*l,s.z+=c*l}}if(o){let t=n.camForward,r=uu;if(t.y<-.25)r.copy(t);else{let t=sl(e.vel);r.set(t>1?e.vel.x/t*.35:0,-1,t>1?e.vel.z/t*.35:0).normalize()}let a=e.vel.dot(r),o=(e.diveTime>.45?K.air.fastDiveAccel:K.air.diveAccel)*(1-Y(K.physics.maxDiveSpeed-10,K.physics.maxDiveSpeed,a));s.addScaledVector(r,i*o)}e.vel.addScaledVector(s,t/i),e.limitSpeed(t,o,!o&&e.timeSinceRelease<1),e.moveAndCollide(t),e.onGround||(e.timeSinceGround+=t),sl(e.vel)>1.5&&(e.facing=hu(e.facing,fu(e.vel.x,e.vel.z),6*t))}function hu(e,t,n){let r=t-e;for(;r>Math.PI;)r-=2*Math.PI;for(;r<-Math.PI;)r+=2*Math.PI;return e+Math.max(-n,Math.min(n,r))}function gu(e){let t=Math.max(0,-e.preImpactVel.y);e.landingImpact=t;let n=sl(e.preImpactVel);return e.rope.active&&e.rope.detach(),t>=K.landing.hardSpeed||t>=K.landing.rollSpeed&&n<=7?(e.emit(`hardLand`,t),`Recovery`):t>=K.landing.rollSpeed?(e.emit(`roll`,t),`Landing`):(e.emit(`land`,t),`Grounded`)}function _u(e,t,n=!0){if(t.zipPressed&&yu(e,t))return`WebZip`;if(n&&t.traverse&&e.webCooldown<=0&&e.feetY-e.surfaceBelow()>2.5&&(e.chainPending?e.timeSinceRelease>=K.web.chainDelay:t.traversePressed?e.timeSinceRelease>=.1:e.timeSinceRelease>K.web.refireDelay||e.vel.y<-1)){let n=pu(t,lu);if(n.lengthSq()<.01){let r=Math.hypot(e.vel.x,e.vel.z);r>4?n.set(e.vel.x/r,0,e.vel.z/r).multiplyScalar(.6):t.camForwardFlat(n).multiplyScalar(.6)}if(e.tryAttachWeb(t,n))return e.chainPending=!1,`Swinging`}return null}function vu(e,t){if(e.onGround&&e.vel.y<=.5)return gu(e);if(e.wallContact){let n=du.copy(e.wallContactNormal).multiplyScalar(-1);return e.vel.y<9&&e.findLedge(n,2.4,.9,e.moveTo)?`Mantling`:e.wallBox>=0&&e.world.kind[e.wallBox]&X.Low?null:(e.wallNormal.copy(e.wallContactNormal),t.traverse?`WallRunning`:`WallCrawling`)}return null}function yu(e,t){if(e.perchTarget)return e.zipPoint=e.perchTarget,e.zipTarget.set(e.zipPoint.x,e.zipPoint.y+su+.05,e.zipPoint.z),!0;let n=!e.onGround&&e.feetY-e.surfaceBelow()>1;if(n&&e.airZips>=K.zip.maxAirZips)return e.emit(`webFail`),!1;let r=uu.copy(t.camForward);r.y=Math.max(r.y,.08),r.normalize();let i=du.set(e.pos.x,e.pos.y+.6,e.pos.z);return e.world.raycast(i,r,K.zip.zipForwardDistance,e.hit,X.NoWeb,!0)&&e.hit.t>6?(e.zipPoint=null,e.zipTarget.copy(e.hit.point),n&&e.airZips++,!0):(e.emit(`webFail`),!1)}function bu(e,t,n){return e.vel.y=t,e.jumpHeldFromGround=!n,e.onGround=!1,e.timeSinceGround=1,e.jumpCharge=0,e.jumpBufferT=0,e.emit(n?`superJump`:`jump`,t),`Airborne`}function xu(e,t){let n=e.wallNormal;if(e.state===`WallRunning`&&e.wallMode===`horizontal`){let t=n.z*e.wallSide,r=-n.x*e.wallSide,i=Math.max(Math.abs(e.vel.x*t+e.vel.z*r),K.wall.wallRunSpeed)*.97;e.vel.set(t*i+n.x*K.wall.wallLaunchOut,K.wall.wallLaunchUp,r*i+n.z*K.wall.wallLaunchOut),e.facing=fu(e.vel.x,e.vel.z)}else{let r=t.camForwardFlat(uu),i=du.copy(n);r.dot(n)>.1&&i.add(r).normalize(),e.vel.set(i.x*K.wall.wallJumpOut,K.wall.wallJumpUp,i.z*K.wall.wallJumpOut),e.facing=fu(i.x,i.z)}return e.pos.addScaledVector(n,.1),e.timeSinceRelease=0,e.chainPending=!0,e.emit(`wallJump`),`Airborne`}var Su=new V,Cu=new V,wu=new V,Tu=new V;function Eu(e,t,n,r=1){let i=pu(n,Su),a=i.length(),o=(n.traverse?K.ground.sprintSpeed:J(K.ground.walkSpeed,K.ground.jogSpeed,Y(.25,.85,a)))*r,s=Cu.set(e.vel.x,0,e.vel.z),c=s.length();if(a>.08){if(i.multiplyScalar(1/a),c>.8){let e=Math.atan2(s.x,s.z),n=Math.atan2(i.x,i.z)-e;for(;n>Math.PI;)n-=2*Math.PI;for(;n<-Math.PI;)n+=2*Math.PI;if(Math.abs(n)>2.6&&c>7)c=Math.max(0,c-K.ground.decel*1.4*t);else{let r=K.ground.turnRate*(c>10?.55:1),i=e+Math.max(-r*t,Math.min(r*t,n));s.set(Math.sin(i),0,Math.cos(i));let l=o*a,u=c<l?c>K.ground.jogSpeed?K.ground.sprintAccel:K.ground.accel:K.ground.decel*.6;c=c<l?Math.min(l,c+u*t):Math.max(l,c-u*t)}}else s.copy(i),c=Math.min(o*a,c+K.ground.accel*t);c>0&&s.normalize()}else c=Math.max(0,c-K.ground.decel*t),c>0&&s.normalize();e.vel.x=s.x*c,e.vel.z=s.z*c,e.vel.y=Math.min(e.vel.y,0)-K.physics.gravity*t,e.moveAndCollide(t),c>.3?e.facing=hu(e.facing,fu(e.vel.x,e.vel.z),14*t):a>.08&&(e.facing=hu(e.facing,fu(i.x,i.z),10*t))}nu({id:`Grounded`,group:`Locomotion`,enter(e){e.timeSinceGround=0,e.jumpCharge=0,e.diveTime=0,e.rope.detach(),e.vel.y<0&&(e.vel.y=0);let t=sl(e.vel),n=K.ground.sprintSpeed*1.25;t>n&&(e.vel.x*=n/t,e.vel.z*=n/t)},step(e,t,n){if(e.jumpBufferT>0&&e.jumpCharge===0){if(e.hSpeed<3&&!n.traverse)e.jumpCharge=1e-4;else{let t=n.traverse?1.06:1;return e.vel.x*=t,e.vel.z*=t,bu(e,K.ground.jumpSpeed,!1)}}if(e.jumpCharge>0){if(n.jump)e.jumpCharge+=t;else{let t=Math.min(1,e.jumpCharge/K.ground.superJumpChargeTime),n=t>.45;return bu(e,n?J(K.ground.jumpSpeed*1.3,K.ground.superJumpSpeed,t):K.ground.jumpSpeed,n)}}if(n.zipPressed&&yu(e,n))return`WebZip`;Eu(e,t,n,e.jumpCharge>0?.2:1);let r=e.hSpeed;if(e.wallContact&&e.wallBox>=0){let t=e.world.kind[e.wallBox],i=e.world.maxY[e.wallBox]-e.feetY;if(i<1.8&&i>.3&&r>2.5&&Du(e,e.wallBox))return`Vaulting`;if(n.traverse&&!(t&X.Low)&&i>2.5)return e.wallNormal.copy(e.wallContactNormal),`WallRunning`;if(i<=2.4&&i>.3&&n.traverse&&e.findLedge(wu.copy(e.wallContactNormal).multiplyScalar(-1),2.4,.8,e.moveTo))return`Mantling`}if(r>3){let t=Tu.set(e.vel.x/r,0,e.vel.z/r),i=wu.set(e.pos.x,e.feetY+.5,e.pos.z);if(e.world.raycast(i,t,.5+r*.09,e.hit,X.NoWeb,!1)&&e.hit.box>=0&&Math.abs(e.hit.normal.y)<.3){let t=e.world.maxY[e.hit.box]-e.feetY;if(t>.3&&t<1.8&&Du(e,e.hit.box))return`Vaulting`}if(n.traverse&&r>7){let n=wu.set(e.pos.x+t.x*1.3,e.pos.y,e.pos.z+t.z*1.3);if(!e.world.raycast(n,Su.set(0,-1,0),2.4,e.hit))return e.vel.x*=1.12,e.vel.z*=1.12,bu(e,K.ground.jumpSpeed*.95,!1)}}if(e.probeGround(!0,.4)||e.onGround)e.timeSinceGround=0;else if(e.timeSinceGround+=t,e.timeSinceGround>K.ground.coyoteTime)return`Airborne`;return null}});function Du(e,t){let n=Math.max(4,e.hSpeed),r=e.world,i=e.vel.x/e.hSpeed||-Math.sin(e.facing),a=e.vel.z/e.hSpeed||-Math.cos(e.facing),o=i>.001?(r.maxX[t]-e.pos.x)/i:i<-.001?(r.minX[t]-e.pos.x)/i:1/0,s=a>.001?(r.maxZ[t]-e.pos.z)/a:a<-.001?(r.minZ[t]-e.pos.z)/a:1/0,c=Math.min(o,s);if(!Number.isFinite(c)||c>7)return!1;let l=r.maxY[t],u=c+1;e.moveFrom.copy(e.pos),e.moveTo.set(e.pos.x+i*u,e.pos.y,e.pos.z+a*u);let d=r.heightBelow(wu.set(e.moveTo.x,l+2,e.moveTo.z),400);return e.moveTo.y=Math.max(d,0)+su,e.moveTo.y<e.pos.y-3&&(e.moveTo.y=e.pos.y),e.moveApex.set((e.moveFrom.x+e.moveTo.x)/2,l+su+.35,(e.moveFrom.z+e.moveTo.z)/2),e.moveDur=Math.max(.22,Math.min(.5,u/n)),e.emit(`vault`),!0}nu({id:`Airborne`,group:`Air`,step(e,t,n){return _u(e,n)||(n.trickPressed&&e.surfaceBelow()<e.feetY-4?`Trick`:(mu(e,t,n),vu(e,n)))}}),nu({id:`Trick`,group:`Air`,enter(e,t,n){let r=n?.moveX??0,i=n?.moveY??0;e.trickKind=Math.abs(r)>.5?r>0?2:3:+(i<-.5),e.emit(`trick`,e.trickKind)},step(e,t,n){return _u(e,n)||(mu(e,t,n),vu(e,n)||(e.stateTime>K.air.trickDuration?`Airborne`:null))}}),nu({id:`Landing`,group:`Locomotion`,enter(e){let t=e.hSpeed,n=Math.min(t,19);t>.1&&(e.vel.x*=n/t,e.vel.z*=n/t),e.vel.y=0},step(e,t,n){if(e.stateTime>.12&&e.jumpBufferT>0)return bu(e,K.ground.jumpSpeed*1.1,!1);let r=e.hSpeed,i=Math.max(n.traverse?K.ground.sprintSpeed*.9:K.ground.jogSpeed,r-10*t);return r>.1&&(e.vel.x*=Math.min(r,i)/r,e.vel.z*=Math.min(r,i)/r),e.vel.y=Math.min(e.vel.y,0)-K.physics.gravity*t,e.moveAndCollide(t),!e.probeGround(!0,.5)&&!e.onGround&&e.stateTime>.1?`Airborne`:e.stateTime>K.landing.rollTime?`Grounded`:null}}),nu({id:`Recovery`,group:`Locomotion`,enter(e){e.vel.set(e.vel.x*.2,0,e.vel.z*.2)},step(e,t,n){if(e.stateTime>.15&&e.jumpBufferT>0)return bu(e,K.ground.jumpSpeed*1.15,!1);if(e.stateTime>.2&&n.zipPressed&&yu(e,n))return`WebZip`;e.vel.x*=Math.exp(-10*t),e.vel.z*=Math.exp(-10*t),e.vel.y=-1,e.moveAndCollide(t),e.probeGround(!0,.5);let r=n.moveMag>.5&&e.stateTime>K.landing.recoveryTime*.6;return e.stateTime>K.landing.recoveryTime||r?`Grounded`:null}});var Ou=new V,ku=new V,Au=new V,ju=new V,Mu=new V,Nu={phase:0,end:90,omega:0},Pu={fwd:0,up:0};function Fu(e,t){return e<=0||t<-2?0:Y(.18,.62,e)}function Iu(e,t=!1){let n=e.rope,r=Fu(e.swingPhase,e.vel.y)*Y(.12,.45,n.age),i=r*(t?K.web.autoReleaseScale:1);e.releaseQuality=r;let a=sl(e.vel);return a>.5&&(e.vel.x+=e.vel.x/a*K.web.releaseBoost*i,e.vel.z+=e.vel.z/a*K.web.releaseBoost*i),e.vel.y+=K.web.releaseUpBoost*i,n.detach(),e.timeSinceRelease=0,e.webCooldown=Math.max(e.webCooldown,.08),e.chainPending=t,e.emit(`webRelease`,r),`Airborne`}function Lu(e,t){let n=e.rope,r=Y(.1,.35,n.age),i=Hl(e.swingPhase,e.swingArcEnd,e.swingOmega)*+(n.age>.25);Vl(e.swingPhase,i,Pu);let a=0,o=0,s=sl(e.vel);s>1?(a=e.vel.x/s,o=e.vel.z/s):(a=e.swingCtx.heading.x,o=e.swingCtx.heading.z);let c=pu(t,ku);if(c.lengthSq()>.01){let e=c.length();a+=c.x/e*.6,o+=c.z/e*.6;let t=Math.hypot(a,o)||1;a/=t,o/=t}e.vel.x+=a*Pu.fwd*r,e.vel.z+=o*Pu.fwd*r,e.vel.y+=Pu.up*(.4+.6*r);let l=i>=1?1:i;return e.swingJumpQuality=l,e.swingJumpPhase=e.swingPhase,e.releaseQuality=l,n.detach(),e.timeSinceRelease=0,e.webCooldown=Math.max(e.webCooldown,.08),e.chainPending=!1,e.emit(`swingJump`,l),e.emit(`webRelease`,l),`Airborne`}function Ru(e){let t=e.rope,n=sl(e.vel),r=t.anchor.x,i=t.anchor.z;if(n>2){let a=e.vel.x/n,o=e.vel.z/n,s=(t.anchor.x-e.pos.x)*a+(t.anchor.z-e.pos.z)*o;if(s>0)r=e.pos.x+a*s,i=e.pos.z+o*s;else return 0}return Au.set(r,Math.min(t.anchor.y-1,e.pos.y+60),i),e.world.heightBelow(Au,400)}function zu(e){let t=e.swingCtx,n=t.heading,r=K.assist.streetCenterRange+4;Au.set(e.pos.x,e.pos.y,e.pos.z),ju.set(-n.z,0,n.x),t.wallLeft=e.world.raycast(Au,ju,r,e.hit,X.NoWeb|X.Low,!1)&&Math.abs(e.hit.normal.y)<.3?e.hit.t:1/0,ju.set(n.z,0,-n.x),t.wallRight=e.world.raycast(Au,ju,r,e.hit,X.NoWeb|X.Low,!1)&&Math.abs(e.hit.normal.y)<.3?e.hit.t:1/0}function Bu(e){Bl(e.rope,Nu),e.swingPhase=Nu.phase,e.swingArcEnd=Nu.end,e.swingOmega=Nu.omega;let t=K.web.swingJumpTuckPhase*Nu.end,n=(Nu.phase*Nu.end-t)/Math.max(Nu.omega,5);e.swingTuck=Nu.phase>0?q(1-Math.abs(n)/(K.web.swingJumpPerfectWindow*2),0,1):0}nu({id:`Swinging`,group:`Web`,enter(e,t,n){e.emit(`webAttach`,e.rope.length),e.losTimer=0,e.arcGroundTimer=0,e.wallProbeT=0,e.chainPending=!1;let r=e.swingCtx,i=n?pu(n,ku):ku.set(0,0,0),a=sl(e.vel);if(i.lengthSq()>.01)r.heading.copy(i).setY(0).normalize();else if(a>2)r.heading.set(e.vel.x/a,0,e.vel.z/a);else{let t=e.rope.anchor.x-e.pos.x,i=e.rope.anchor.z-e.pos.z,a=Math.hypot(t,i);a>.5?r.heading.set(t/a,0,i/a):n&&n.camForwardFlat(r.heading)}r.wallLeft=r.wallRight=1/0,e.swingPhase=-1,e.swingTuck=0},exit(e){e.rope.active&&e.rope.detach(),e.swingTuck=0},step(e,t,n){let r=e.rope;if(!r.active)return`Airborne`;if(n.jumpPressed)return Lu(e,n);if(!n.traverse)return Iu(e,!1);if(n.zipPressed)return r.detach(),yu(e,n)?`WebZip`:`Airborne`;let i=K.physics.mass,a=e.swingCtx;a.assist=Al();let o=pu(n,ku);a.stick=o.lengthSq()>=.01;let s;a.stick?(a.heading.copy(o).setY(0).normalize(),s=o):s=Mu.copy(a.heading).multiplyScalar(K.web.noStickPump),e.arcGroundTimer-=t,e.arcGroundTimer<=0&&(e.arcGroundTimer=.08,e.arcGroundY=Ru(e)),e.wallProbeT-=t,e.wallProbeT<=0&&(e.wallProbeT=.066,a.assist>0?zu(e):a.wallLeft=a.wallRight=1/0);let c=Math.max(e.surfaceBelow(),e.arcGroundY);zl(r,e.pos,c,n.dive,a.assist),n.reel&&(r.targetLength=Math.max(K.web.minLength,r.length-K.web.reelRate*t*2)),Rl(e.pos,e.vel,r,s,c,e.world,Ou,e.swingDbg,a),e.vel.addScaledVector(Ou,t/i),r.age+=t,e.limitSpeed(t,!1,!0),e.moveAndCollide(t);let l=e.swingDbg.spring;if(r.constrain(e.pos,e.vel,t,i,l),r.reel(t,K.web.reelRate),r.takeUpSlack(e.pos),r.measure(e.pos,e.vel,r.gEff),Bu(e),sl(e.vel)>1&&(e.facing=hu(e.facing,fu(e.vel.x,e.vel.z),5*t)),e.onGround&&e.vel.y<=.5)return gu(e);if(e.wallContact&&e.wallBox>=0&&!(e.world.kind[e.wallBox]&X.Low)){let t=e.wallContactNormal;e.wallNormal.copy(t),r.detach();let n=-(e.preImpactVel.x*t.x+e.preImpactVel.z*t.z);return K.assist.strength<K.assist.wallSlamBelow&&n>K.wall.slamSpeed?(e.vel.set(e.vel.x*.3+t.x*3,Math.min(e.vel.y,0)*.5,e.vel.z*.3+t.z*3),e.timeSinceRelease=0,e.emit(`wallSlam`,n),`Airborne`):`WallRunning`}if(e.pos.y>r.anchor.y-K.web.detachAboveAnchor&&e.vel.y>0||r.age>.3&&r.swingAngle>8&&(e.swingPhase>=K.web.autoReleasePhase||e.vel.y<=0))return Iu(e,!0);if(e.losTimer-=t,e.losTimer<=0){e.losTimer=.1;let t=Au.set(e.pos.x,e.pos.y+.6,e.pos.z),n=ju.subVectors(r.anchor,t),i=n.length();if(i>2&&e.world.raycast(t,n.multiplyScalar(1/i),i-1,e.hit,X.NoWeb,!1))return r.detach(),e.timeSinceRelease=0,e.emit(`webRelease`,0),`Airborne`}return null}});var Vu=new V,Hu=new V,Uu=new V;function Wu(e){let t=K.zip.pointPerfectWindow,n=Math.abs(e);return n<=t?1:q(1-(n-t)/(t*1.5),0,1)*.5}nu({id:`WebZip`,group:`Web`,enter(e){if(e.launchQueued=!1,e.launchPressT=-10,e.rope.detach(),e.zipWebPoint.copy(e.zipTarget),e.zipPoint&&(e.zipWebPoint.y-=su),!e.zipPoint){let t=Vu.subVectors(e.zipTarget,e.pos).normalize(),n=e.vel.dot(t);e.zipBurstSpeed=q(Math.max(0,n)+K.zip.zipBurst,K.zip.zipMinSpeed,Math.max(K.zip.zipMaxSpeed,n));let r=Math.max(0,e.zipBurstSpeed-Math.max(0,n));e.vel.addScaledVector(t,r*.7)}e.emit(`zip`,+!!e.zipPoint)},step(e,t,n){n.jumpPressed&&!e.launchQueued&&(e.launchQueued=!0,e.launchPressT=e.simTime);let r=Vu.subVectors(e.zipTarget,e.pos),i=r.length();if(r.multiplyScalar(1/Math.max(i,1e-4)),e.zipPoint){let n=Math.min(K.zip.zipSpeed,i*7+5),a=Hu.copy(r).multiplyScalar(n).sub(e.vel),o=K.zip.zipAccel*t;a.length()>o&&a.setLength(o),e.vel.add(a),e.moveAndCollide(t),sl(e.vel)>1&&(e.facing=fu(e.vel.x,e.vel.z));let s=e.vel.dot(Uu.subVectors(e.zipTarget,e.pos))<0;return i<.7||i<2.5&&s||e.stateTime>.4&&e.speed<.5?(e.pos.copy(e.zipTarget),e.launchQueued?(e.pointLaunchQuality=Wu(e.simTime-e.launchPressT),`PointLaunch`):`Perching`):e.stateTime>2.5?`Airborne`:null}let a=e.vel.dot(r);a<e.zipBurstSpeed&&e.vel.addScaledVector(r,Math.min(e.zipBurstSpeed-a,K.zip.zipAccel*t));let o=Hu.copy(e.vel).addScaledVector(r,-e.vel.dot(r));return e.vel.addScaledVector(o,-Math.min(1,6*t)),e.vel.y-=K.physics.gravity*.3*t,e.limitSpeed(t,!1,!0),e.moveAndCollide(t),sl(e.vel)>1&&(e.facing=fu(e.vel.x,e.vel.z)),e.onGround&&e.vel.y<=0?gu(e):vu(e,n)||(e.stateTime>K.zip.zipBurstTime||i<5?(e.timeSinceRelease=.15,`Airborne`):null)}}),nu({id:`PointLaunch`,group:`Air`,enter(e,t,n){let r=n?n.camForwardFlat(Uu):Uu.set(-Math.sin(e.facing),0,-Math.cos(e.facing)),i=e.pointLaunchQuality,a=1+K.zip.pointPerfectBonus*i;e.vel.set(r.x*K.zip.pointLaunchForward*a,K.zip.pointLaunchUp*(1+K.zip.pointPerfectBonus*.6*i),r.z*K.zip.pointLaunchForward*a),e.facing=fu(r.x,r.z),e.timeSinceRelease=0,e.emit(`pointLaunch`,i),e.pointLaunchQuality=0},step(e,t,n){if(e.stateTime>.2){let t=_u(e,n);if(t)return t}return mu(e,t,n,e.stateTime>.15),vu(e,n)||(e.stateTime>.45?`Airborne`:null)}}),nu({id:`Perching`,group:`Parkour`,enter(e){e.vel.set(0,0,0),e.emit(`perch`)},step(e,t,n){if(e.vel.set(0,0,0),n.jumpPressed||e.jumpBufferT>0){if(e.stateTime<K.zip.pointLaunchWindow)return e.pointLaunchQuality=Wu(e.stateTime),`PointLaunch`;let t=n.camForwardFlat(Uu);return e.vel.set(t.x*9,0,t.z*9),e.facing=fu(t.x,t.z),bu(e,K.ground.jumpSpeed*1.15,!1)}if(n.zipPressed&&yu(e,n))return`WebZip`;if(n.traversePressed){let t=n.camForwardFlat(Uu);return e.vel.set(t.x*12,4,t.z*12),e.timeSinceRelease=.3,`Airborne`}if(n.dropPressed)return e.vel.set(0,-2,0),`Airborne`;if(n.moveMag>.6&&e.stateTime>.25){let t=n.moveWorld(Uu);return e.vel.set(t.x*5,3,t.z*5),`Airborne`}let r=n.camForwardFlat(Uu);return e.facing=fu(r.x,r.z),null}});var Gu=new V,Ku=new V,qu=new V,Ju=new V,Yu=new V;function Xu(e,t){return t.set(e.z,0,-e.x)}function Zu(e,t){let n=t.moveWorld(Ku),r=e.wallNormal,i=Xu(r,Gu);return{up:-(n.x*r.x+n.z*r.z),side:n.x*i.x+n.z*i.z}}function Qu(e,t){let n=e.wallNormal;if(e.wallContact&&e.wallContactNormal.dot(n)<.5){let t=Ju.copy(n);n.copy(e.wallContactNormal);let r=Xu(n,Gu),i=Math.hypot(e.vel.x,e.vel.z);return e.wallSide=Math.sign(r.dot(t))||1,e.vel.x=r.x*e.wallSide*i,e.vel.z=r.z*e.wallSide*i,e.emit(`cornerWrap`,0),`wrapped`}if(e.probeWall(n,1.3)){n.copy(e.hit.normal).setY(0).normalize();let r=au+.03,i=e.hit.t;return e.pos.addScaledVector(n,(r-i)*Math.min(1,20*t)),`ok`}if(e.vel.y>-1&&e.findLedge(Yu.copy(n).multiplyScalar(-1),2.6,.9,e.moveTo)||e.probeWall(n,1.6,-.8))return`top`;let r=Xu(n,Gu),i=e.vel.dot(r);if(Math.abs(i)>1.5){let t=Math.sign(i),a=qu.copy(r).multiplyScalar(t),o=Ju.copy(e.pos).addScaledVector(a,au+.8).addScaledVector(n,-(au+.6)),s=Yu.copy(a).multiplyScalar(-1);if(e.world.raycast(o,s,2,e.hit,0,!1)&&Math.abs(e.hit.normal.y)<.3){let t=Ku.copy(n);n.copy(e.hit.normal).setY(0).normalize(),e.pos.set(e.hit.point.x+n.x*(au+.05),e.pos.y,e.hit.point.z+n.z*(au+.05));let r=Xu(n,Gu);e.wallSide=Math.sign(r.dot(t.multiplyScalar(-1)))||1;let a=Math.abs(i);return e.vel.x=r.x*e.wallSide*a,e.vel.z=r.z*e.wallSide*a,e.emit(`cornerWrap`,1),`wrapped`}}return`lost`}function $u(e,t){return t===`top`?e.findLedge(Yu.copy(e.wallNormal).multiplyScalar(-1),2.6,1,e.moveTo)?`Mantling`:(e.vel.set(-e.wallNormal.x*5,Math.max(e.vel.y,9),-e.wallNormal.z*5),e.emit(`vault`),`Airborne`):t===`lost`?`Airborne`:null}nu({id:`WallRunning`,group:`Wall`,enter(e,t){let n=e.wallNormal,r=Xu(n,Gu),i=t===`Swinging`?e.preImpactVel:e.vel,a=Math.max(0,-(i.x*n.x+i.z*n.z)),o=i.dot(r);if(t===`Grounded`||t===`WallCrawling`||a>Math.abs(o)*.9){e.wallMode=`vertical`;let t=Math.min(K.wall.wallRunMaxSpeed*.75,Math.max(K.wall.wallRunUpSpeed,i.y,a*.8));e.vel.set(r.x*o*.3,t,r.z*o*.3)}else{e.wallMode=`horizontal`,e.wallSide=Math.sign(o)||1;let t=Math.min(K.wall.wallRunMaxSpeed,Math.max(K.wall.wallRunSpeed,Math.abs(o)+a*.35));e.vel.set(r.x*e.wallSide*t,Math.max(i.y*.4,2),r.z*e.wallSide*t)}e.emit(`wallRun`,+(e.wallMode===`vertical`))},step(e,t,n){if(n.jumpPressed)return xu(e,n);if(n.zipPressed&&yu(e,n))return`WebZip`;if(!n.traverse)return`WallCrawling`;let r=e.wallNormal,i=Xu(r,Gu),a=Zu(e,n);e.wallMode===`horizontal`&&a.up>.65?e.wallMode=`vertical`:e.wallMode===`vertical`&&Math.abs(a.side)>.75&&(e.wallMode=`horizontal`,e.wallSide=Math.sign(a.side));let o=qu,s=e.stateTime>K.wall.wallRunDuration;if(e.wallMode===`vertical`)o.copy(i).multiplyScalar(a.side*5),o.y=Math.max(K.wall.wallRunUpSpeed,e.vel.y-10*t);else{a.side*e.wallSide<-.5&&(e.wallSide=-e.wallSide);let n=Math.abs(e.vel.dot(i)),r=Math.max(K.wall.wallRunSpeed,n-4*t);o.copy(i).multiplyScalar(e.wallSide*r),o.y=a.up*6+(s?-4:1.5)}let c=1-Math.exp(-8*t);e.vel.lerp(o,c);let l=e.vel.dot(r);return e.vel.addScaledVector(r,-l-.8),e.moveAndCollide(t),e.facing=e.wallMode===`vertical`?fu(-r.x,-r.z):fu(e.vel.x,e.vel.z),e.vel.y<0&&e.probeGround(!1,.3)?`Grounded`:$u(e,Qu(e,t))}}),nu({id:`WallCrawling`,group:`Wall`,enter(e){e.vel.multiplyScalar(.1)},step(e,t,n){if(n.jumpPressed)return xu(e,n);if(n.zipPressed&&yu(e,n))return`WebZip`;if(n.traversePressed||n.traverse&&e.stateTime>.2)return`WallRunning`;if(n.dropPressed)return e.vel.copy(e.wallNormal).multiplyScalar(3),`Airborne`;let r=e.wallNormal,i=Xu(r,Gu),a=Zu(e,n),o=qu.copy(i).multiplyScalar(a.side*K.wall.wallCrawlSpeed);o.y=a.up*K.wall.wallCrawlSpeed,e.vel.lerp(o,1-Math.exp(-14*t));let s=e.vel.dot(r);if(e.vel.addScaledVector(r,-s-.3),e.moveAndCollide(t),Math.hypot(a.up,a.side),e.facing=fu(-r.x,-r.z),a.up<-.3&&e.feetY-e.surfaceBelow()<.5)return e.pos.addScaledVector(r,.3),`Grounded`;let c=Qu(e,t);return c===`wrapped`?null:$u(e,c)}});var ed=new V;function td(e,t,n){let r=1-t,i=2*e.moveApex.x-.5*(e.moveFrom.x+e.moveTo.x),a=2*e.moveApex.y-.5*(e.moveFrom.y+e.moveTo.y),o=2*e.moveApex.z-.5*(e.moveFrom.z+e.moveTo.z);return n.set(r*r*e.moveFrom.x+2*r*t*i+t*t*e.moveTo.x,r*r*e.moveFrom.y+2*r*t*a+t*t*e.moveTo.y,r*r*e.moveFrom.z+2*r*t*o+t*t*e.moveTo.z)}function nd(e,t){let n=Math.min(1,e.stateTime/e.moveDur),r=ed.copy(e.pos);return td(e,n,e.pos),e.vel.subVectors(e.pos,r).multiplyScalar(1/t),Math.hypot(e.vel.x,e.vel.z)>.5&&(e.facing=fu(e.vel.x,e.vel.z)),n>=1}nu({id:`Vaulting`,group:`Parkour`,enter(e){e.moveDur=Math.max(.2,e.moveDur)},step(e,t){let n=Math.hypot(e.moveTo.x-e.moveFrom.x,e.moveTo.z-e.moveFrom.z)/e.moveDur;if(nd(e,t)){let t=Math.hypot(e.vel.x,e.vel.z)||1;return e.vel.x*=n/t,e.vel.z*=n/t,e.vel.y=0,e.probeGround(!0,.4)?`Grounded`:`Airborne`}return null}}),nu({id:`Mantling`,group:`Parkour`,enter(e){e.moveFrom.copy(e.pos),e.moveApex.set(e.pos.x*.7+e.moveTo.x*.3,e.moveTo.y+.35,e.pos.z*.7+e.moveTo.z*.3);let t=e.moveTo.y-e.pos.y;e.moveDur=Math.max(.2,Math.min(.42,.18+t*.08-Math.max(0,e.vel.y)*.01)),e.emit(`mantle`,t)},step(e,t){if(nd(e,t)){let t=Math.hypot(e.vel.x,e.vel.z),n=Math.min(t,6);return t>.1&&(e.vel.x*=n/t,e.vel.z*=n/t),e.vel.y=0,e.probeGround(!0,.5),`Grounded`}return null}});var rd=class{world;city;pos=new V;vel=new V;prevPos=new V;acc=new V;accSmooth=new V;facing=0;fsm;rope=new Dl;anchors;swingDbg=Ol();swingCtx=kl();swingPhase=0;swingArcEnd=90;swingOmega=0;swingTuck=0;swingJumpQuality=0;swingJumpPhase=0;chainPending=!1;airZips=0;launchPressT=-10;zipBurstSpeed=0;pointLaunchQuality=0;wallProbeT=0;prevAnchor=null;webCooldown=0;timeSinceRelease=10;lastWebFail=-10;onGround=!1;groundNormal=new V(0,1,0);timeSinceGround=0;groundY=0;wallNormal=new V;wallBox=-1;wallContact=!1;wallContactNormal=new V;ceilingContact=!1;preImpactVel=new V;zipTarget=new V;zipPoint=null;jumpHeldFromGround=!1;jumpCharge=0;diveTime=0;trickKind=0;landingImpact=0;wallMode=`vertical`;wallSide=1;jumpBufferT=0;moveFrom=new V;moveTo=new V;moveApex=new V;moveDur=.3;releaseQuality=0;losTimer=0;arcGroundTimer=0;arcGroundY=0;launchQueued=!1;zipWebPoint=new V;perchTarget=null;events=[];contacts=[];contactCount=0;simTime=0;distanceTravelled=0;hit=Sl();_c=new V;_d=new V;_v0=new V;stepStartVel=new V;perchScanT=0;constructor(e,t){this.world=e,this.city=t,this.anchors=new $l(e),this.fsm=new iu(this)}get state(){return this.fsm.current.id}get stateTime(){return this.fsm.time}get feetY(){return this.pos.y-su}get speed(){return this.vel.length()}spawn(e,t,n,r=0){this.pos.set(e,t+su,n),this.prevPos.copy(this.pos),this.vel.set(0,0,0),this.facing=r,this.rope.detach(),this.fsm.reset(`Airborne`)}emit(e,t=0){this.events.length>64&&this.events.shift(),this.events.push({type:e,a:t,pos:this.pos.clone()})}step(e,t){this.prevPos.copy(this.pos);let n=this._v0.copy(this.vel);if(this.stepStartVel.copy(this.vel),this.simTime+=e,this.webCooldown=Math.max(0,this.webCooldown-e),this.timeSinceRelease+=e,this.jumpBufferT=t.jumpPressed?K.ground.jumpBuffer:Math.max(0,this.jumpBufferT-e),this.perchScanT-=e,this.perchScanT<=0&&this.city){this.perchScanT=.05;let e=this.fsm.current.id;this.perchTarget=e===`Perching`||e===`WebZip`?this.perchTarget:this.findPerchTarget(t)}this.fsm.step(e,t);let r=this.fsm.current.id;(this.onGround||r===`Swinging`||r===`Grounded`||r===`WallRunning`||r===`WallCrawling`||r===`Perching`)&&(this.airZips=0),(!t.traverse||r===`Grounded`)&&(this.chainPending=!1),this.acc.subVectors(this.vel,n).multiplyScalar(1/e);let i=1-Math.exp(-10*e);if(this.accSmooth.lerp(this.acc,i),this.distanceTravelled+=this.pos.distanceTo(this.prevPos),Number.isFinite(this.pos.x+this.pos.y+this.pos.z)||this.spawn(0,60,0),this.pos.y<-5&&(this.pos.y=su,this.vel.y=0),this.city){let t=this.city.bounds,n=this.pos.x<t.x0-25?t.x0-25-this.pos.x:this.pos.x>t.x1+25?t.x1+25-this.pos.x:0,r=this.pos.z<t.z0-25?t.z0-25-this.pos.z:this.pos.z>t.z1+25?t.z1+25-this.pos.z:0;n!==0&&(this.pos.x+=n*Math.min(1,8*e),this.vel.x*n<0&&(this.vel.x*=-.2)),r!==0&&(this.pos.z+=r*Math.min(1,8*e),this.vel.z*r<0&&(this.vel.z*=-.2))}}moveAndCollide(e){let t=(this.vel.x-this.stepStartVel.x)*.5,n=(this.vel.y-this.stepStartVel.y)*.5,r=(this.vel.z-this.stepStartVel.z)*.5;this.onGround=!1,this.wallContact=!1,this.ceilingContact=!1,this.contactCount=0,this.preImpactVel.copy(this.vel);let i=this.vel.length()*e,a=Math.max(1,Math.min(12,Math.ceil(i/(au*.7)))),o=e/a,s=this._c;for(let e=0;e<a;e++){this.pos.x+=(this.vel.x-t)*o,this.pos.y+=(this.vel.y-n)*o,this.pos.z+=(this.vel.z-r)*o;for(let e of ou){s.set(this.pos.x,this.pos.y+e,this.pos.z);let t=this.contactCount;if(this.contactCount=this.world.resolveSphere(s,au,this.contacts,this.contactCount),this.contactCount!==t){this.pos.set(s.x,s.y-e,s.z);for(let n=t;n<this.contactCount;n++)this.handleContact(this.contacts[n],e)}}}}handleContact(e,t){let n=e.normal,r=this.vel.dot(n);if(n.y>.6&&t<0)this.onGround=!0,this.groundNormal.copy(n),this.groundY=this.feetY;else if(Math.abs(n.y)<.4){if(e.box>=0&&this.timeSinceGround<.05&&this.world.maxY[e.box]-this.feetY<K.ground.stepHeight&&this.world.maxY[e.box]-this.feetY>0){this.pos.y=this.world.maxY[e.box]+su+.01,this.pos.addScaledVector(n,.02);return}this.wallContact=!0,this.wallContactNormal.set(n.x,0,n.z).normalize(),this.wallBox=e.box}else n.y<-.6&&(this.ceilingContact=!0);r<0&&this.vel.addScaledVector(n,-r)}probeGround(e,t=.35){this._c.copy(this.pos);let n=this._d.set(0,-1,0);return this.world.raycast(this._c,n,.9+t,this.hit)&&this.hit.normal.y>.6?(this.groundY=this.hit.point.y,e&&(this.pos.y=this.hit.point.y+su,this.vel.y<0&&(this.vel.y=0)),this.groundNormal.copy(this.hit.normal),!0):!1}surfaceBelow(){return this._c.copy(this.pos),this.world.heightBelow(this._c,600)}probeWall(e,t=1.3,n=0){this._c.set(this.pos.x,this.pos.y+n,this.pos.z);let r=this._d.copy(e).multiplyScalar(-1);return!!(this.world.raycast(this._c,r,t,this.hit,X.NoWeb,!1)&&Math.abs(this.hit.normal.y)<.3)}findLedge(e,t,n,r){let i=sl(e);if(i<.001)return!1;let a=e.x/i,o=e.z/i,s=this.feetY,c=this._c.set(this.pos.x+a*n,s+t+.5,this.pos.z+o*n),l=this._d.set(0,-1,0);if(!this.world.raycast(c,l,t+.5,this.hit,0,!1)||this.hit.normal.y<.7)return!1;let u=this.hit.point.y;return!(u<s+.25||u>s+t||(r.set(this.hit.point.x,u+su+.02,this.hit.point.z),this.world.overlapsSphere(this._c.set(r.x,r.y+.2,r.z),.4*.9)))}limitSpeed(e,t,n=!1){let r=t?K.physics.maxDiveSpeed:K.physics.maxNormalSpeed,i=this.vel.length();if(i>r){let t=i-r,a=n?K.physics.swingSpeedSoftness*(.4+t*.12):K.physics.speedLimitSoftness*(1+t*.5),o=r+t*Math.exp(-a*e);this.vel.multiplyScalar(o/i)}}tryAttachWeb(e,t){if(this.webCooldown>0)return!1;this.webCooldown=K.web.fireCooldown;let n=this.anchors.select({pos:this.pos,vel:this.vel,input:t,camForward:e.camForward,prevAnchor:this.prevAnchor,stick:e.moveMag>.1});return n?(this.rope.attach(n.point,this.pos,n.box),this.prevAnchor=this.prevAnchor??new V,this.prevAnchor.copy(n.point),this.emit(`webFire`,this.pos.distanceTo(n.point)),!0):(this.simTime-this.lastWebFail>.8&&this.emit(`webFail`),this.lastWebFail=this.simTime,!1)}findPerchTarget(e){if(!this.city)return null;let t=e.camForward,n=null,r=-1/0,i=K.zip.pointMaxDistance,a=Math.cos(K.zip.pointConeDeg*Math.PI/180),o=this._c.set(this.pos.x,this.pos.y+.8,this.pos.z);for(let e of this.city.perches){let s=e.x-o.x,c=e.y-o.y,l=e.z-o.z,u=s*s+c*c+l*l;if(u>i*i||u<16)continue;let d=Math.sqrt(u),f=(s*t.x+c*t.y+l*t.z)/d;if(f<a||e.y<this.pos.y-25)continue;let p=f*3-d/i+(e.kind===`lamp`?-.4:0);if(p>r){let t=this._d.set(s/d,c/d,l/d);if(this.world.raycast(o,t,d-1,this.hit,X.NoWeb,!1))continue;r=p,n=e}}return n}get hSpeed(){return sl(this.vel)}};function id(e){let t=Math.floor(e),n=e-t,r=e=>{let t=Math.sin(e*127.1)*43758.5453;return(t-Math.floor(t))*2-1},i=n*n*(3-2*n);return r(t)*(1-i)+r(t+1)*i}var ad=class{x=0;v=0;step(e,t,n,r){let i=Math.max(1,Math.ceil(r/(1/240))),a=r/i;for(let r=0;r<i;r++)this.v+=(t*t*(e-this.x)-2*n*t*this.v)*a,this.x+=this.v*a;return this.x}reset(e=0){this.x=e,this.v=0}},od=new Set([`Airborne`,`Trick`,`PointLaunch`,`WebZip`,`Swinging`]),sd=class{camera;yaw=0;pitch=-.15;viewYaw=0;viewYawV=0;autoPitch=0;renderPitch=-.15;focus=new V;focusV=new V;lastVel=new V;travel=new V(0,0,-1);dist=5;fov=62;roll=0;lead=0;frameY=0;kick=new ad;drag=new ad;dip=new ad;collDist=50;trauma=0;t=0;sinceLook=10;lastKick=-10;groundY=0;probeT=0;initialized=!1;forward=new V;debug={fov:62,dist:5,roll:0,pitch:0,collided:!1,kick:0,drag:0};hit=Sl();contacts=[];_a=new V;_b=new V;_c=new V;_d=new V;_r=new V;_u=new V;_tgt=new V;constructor(e){this.camera=new ti(62,e,.1,3e3)}addTrauma(e){this.trauma=Math.min(1,this.trauma+e)}landingDip(e){this.dip.v-=Math.min(6,e*.18)}onWebAttach(e){if(this.t-this.lastKick<.25)return;this.lastKick=this.t;let t=K.camera,n=Y(t.speedMin,t.fovSpeedRef,e);this.kick.v+=t.attachFovKick*(.45+.55*n)*16/.522,this.drag.v+=t.attachDragBack*(.35+.65*n)*6.5*Math.E}look(e,t){(e!==0||t!==0)&&(this.sinceLook=0),this.yaw-=e,this.viewYaw-=e,this.pitch=q(this.pitch-t,-1.35,1.1)}snapTo(e,t){this.yaw=this.viewYaw=t,this.viewYawV=0,this.focus.copy(e),this.focus.y+=K.camera.height,this.focusV.set(0,0,0),this.travel.set(-Math.sin(t),0,-Math.cos(t)),this.kick.reset(),this.drag.reset(),this.dip.reset(),this.autoPitch=0,this.frameY=0,this.lead=0,this.collDist=50,this.initialized=!0}update(e,t,n){this.t+=e,this.sinceLook+=e;let r=K.camera,i=t.vel.length(),a=sl(t.vel),o=Y(r.speedMin,r.fovSpeedRef,i),s=od.has(t.state),c=t.state===`WallRunning`&&t.wallMode===`vertical`;this.probeT-=e,this.probeT<=0&&(this.probeT=.1,this.groundY=n.heightBelow(this._a.copy(t.pos),600));let l=t.pos.y-.9-this.groundY;if(a>1){let n=il(3.5,e);this.travel.x+=(t.vel.x/a-this.travel.x)*n,this.travel.z+=(t.vel.z/a-this.travel.z)*n,this.travel.y=0,this.travel.lengthSq()>1e-6&&this.travel.normalize()}let u=Y(r.autoFollowDelay,r.autoFollowDelay+1,this.sinceLook),d=s||t.state===`Landing`||t.state===`WallRunning`&&t.wallMode===`horizontal`||t.state===`Grounded`&&a>4;if(d&&u>0&&a>3){let t=ol(Math.atan2(-this.travel.x,-this.travel.z)-this.yaw),n=Y(2,2.9,Math.abs(t)),i=r.autoRecenter*u*Y(3,18,a)*(1-.7*n);this.yaw+=t*il(i,e)}if(c&&this.sinceLook>.5){let n=Math.atan2(t.wallNormal.x,t.wallNormal.z);this.yaw+=ol(n-this.yaw)*il(3,e),this.pitch+=(.5-this.pitch)*il(2.5,e)}else(d||i>3)&&u>0&&(this.pitch+=(r.pitchRest-this.pitch)*il(1.3*u,e));{let t=Math.max(1,Math.ceil(e/(1/240))),n=e/t,i=r.yawFollow;for(let e=0;e<t;e++){let e=ol(this.yaw-this.viewYaw);this.viewYawV+=(i*i*e-2*i*this.viewYawV)*n,this.viewYaw+=this.viewYawV*n}this.viewYaw=this.yaw-ol(this.yaw-this.viewYaw)}let f=Math.atan2(t.vel.y,Math.max(a,2)),p=0;if(t.state===`Swinging`)p=q(f*r.arcPitch,-.2,.15)*Y(6,18,i);else if(s){let e=Y(-6,-30,t.vel.y),n=Y(8,40,l),i=Math.max(+!!t.diving,e*.7)*n;p=q(f*r.arcPitch*.5,-.1,.1)*(1-i)-r.diveTilt*i}this.autoPitch+=(p-this.autoPitch)*il(2.2,e);let m=Y(.15,.9,this.sinceLook);this.renderPitch=q(this.pitch+this.autoPitch*m,-1.4,1.15);let h=this._tgt.copy(t.pos);if(h.y+=r.height,a>.5){let e=Math.min(r.lookAhead*a*.1,1.6);h.x+=t.vel.x/a*e,h.z+=t.vel.z/a*e}let g=q(-t.vel.y*r.arcFrame,-.75,.8)*+!c;this.frameY+=(g-this.frameY)*il(3,e),h.y+=this.frameY,this.initialized||=(this.focus.copy(h),this.focusV.copy(t.vel),!0);{let n=Math.max(1,Math.ceil(e/(1/240))),i=e/n,a=r.followFreq,o=r.followFreqV,s=r.followDamping,c=this.focus,l=this.focusV,u=t.vel;Math.hypot(u.x-this.lastVel.x,u.y-this.lastVel.y,u.z-this.lastVel.z)>10&&l.copy(u),this.lastVel.copy(u);for(let e=0;e<n;e++)l.x+=(a*a*(h.x-c.x)+2*s*a*(u.x-l.x))*i,l.z+=(a*a*(h.z-c.z)+2*s*a*(u.z-l.z))*i,l.y+=(o*o*(h.y-c.y)+2*s*o*(u.y-l.y))*i,c.addScaledVector(l,i);let d=this._a.subVectors(c,h),f=Math.hypot(d.x,d.z);if(f>r.maxLag){let e=r.maxLag/f;c.x=h.x+d.x*e,c.z=h.z+d.z*e;let t=d.x/f,n=d.z/f,i=(l.x-u.x)*t+(l.z-u.z)*n;i>0&&(l.x-=i*t,l.z-=i*n)}let p=r.maxLag*.6;Math.abs(d.y)>p&&(c.y=h.y+Math.sign(d.y)*p,(l.y-u.y)*d.y>0&&(l.y=u.y))}{let e=this._a.set(t.pos.x,t.pos.y+r.height*.6,t.pos.z),i=this._d.subVectors(this.focus,e),a=i.length();if(a>.05&&(i.multiplyScalar(1/a),n.raycast(e,i,a+.35,this.hit,X.NoWeb))){let t=Math.max(0,this.hit.t-.35);if(t<a){this.focus.copy(e).addScaledVector(i,t);let n=this.focusV.dot(i);n>0&&this.focusV.addScaledVector(i,-n)}}}this.kick.step(0,16,.55,e),this.drag.step(0,6.5,1,e),this.dip.step(0,7.75,.71,e);let _=J(r.distance,r.distanceAtSpeed,o);t.state===`Swinging`&&(_+=.35),c&&(_+=1),(t.state===`Perching`||t.state===`WallCrawling`)&&(_-=.5),this.dist+=(_-this.dist)*il(2.2,e);let v=J(r.fov,r.fovAtSpeed,o)+(t.diving?3*Y(25,70,i):0);this.fov+=(v-this.fov)*il(2.5,e);let y=q(this.fov+this.kick.x,40,100),b=(Math.tan(this.fov*Math.PI/360)/Math.tan(y*Math.PI/360))**.5,x=this.dist*b+this.drag.x,S=Math.cos(this.viewYaw),C=Math.sin(this.viewYaw),w=Math.cos(this.renderPitch),T=Math.sin(this.renderPitch),E=this.forward.set(-C*w,T,-S*w),D=this._r.set(S,0,-C),O=this._u.crossVectors(D,E).normalize(),k=q(-q(t.acc.x*D.x+t.acc.z*D.z,-45,45)*r.rollAmount*.0045,-r.rollMax,r.rollMax)*Y(6,22,i)*+!c;this.roll+=(k-this.roll)*il(3.2,e);let A=t.vel.x*D.x+t.vel.z*D.z;this.lead+=(q(A*.04,-1.1,1.1)-this.lead)*il(2.5,e);let j=this.focus,M=this._b.copy(j).addScaledVector(E,-x).addScaledVector(D,r.shoulder);M.addScaledVector(O,this.dip.x-this.drag.x*.3),this.debug.collided=!1;let N=this._c.copy(M);n.resolveSphere(N,.35,this.contacts,0,X.NoWeb)>0&&(this.debug.collided=!0);let ee=this._d.subVectors(N,j),P=Math.max(.01,ee.length());ee.multiplyScalar(1/P);let F=P,te=P;for(let e=0;e<5;e++){let t=e===1?1:e===2?-1:0,r=e===3?1:e===4?-1:0;for(let i=0;i<2;i++){if(i===1&&e===0)continue;let a=i===0?.22:.9,o=this._a.copy(N).addScaledVector(D,t*a).addScaledVector(O,r*a).sub(j),s=o.length();if(o.multiplyScalar(1/s),n.raycast(j,o,s+.3,this.hit,X.NoWeb)){let e=(this.hit.t-.3)*(P/s);i===0?F=Math.min(F,e):Math.abs(this.hit.normal.dot(ee))>.5&&(te=Math.min(te,e+.2))}}}F=Math.max(.6,F),te=Math.max(.6,te),F<P-.05&&(this.debug.collided=!0);let ne=Math.min(te,P);this.collDist+=(ne-this.collDist)*il(ne<this.collDist?9:2.2,e),this.collDist=Math.min(this.collDist,F,P+.5);let re=Math.min(P,this.collDist,F),ie=this.camera;ie.position.copy(j).addScaledVector(ee,re),this.trauma=Math.max(0,this.trauma-e*1.8);let ae=Y(55,95,i)*.06,oe=(this.trauma*this.trauma+ae*ae)*r.shake,se=this.t*21;ie.position.addScaledVector(O,id(se+31.7)*oe*.12);let ce=this._a.copy(j).addScaledVector(E,6).addScaledVector(D,r.shoulder*.4+this.lead);ce.addScaledVector(D,id(se)*oe*.35).addScaledVector(O,id(se+13.1)*oe*.3),ie.lookAt(ce),ie.rotateZ(this.roll+id(se+77.3)*oe*.04),Math.abs(ie.fov-y)>.01&&(ie.fov=y,ie.updateProjectionMatrix());let le=this.debug;le.fov=y,le.dist=re,le.roll=this.roll,le.pitch=this.renderPitch,le.kick=this.kick.x,le.drag=this.drag.x}},cd=new Float32Array(48),ld={value:cd},ud=`
#ifndef STRAND_ATMO
#define STRAND_ATMO
uniform vec4 uAtmo[ 12 ];

float strandHG( float mu, float g ) {
	float g2 = g * g;
	return ( 1.0 - g2 ) / ( 12.5663706 * pow( max( 1.0 + g2 - 2.0 * g * mu, 1e-4 ), 1.5 ) );
}

// Sky radiance without the sun disc and tight glow. d normalised, above the horizon.
vec3 strandSkyBase( vec3 d ) {
	vec3 s = uAtmo[ 0 ].xyz;
	float h = max( d.y, 0.0 );
	float t = pow( 1.0 - h, uAtmo[ 1 ].w );
	vec2 dh = d.xz * inversesqrt( max( dot( d.xz, d.xz ), 1e-8 ) );
	vec2 sh = s.xz * inversesqrt( max( dot( s.xz, s.xz ), 1e-8 ) );
	float az = dot( dh, sh ) * 0.5 + 0.5;
	vec3 hor = mix( uAtmo[ 2 ].rgb, uAtmo[ 3 ].rgb, pow( az, uAtmo[ 2 ].w ) );
	vec3 col = mix( uAtmo[ 1 ].rgb, hor, t );
	float mu = dot( d, s );
	col += uAtmo[ 5 ].rgb * strandHG( mu, uAtmo[ 5 ].w ) * ( 0.3 + 0.7 * t );
	// pink anti-solar band just above the horizon when the sun is low
	col += uAtmo[ 6 ].rgb * ( 1.0 - az ) * ( 1.0 - az ) * smoothstep( 0.0, 0.08, h ) * ( 1.0 - smoothstep( 0.1, 0.42, h ) );
	return col;
}

// In-scattered colour for a view direction: the sky near the horizon in that azimuth.
vec3 strandFogColor( vec3 dir ) {
	vec3 d = dir * inversesqrt( max( dot( dir, dir ), 1e-12 ) );
	// looking straight down there is no horizon azimuth: any direction gives the same answer, but a
	// zero vector would normalise to NaN and bloom would smear it across the frame
	vec3 fd = vec3( d.x, clamp( d.y, 0.0, 1.0 ) * uAtmo[ 11 ].y, d.z );
	float fl = dot( fd, fd );
	fd = fl > 1e-8 ? fd * inversesqrt( fl ) : vec3( 1.0, 0.0, 0.0 );
	vec3 c = strandSkyBase( fd );
	c += uAtmo[ 4 ].rgb * strandHG( dot( fd, uAtmo[ 0 ].xyz ), uAtmo[ 4 ].w ) * uAtmo[ 3 ].w;
	return c;
}

// Opacity of the atmosphere between the camera (height camY) and a point at camera-relative rel.
float strandFogAmount( vec3 rel, float camY ) {
	vec4 f = uAtmo[ 10 ];
	float L = length( rel );
	float yc = camY - f.w;
	float yp = yc + rel.y;
	float ec = exp( clamp( - f.z * yc, - 60.0, 60.0 ) );
	float ep = exp( clamp( - f.z * yp, - 60.0, 60.0 ) );
	float bdy = f.z * rel.y;
	float hterm = abs( bdy ) > 1e-3 ? ( ec - ep ) / bdy : 0.5 * ( ec + ep );
	float tau = L * ( f.x + f.y * hterm );
	return min( 1.0 - exp( - tau ), uAtmo[ 11 ].x );
}
#endif
`,dd=`
#ifdef USE_FOG
	varying float vFogDepth;
	varying vec3 vFogRel;
#endif
`,fd=`
#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
	vFogRel = mvPosition.xyz * mat3( viewMatrix );
#endif
`,pd=`
#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	varying vec3 vFogRel;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
	${ud}
#endif
`,md=`
#ifdef USE_FOG
	float fogFactor = strandFogAmount( vFogRel, cameraPosition.y );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, strandFogColor( vFogRel ), fogFactor );
	if ( any( isnan( gl_FragColor.rgb ) ) || any( isinf( gl_FragColor.rgb ) ) ) gl_FragColor.rgb = vec3( 0.0 );
#endif
`,hd=!1;function gd(){if(hd)return;hd=!0;for(let e of Object.values(Za))e.uniforms&&`fogColor`in e.uniforms&&(e.uniforms.uAtmo=ld);G.fog.uAtmo=ld,W.fog_pars_vertex=dd,W.fog_vertex=fd,W.fog_pars_fragment=pd,W.fog_fragment=md;let e=`gl_FragColor = vec4( outgoingLight, diffuseColor.a );`;W.opaque_fragment.includes(e)?W.opaque_fragment=W.opaque_fragment.replace(e,`if ( any( isnan( outgoingLight ) ) ) outgoingLight = vec3( 0.0 );
outgoingLight = clamp( outgoingLight, 0.0, 16384.0 );
`+e):console.warn(`[strand] opaque_fragment changed shape; HDR clamp not installed`)}function _d(e,t,n,r){let i=cd,a=r.sky,o=(e,t,n,r,a)=>{i[e*4]=t,i[e*4+1]=n,i[e*4+2]=r,i[e*4+3]=a};o(0,t.x,t.y,t.z,e.sunDisc),o(1,e.zenith[0]*a,e.zenith[1]*a,e.zenith[2]*a,e.horizonExp),o(2,e.horizon[0]*a,e.horizon[1]*a,e.horizon[2]*a,e.sunSpread),o(3,e.horizonSun[0]*a,e.horizonSun[1]*a,e.horizonSun[2]*a,e.fogSunScatter),o(4,e.glow[0]*a,e.glow[1]*a,e.glow[2]*a,e.glowG),o(5,e.haze[0]*a,e.haze[1]*a,e.haze[2]*a,e.hazeG),o(6,e.antiSun[0]*a,e.antiSun[1]*a,e.antiSun[2]*a,e.stars*r.stars),o(7,e.ground[0],e.ground[1],e.ground[2],e.moon),o(8,n.x,n.y,n.z,2.6),o(9,e.sunColor[0],e.sunColor[1],e.sunColor[2],0),o(10,e.fogExtinction*r.fog,e.fogHeightDensity*r.heightFog,e.fogHeightFalloff*r.heightFalloff,0),o(11,e.fogMaxOpacity,e.fogElevation,0,0)}var vd=class{mesh;material;constructor(e){this.material=new Xr({name:`StrandSky`,uniforms:{uAtmo:ld,uEnvMode:{value:0},uTime:e},vertexShader:`
        varying vec3 vDir;
        void main() {
          vec4 wp = modelMatrix * vec4( position, 1.0 );
          vDir = wp.xyz - cameraPosition;
          gl_Position = projectionMatrix * viewMatrix * wp;
          gl_Position.z = gl_Position.w;
        }`,fragmentShader:`
        uniform float uEnvMode;
        uniform float uTime;
        varying vec3 vDir;
        ${ud}
        float h13( vec3 p ) {
          uvec3 q = uvec3( ivec3( p ) + 32768 ) * uvec3( 1597334673u, 3812015801u, 2798796415u );
          uint n = ( q.x ^ q.y ^ q.z ) * 1597334673u;
          n ^= n >> 16u;
          return float( n ) * ( 1.0 / 4294967295.0 );
        }
        float h12( vec2 p ) { return h13( vec3( p, 17.0 ) ); }
        float vnoise( vec2 p ) {
          vec2 i = floor( p ), f = fract( p );
          vec2 u = f * f * ( 3.0 - 2.0 * f );
          return mix( mix( h12( i ), h12( i + vec2( 1, 0 ) ), u.x ), mix( h12( i + vec2( 0, 1 ) ), h12( i + vec2( 1, 1 ) ), u.x ), u.y );
        }
        vec3 stars( vec3 d ) {
          vec3 p = d * 240.0;
          vec3 id = floor( p );
          float h = h13( id );
          if ( h < 0.955 ) return vec3( 0.0 );
          vec3 o = vec3( h13( id + 11.0 ), h13( id + 23.0 ), h13( id + 37.0 ) ) - 0.5;
          vec3 f = fract( p ) - 0.5 - o * 0.6;
          float px = max( length( fwidth( p ) ), 1e-4 );
          float core = exp( - dot( f, f ) / ( px * px * 0.55 ) );
          float b = pow( h13( id + 5.0 ), 9.0 ) * 5.0 + 0.12;
          float tw = 0.72 + 0.28 * sin( uTime * ( 1.5 + 3.0 * h13( id + 3.0 ) ) + h * 91.0 );
          vec3 tint = mix( vec3( 0.72, 0.82, 1.0 ), vec3( 1.0, 0.86, 0.72 ), h13( id + 9.0 ) );
          return tint * core * b * tw;
        }
        void main() {
          vec3 d = normalize( vDir );
          vec3 s = uAtmo[ 0 ].xyz;
          float mu = dot( d, s );
          vec3 col;
          if ( d.y >= 0.0 ) {
            col = strandSkyBase( d ) + uAtmo[ 4 ].rgb * strandHG( mu, uAtmo[ 4 ].w );
          } else {
            vec3 hd = vec3( d.x, 0.0, d.z );
            hd = dot( hd, hd ) > 1e-8 ? normalize( hd ) : vec3( 1.0, 0.0, 0.0 );
            vec3 atH = strandSkyBase( hd ) + uAtmo[ 4 ].rgb * strandHG( dot( hd, s ), uAtmo[ 4 ].w );
            col = mix( atH, strandFogColor( hd ), smoothstep( 0.0, 0.04, - d.y ) );
            if ( uEnvMode > 0.5 ) col = mix( col, uAtmo[ 7 ].rgb, smoothstep( 0.0, 0.22, - d.y ) );
          }
          if ( uEnvMode < 0.5 ) {
            // sun disc: ~2x the real angular size, anti-aliased, limb-darkened
            float r = 0.0095;
            float x2 = 2.0 * ( 1.0 - mu ) / ( r * r );
            float fw = fwidth( x2 ) + 1e-4;
            float disc = 1.0 - smoothstep( 1.0 - fw, 1.0 + fw, x2 );
            float limb = 1.0 - 0.5 * ( 1.0 - sqrt( max( 1.0 - x2, 0.0 ) ) );
            col += uAtmo[ 9 ].rgb * uAtmo[ 0 ].w * disc * limb * smoothstep( -0.02, 0.01, d.y );
            // moon
            float moonDisc = 0.0;
            if ( uAtmo[ 7 ].w > 0.001 ) {
              vec3 m = uAtmo[ 8 ].xyz;
              vec3 tu = normalize( cross( m, vec3( 0.0, 1.0, 0.0 ) ) );
              vec3 tv = cross( tu, m );
              float mr = 0.021;
              vec2 q = vec2( dot( d, tu ), dot( d, tv ) ) / mr;
              float rq = length( q );
              float front = step( 0.0, dot( d, m ) );
              float fq = fwidth( rq ) + 1e-4;
              moonDisc = ( 1.0 - smoothstep( 1.0 - fq, 1.0 + fq, rq ) ) * front * uAtmo[ 7 ].w;
              float maria = vnoise( q * 2.3 + 4.0 ) * 0.6 + vnoise( q * 5.1 + 9.0 ) * 0.4;
              float alb = 0.62 + 0.38 * ( 1.0 - smoothstep( 0.38, 0.62, maria ) );
              float limbM = 0.7 + 0.3 * sqrt( max( 1.0 - rq * rq, 0.0 ) );
              col = mix( col, vec3( 1.0, 0.97, 0.9 ) * uAtmo[ 8 ].w * alb * limbM, moonDisc );
              col += vec3( 0.55, 0.66, 1.0 ) * uAtmo[ 7 ].w * ( 0.012 * strandHG( dot( d, m ), 0.93 ) + 0.004 * strandHG( dot( d, m ), 0.6 ) ) * front;
            }
            if ( uAtmo[ 6 ].w > 0.001 && d.y > 0.0 ) {
              col += stars( d ) * uAtmo[ 6 ].w * 0.22 * smoothstep( 0.02, 0.3, d.y ) * ( 1.0 - moonDisc );
            }
          }
          gl_FragColor = vec4( clamp( col, 0.0, 16384.0 ), 1.0 );
        }`,side:1,depthWrite:!1,fog:!1,toneMapped:!1}),this.mesh=new zr(new Hr(1,1,1),this.material),this.mesh.name=`sky`,this.mesh.scale.setScalar(2e3),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1e6,this.mesh.onBeforeRender=(e,t,n)=>{this.mesh.position.copy(n.position),this.mesh.updateMatrixWorld()}}set envMode(e){this.material.uniforms.uEnvMode.value=+!!e}},yd=`
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	directionalLight = directionalLights[ 0 ];
	getDirectionalLightInfo( directionalLight, directLight );
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	if ( directLight.visible && receiveShadow ) {
		directionalLightShadow = directionalLightShadows[ 0 ];
		vec2 strandEdge = abs( vDirectionalShadowCoord[ 0 ].xy / vDirectionalShadowCoord[ 0 ].w - 0.5 ) * 2.0;
		float strandFar = smoothstep( 0.8, 0.98, max( strandEdge.x, strandEdge.y ) );
		float strandSh = 1.0;
		if ( strandFar < 1.0 ) strandSh = getShadow( directionalShadowMap[ 0 ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ 0 ] );
		#if NUM_DIR_LIGHT_SHADOWS > 1
		if ( strandFar > 0.0 && dot( directionalLights[ 1 ].color, vec3( 1.0 ) ) == 0.0 ) {
			directionalLightShadow = directionalLightShadows[ 1 ];
			float strandShF = getShadow( directionalShadowMap[ 1 ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ 1 ] );
			strandSh = mix( strandSh, strandShF, strandFar );
		}
		#endif
		directLight.color *= strandSh;
	}
	#endif
	RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	#if NUM_DIR_LIGHTS > 1
	#pragma unroll_loop_start
	for ( int i = 1; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		if ( dot( directionalLight.color, vec3( 1.0 ) ) > 0.0 ) {
			getDirectionalLightInfo( directionalLight, directLight );
			#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
			directionalLightShadow = directionalLightShadows[ i ];
			directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
			#endif
			RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
		}
	}
	#pragma unroll_loop_end
	#endif

#endif
`,bd=null;function xd(){if(bd!==null)return bd;let e=W.lights_fragment_begin,t=e.indexOf(`#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )`),n=t<0?-1:e.indexOf(`#pragma unroll_loop_end`,t),r=n<0?-1:e.indexOf(`#endif`,n);return bd=r>=0,bd?W.lights_fragment_begin=e.slice(0,t)+yd+e.slice(r+6):console.warn(`[strand] lights_fragment_begin changed shape; far shadow cascade disabled`),bd}var Sd=new V(0,1,0),Cd=class{key=new Ma(16777215,1);far=new Ma(16777215,0);dir=new V(0,1,0);nearExtent=90;nearSize=2048;farSize=2048;farEnabled=!0;farDirty=!0;staticRoot=null;bounds=new Ut;staticCam=new ti(10,1,.1,1);bakeRT=new Bt(1,1);_a=new V;_b=new V;_c=new V;cascade;constructor(e){this.cascade=xd();let t=this.key;t.castShadow=!0,t.shadow.mapSize.set(this.nearSize,this.nearSize),t.shadow.bias=-3e-4,t.shadow.normalBias=.45;let n=t.shadow.camera;n.left=-this.nearExtent,n.right=this.nearExtent,n.top=this.nearExtent,n.bottom=-this.nearExtent,n.near=1,n.far=2600;let r=this.far;r.castShadow=this.cascade,r.shadow.autoUpdate=!1,r.shadow.mapSize.set(this.farSize,this.farSize),r.shadow.bias=-6e-4,r.shadow.normalBias=1.1,r.layers.enable(7),this.staticCam.layers.set(7),this.staticCam.position.set(0,-1e5,0),this.staticCam.lookAt(0,-2e5,0),this.staticCam.updateMatrixWorld(),e.add(t,t.target,r,r.target)}setStaticCasters(e){this.staticRoot=e,e.traverse(e=>e.layers.enable(7)),this.bounds.setFromObject(e),this.farDirty=!0}setQuality(e,t,n,r){this.key.castShadow=n;let i=n&&r&&this.cascade;(i!==this.farEnabled||i!==this.far.castShadow)&&(this.farDirty=!0),this.farEnabled=i,this.far.castShadow=i,e!==this.nearSize&&(this.nearSize=e,this.key.shadow.mapSize.set(e,e),this.key.shadow.map?.dispose(),this.key.shadow.map=null),t!==this.farSize&&(this.farSize=t,this.far.shadow.mapSize.set(t,t),this.far.shadow.map?.dispose(),this.far.shadow.map=null,this.farDirty=!0)}setDirection(e){this.dir.distanceToSquared(e)>1e-8&&(this.farDirty=!0),this.dir.copy(e)}follow(e){let t=this.dir,n=this._a.crossVectors(Sd,t);n.lengthSq()<1e-6&&n.set(1,0,0),n.normalize();let r=this._b.crossVectors(t,n),i=2*this.nearExtent/this.nearSize,a=Math.round(e.dot(n)/i)*i,o=Math.round(e.dot(r)/i)*i,s=e.dot(t),c=this._c.set(0,0,0).addScaledVector(n,a).addScaledVector(r,o).addScaledVector(t,s);this.key.target.position.copy(c),this.key.position.copy(c).addScaledVector(t,1100),this.key.target.updateMatrixWorld(),this.key.updateMatrixWorld()}bake(e,t){if(!this.farDirty||!this.staticRoot||(this.farDirty=!1,!this.far.castShadow||!e.shadowMap.enabled))return;this.fitFar(),this.far.shadow.needsUpdate=!0;let n=e.getRenderTarget(),r=e.toneMapping;e.toneMapping=0,e.setRenderTarget(this.bakeRT),e.render(t,this.staticCam),e.setRenderTarget(n),e.toneMapping=r}fitFar(){let e=this.bounds,t=this.dir,n=e.getCenter(this._a),r=this.far;r.target.position.copy(n),r.position.copy(n).addScaledVector(t,2500),r.target.updateMatrixWorld(),r.updateMatrixWorld();let i=r.shadow.camera;i.position.copy(r.position),i.lookAt(n),i.updateMatrixWorld();let a=1/0,o=-1/0,s=1/0,c=-1/0,l=1/0,u=-1/0,d=this._b;for(let t=0;t<8;t++)d.set(t&1?e.max.x+160:e.min.x-160,t&2?e.max.y:0,t&4?e.max.z+160:e.min.z-160).applyMatrix4(i.matrixWorldInverse),a=Math.min(a,d.x),o=Math.max(o,d.x),s=Math.min(s,d.y),c=Math.max(c,d.y),l=Math.min(l,d.z),u=Math.max(u,d.z);i.left=a,i.right=o,i.bottom=s,i.top=c,i.near=Math.max(1,-u-20),i.far=-l+20,i.updateProjectionMatrix()}get farTexel(){let e=this.far.shadow.camera;return Math.max(e.right-e.left,e.top-e.bottom)/this.farSize}};function Z(e,t=1){let n=parseInt(e.replace(`#`,``),16),r=e=>{let n=e/255;return(n<=.04045?n/12.92:((n+.055)/1.055)**2.4)*t};return[r(n>>16&255),r(n>>8&255),r(n&255)]}var wd={zenith:Z(`#0a1636`,.055),horizon:Z(`#26406e`,.075),horizonSun:Z(`#2e4472`,.08),horizonExp:2.6,sunSpread:2,glow:[0,0,0],glowG:.7,haze:Z(`#3a5a90`,.05),hazeG:.2,antiSun:[0,0,0],ground:Z(`#2a2a30`,.03),sunDisc:0,stars:1,moon:1,sunColor:Z(`#ffd9b0`),sunIntensity:0,moonColor:Z(`#9db8ff`),moonIntensity:.55,hemiSky:Z(`#3a5898`),hemiGround:Z(`#3c3440`),hemiIntensity:.12,envIntensity:1.6,fogExtinction:9e-4,fogHeightDensity:.0022,fogHeightFalloff:.03,fogMaxOpacity:.985,fogSunScatter:0,fogElevation:.4,exposure:1.6,bloomStrength:.55,bloomThreshold:2.2,contrast:1.12,saturation:1.08,vibrance:.12,lift:[-.004,0,.018],gamma:[.99,1,1.03],gain:[1,1,1.02],splitShadows:.55,splitHighlights:.35,splitBalance:-.1,vignette:.42,godRays:0,aoStrength:.7},Td={...wd,zenith:Z(`#132a6a`,.11),horizon:Z(`#5a5c9c`,.14),horizonSun:Z(`#f07a44`,.4),horizonExp:3.2,sunSpread:3,glow:Z(`#ff8a4a`,.07),glowG:.72,haze:Z(`#d0708a`,.1),hazeG:.35,antiSun:Z(`#8a6aa8`,.05),ground:Z(`#34303a`,.04),stars:.35,moon:1,moonIntensity:.4,hemiSky:Z(`#5a6cb8`),hemiGround:Z(`#4a3a40`),hemiIntensity:.1,envIntensity:1.4,fogExtinction:.0011,fogHeightDensity:.0024,fogHeightFalloff:.028,fogSunScatter:.6,exposure:1.4,bloomStrength:.55,bloomThreshold:2,contrast:1.1,saturation:1.1,vibrance:.18,lift:[0,0,.014],gamma:[1,1,1.02],gain:[1.02,1,1],splitShadows:.5,splitHighlights:.45,splitBalance:-.05},Ed={...Td,zenith:Z(`#2a4c9a`,.22),horizon:Z(`#8e8cb8`,.3),horizonSun:Z(`#ff9a5a`,1.25),horizonExp:3.4,sunSpread:2.2,glow:Z(`#ffa060`,.45),glowG:.8,haze:Z(`#ff9868`,.55),hazeG:.5,antiSun:Z(`#d890b0`,.12),ground:Z(`#5a4438`,.08),sunDisc:22,stars:0,moon:.6,sunColor:Z(`#ff8a4a`),sunIntensity:1.5,moonIntensity:0,hemiSky:Z(`#7c8ad0`),hemiGround:Z(`#6a4a3a`),hemiIntensity:.1,envIntensity:1.1,fogExtinction:.0011,fogHeightDensity:.0022,fogHeightFalloff:.026,fogSunScatter:.85,exposure:1.3,bloomStrength:.75,bloomThreshold:1.2,contrast:1.1,saturation:1.08,vibrance:.15,lift:[.004,0,.01],gamma:[1,1,1],gain:[1.03,1,.97],splitShadows:.45,splitHighlights:.5,splitBalance:0,vignette:.38,godRays:.9,aoStrength:.8},Dd={...Ed,zenith:Z(`#2d5cb4`,.34),horizon:Z(`#a2b2d4`,.46),horizonSun:Z(`#ffc890`,1.2),horizonExp:3.6,sunSpread:2.2,glow:Z(`#ffd6a0`,.4),glowG:.84,haze:Z(`#ffc49a`,.34),hazeG:.55,antiSun:Z(`#c8a0b8`,.05),ground:Z(`#6a5646`,.16),sunDisc:40,moon:0,sunColor:Z(`#ffb877`),sunIntensity:2.9,hemiSky:Z(`#9cb4e8`),hemiGround:Z(`#7a6050`),hemiIntensity:.12,envIntensity:1,fogExtinction:55e-5,fogHeightDensity:.0011,fogHeightFalloff:.026,fogSunScatter:.55,fogElevation:.35,exposure:1.05,bloomStrength:.6,bloomThreshold:1.35,contrast:1.12,saturation:1.08,vibrance:.14,lift:[0,.004,.012],gamma:[1,1,1],gain:[1.03,1,.96],splitShadows:.5,splitHighlights:.45,splitBalance:0,vignette:.34,godRays:1,aoStrength:.85},Od={...Dd,zenith:Z(`#2a64cc`,.42),horizon:Z(`#a6c4e2`,.72),horizonSun:Z(`#d6e2ee`,.85),horizonExp:4.2,sunSpread:3,glow:Z(`#fff4e0`,.28),glowG:.84,haze:Z(`#e6eef8`,.35),hazeG:.5,antiSun:[0,0,0],ground:Z(`#6a665e`,.26),sunDisc:60,sunColor:Z(`#fff3e2`),sunIntensity:3.4,hemiSky:Z(`#b8d0ff`),hemiGround:Z(`#8a8070`),hemiIntensity:.1,envIntensity:.95,fogExtinction:7e-4,fogHeightDensity:.0012,fogHeightFalloff:.02,fogSunScatter:.5,fogElevation:.3,exposure:.95,bloomStrength:.5,bloomThreshold:1.5,contrast:1.1,saturation:1.1,vibrance:.12,lift:[0,.002,.008],gamma:[1,1,1],gain:[1.01,1,.99],splitShadows:.35,splitHighlights:.2,splitBalance:0,vignette:.3,godRays:.35,aoStrength:.9},kd={...Dd,zenith:Z(`#3468c4`,.38),horizon:Z(`#b0c6e0`,.6),horizonSun:Z(`#ffe2c2`,1.05),horizonExp:3.8,sunSpread:2.4,glow:Z(`#fff0d8`,.42),glowG:.82,haze:Z(`#f4e6da`,.45),hazeG:.5,antiSun:Z(`#b8a8c8`,.04),ground:Z(`#606068`,.16),sunDisc:45,sunColor:Z(`#ffe0bd`),sunIntensity:2.8,hemiSky:Z(`#a8c4f0`),hemiGround:Z(`#6a6460`),hemiIntensity:.12,envIntensity:1.05,fogExtinction:9e-4,fogHeightDensity:.0055,fogHeightFalloff:.045,fogSunScatter:.7,fogElevation:.35,exposure:1.05,bloomStrength:.6,bloomThreshold:1.35,contrast:1.08,saturation:1.05,vibrance:.12,lift:[0,.004,.014],gamma:[1,1,1],gain:[1.02,1,.98],splitShadows:.5,splitHighlights:.3,splitBalance:0,vignette:.32,godRays:.9},Ad={...Ed,horizonSun:Z(`#ffa878`,1.1),haze:Z(`#ffa888`,.5),glow:Z(`#ffb070`,.4),sunColor:Z(`#ff9a60`),fogHeightDensity:.006,fogHeightFalloff:.05,moon:0},jd={...Td,horizonSun:Z(`#c87a70`,.22),haze:Z(`#9a7aa0`,.08),glow:Z(`#e89070`,.04),fogHeightDensity:.004,fogHeightFalloff:.04,moon:0,moonIntensity:.3},Md=[[0,wd],[.16,wd],[.205,jd],[.25,Ad],[.3,kd],[.5,Od],[.71,Dd],[.745,Ed],[.78,Td],[.84,wd],[1,wd]];function Nd(e,t,n,r){for(let i of Object.keys(t)){let a=t[i],o=n[i];if(Array.isArray(a)){let t=e[i]??[0,0,0];for(let e=0;e<a.length;e++)t[e]=a[e]+(o[e]-a[e])*r;e[i]=t}else e[i]=a+(o-a)*r}}function Pd(e,t){let n=(e%1+1)%1,r=0;for(;r<Md.length-2&&Md[r+1][0]<n;)r++;let[i,a]=Md[r],[o,s]=Md[r+1],c=Math.min(1,Math.max(0,(n-i)/Math.max(1e-6,o-i))),l=c*c*(3-2*c),u=t??{};return Nd(u,a,s,l),u}function Fd(e){return{elev:Math.sin((e-.25)*Math.PI*2)*62,azim:200+(e-.5)*140}}var Id={uNight:{value:0},uTime:{value:0}},Ld={fog:1,heightFog:1,heightFalloff:1,stars:1,sky:1},Rd=class{scene;renderer;skyTime={value:0};sky=new vd(this.skyTime);shadows;hemi=new Ta(12572415,3814704,.6);sunDir=new V;moonDir=new V;look=Pd(.71);pmrem;envRT=null;skyScene=new di;lastEnvTime=-1;timeOfDay=.71;constructor(e,t){this.scene=e,this.renderer=t,gd(),this.shadows=new Cd(e),e.add(this.sky.mesh,this.hemi),e.fog=new ui(0,0),this.pmrem=new xo(t),this.apply()}get sun(){return this.shadows.key}setShadowQuality(e,t,n=t){this.shadows.setQuality(e,e,t,n)}setStaticCasters(e){this.shadows.setStaticCasters(e)}apply(){let e=this.timeOfDay,t=Pd(e,this.look),{elev:n,azim:r}=Fd(e);this.sunDir.setFromSphericalCoords(1,pt.degToRad(90-n),pt.degToRad(r));let i=Math.max(18,-n*.8+12);this.moonDir.setFromSphericalCoords(1,pt.degToRad(90-i),pt.degToRad(r+160)),_d(t,this.sunDir,this.moonDir,Ld);let a=Y(-3,4,n),o=this.shadows.key;a>.02?(this.shadows.setDirection(this._dir.copy(this.sunDir).setY(Math.max(.04,this.sunDir.y)).normalize()),o.color.setRGB(t.sunColor[0],t.sunColor[1],t.sunColor[2]),o.intensity=t.sunIntensity*a):(this.shadows.setDirection(this.moonDir),o.color.setRGB(t.moonColor[0],t.moonColor[1],t.moonColor[2]),o.intensity=t.moonIntensity),this.hemi.color.setRGB(t.hemiSky[0],t.hemiSky[1],t.hemiSky[2]),this.hemi.groundColor.setRGB(t.hemiGround[0],t.hemiGround[1],t.hemiGround[2]),this.hemi.intensity=t.hemiIntensity,this.renderer.toneMappingExposure=t.exposure,Id.uNight.value=q(1-Y(-4,14,n),0,1)*.85+.15*Y(35,5,n)*Y(-6,12,n),Math.abs(this.lastEnvTime-e)>.004&&this.rebuildEnv(t)}_dir=new V;rebuildEnv(e){this.lastEnvTime=this.timeOfDay,this.scene.remove(this.sky.mesh),this.skyScene.add(this.sky.mesh),this.sky.envMode=!0;let t=this.pmrem.fromScene(this.skyScene,0,.1,5e3);this.sky.envMode=!1,this.skyScene.remove(this.sky.mesh),this.scene.add(this.sky.mesh),this.envRT?.dispose(),this.envRT=t,this.scene.environment=t.texture,this.scene.environmentIntensity=e.envIntensity}followShadow(e){this.shadows.follow(e)}prepare(){this.shadows.bake(this.renderer,this.scene)}update(e){Id.uTime.value+=e,this.skyTime.value+=e}},zd={value:0};function Bd(){let e=new oa({color:16777215,roughness:.85,metalness:0});return e.onBeforeCompile=e=>{e.uniforms.uNight=Id.uNight,e.uniforms.uTime=Id.uTime,e.uniforms.uFDebug=zd,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute vec4 aFacade;
attribute vec4 aFacade2;
attribute vec4 aFacade3;
attribute vec3 aGlass;
attribute vec3 aFrame;
attribute vec3 aTrim;
varying vec3 vFWorld;
varying vec3 vFNormal;
flat varying vec4 vFacade;
flat varying vec4 vFacade2;
flat varying vec4 vFacade3;
flat varying vec3 vGlass;
flat varying vec3 vFrame;
flat varying vec3 vTrim;`).replace(`#include <project_vertex>`,`#include <project_vertex>
{
  mat4 im = mat4(1.0);
  #ifdef USE_INSTANCING
    im = instanceMatrix;
  #endif
  vFWorld = (modelMatrix * im * vec4(transformed, 1.0)).xyz;
  vFNormal = normalize(mat3(modelMatrix) * mat3(im) * objectNormal);
  vFacade = aFacade;
  vFacade2 = aFacade2;
  vFacade3 = aFacade3;
  vGlass = aGlass;
  vFrame = aFrame;
  vTrim = aTrim;
}`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float uNight;
uniform float uTime;
uniform float uFDebug;
varying vec3 vFWorld;
varying vec3 vFNormal;
flat varying vec4 vFacade;
flat varying vec4 vFacade2;
flat varying vec4 vFacade3;
flat varying vec3 vGlass;
flat varying vec3 vFrame;
flat varying vec3 vTrim;
// integer hash: stable for any input magnitude (sin-based hashes break down at world scale)
float fh1(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p))) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) * (1.0 / 4294967295.0);
}
float fnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(fh1(i), fh1(i + vec2(1, 0)), u.x), mix(fh1(i + vec2(0, 1)), fh1(i + vec2(1, 1)), u.x), u.y);
}
// anti-aliased 1D band: 1 inside [a, b], filtered by derivative width w
float band(float x, float a, float b, float w) {
  return smoothstep(a - w, a + w, x) * (1.0 - smoothstep(b - w, b + w, x));
}
// anti-aliased rectangle [lo, hi]
float rect(vec2 p, vec2 lo, vec2 hi, vec2 w) {
  return band(p.x, lo.x, hi.x, w.x) * band(p.y, lo.y, hi.y, w.y);
}
// Interior-mapped room behind a window. o = entry point in room space (x across, y up, 0 at the
// glass), d = view ray in room space (d.z > 0 goes into the room), size = room (w, h, depth).
// Returns lit colour; 'lamp' lights it from the ceiling, 'day' from the window.
vec3 roomColor(vec3 o, vec3 d, vec3 size, float seed, float lamp, float day, vec3 lampCol, float office) {
  vec3 inv = 1.0 / max(abs(d), vec3(1e-4)) * sign(d + 1e-6);
  float tx = ((d.x > 0.0 ? size.x : 0.0) - o.x) * inv.x;
  float ty = ((d.y > 0.0 ? size.y : 0.0) - o.y) * inv.y;
  float tz = (size.z - o.z) * inv.z;
  float t = min(tx, min(ty, tz));
  vec3 hp = o + d * t;
  float r1 = fh1(vec2(seed, 3.0)), r2 = fh1(vec2(seed, 7.0)), r3 = fh1(vec2(seed, 11.0));
  vec3 wallPaint = mix(vec3(0.62, 0.58, 0.5), mix(vec3(0.45, 0.52, 0.58), vec3(0.6, 0.42, 0.34), r2), r1 * 0.7);
  // offices: white-grey walls and grey carpet, so lit floors read as even bands, not a patchwork
  wallPaint = mix(wallPaint, vec3(0.68, 0.68, 0.66) * (0.9 + 0.2 * r1), office);
  vec3 floorCol = mix(mix(vec3(0.28, 0.18, 0.11), vec3(0.35, 0.34, 0.33), r3), vec3(0.3, 0.31, 0.32), office);
  vec3 ceilCol = vec3(0.8, 0.78, 0.74);
  vec3 c;
  float depthK = clamp(hp.z / size.z, 0.0, 1.0);
  if (t == tz) {
    c = wallPaint * 0.9;
    // furniture / partition silhouette against the back wall
    float fx = hp.x / size.x;
    float shelf = step(0.18 + r2 * 0.4, fx) * step(fx, 0.45 + r2 * 0.4) * step(hp.y, 0.9 + r3 * 1.2);
    c = mix(c, c * 0.35, shelf);
    // a framed picture or a doorway
    float pic = step(abs(fx - (0.3 + r1 * 0.4)), 0.12) * step(abs(hp.y - size.y * 0.55), 0.35);
    c = mix(c, mix(vec3(0.2, 0.25, 0.3), vec3(0.5, 0.3, 0.2), r3), pic * 0.8);
  } else if (t == tx) {
    c = wallPaint * 0.72;
  } else if (d.y > 0.0) {
    c = ceilCol;
  } else {
    c = floorCol;
  }
  // lamp: bright under the ceiling fixture in the middle of the room, falling off to the corners
  float fall = 1.0 - 0.55 * smoothstep(0.0, 0.8, length((hp.xz - vec2(size.x * 0.5, size.z * 0.5)) / size.xz));
  float nearCeil = 0.6 + 0.4 * smoothstep(0.0, size.y, hp.y);
  vec3 lit = c * lampCol * lamp * fall * nearCeil;
  // daylight: comes in through the window, so the room darkens toward the back
  vec3 dayLit = c * day * mix(1.0, 0.35, depthK);
  return lit + dayLit;
}
float gRough; float gMetal; vec3 gEmit;`).replace(`#include <color_fragment>`,`#include <color_fragment>
{
  vec3 N = normalize(vFNormal);
  vec3 P = vFWorld;
  float arch = vFacade2.x;       // 0 brick 1 brownstone 2 limestone 3 concrete 4 granite 5 curtain 6 ribbon
  float lit = vFacade2.y;
  float pier = vFacade2.z;
  float sill = vFacade2.w;
  float groundH = vFacade3.x;
  float paired = vFacade3.y;
  float office = vFacade3.z;
  float seed = floor(vFacade.w);
  gRough = 0.85; gMetal = 0.0; gEmit = vec3(0.0);
  vec3 wallCol = diffuseColor.rgb;
  if (abs(N.y) < 0.5) {
    bool alongX = abs(N.z) > abs(N.x);
    float face = alongX ? (N.z > 0.0 ? 3.0 : 4.0) : (N.x > 0.0 ? 1.0 : 2.0);
    // horizontal coordinate increases to the right when looking at the face from outside
    float u = alongX ? P.x * sign(N.z) : -P.z * sign(N.x);
    float v = P.y;
    vec3 T = alongX ? vec3(sign(N.z), 0.0, 0.0) : vec3(0.0, 0.0, -sign(N.x));
    float floorH = vFacade.z;
    float winW = vFacade.x;
    float winH = vFacade.y;
    bool glassy = arch > 4.5;
    float gap = 0.18;
    float winSpan = paired > 0.5 ? winW * 2.0 + gap : winW;
    float cellW = winSpan + pier;
    // --- where are we: storefront storey or an upper floor ---
    bool ground = v < groundH;
    float fy = ground ? v : (v - groundH);
    vec2 cell = vec2(u / cellW, fy / floorH);
    vec2 id = floor(cell);
    vec2 lp = vec2(fract(cell.x) * cellW, fract(cell.y) * floorH); // metres within the cell
    vec2 w = fwidth(vec2(u, v)) * 1.1 + 1e-4;                       // metres per pixel
    // cells per pixel → how "far" this is; beyond ~5 px per cell we fade detail to averages
    float far = smoothstep(0.1, 0.3, max(w.x / cellW, w.y / floorH));
    float px = max(w.x, w.y);

    // ---------- the storefront storey ----------
    float glassMask = 0.0, frameMask = 0.0, trimMask = 0.0, signMask = 0.0;
    vec2 wp = vec2(0.0); vec2 wsize = vec2(1.0);
    float roomSeed = 0.0;
    if (ground) {
      float bayW = 5.4 + fh1(vec2(seed, 1.0)) * 1.8;
      float bx = fract(u / bayW) * bayW;
      float bid = floor(u / bayW);
      float bulk = 0.55;
      float signTop = groundH - 0.25, signBot = groundH - 1.15;
      glassMask = rect(vec2(bx, v), vec2(0.35, bulk), vec2(bayW - 0.35, signBot - 0.1), w);
      signMask = rect(vec2(bx, v), vec2(0.2, signBot), vec2(bayW - 0.2, signTop), w) * step(0.35, fh1(vec2(bid, seed + 5.0)));
      // mullions and a door every other bay
      float mull = band(bx, bayW * 0.5 - 0.04, bayW * 0.5 + 0.04, w.x) * step(0.5, fh1(vec2(bid, seed)));
      frameMask = max(mull, band(v, signBot - 0.1, signBot, w.y)) * glassMask;
      wp = vec2(bx - 0.35, v - bulk); wsize = vec2(bayW - 0.7, signBot - 0.1 - bulk);
      roomSeed = bid * 7.0 + seed;
    } else {
      // ---------- upper floors ----------
      float x0 = pier * 0.5;
      float y0 = glassy ? 0.0 : sill;
      float wh = glassy ? floorH : winH;
      if (arch > 5.5) { y0 = sill; wh = winH; } // ribbon: glass band between spandrels
      vec2 lo = vec2(x0, y0), hi = vec2(x0 + winSpan, y0 + wh);
      if (glassy) { lo.x = 0.0; hi.x = cellW; }
      glassMask = rect(lp, lo, hi, w);
      wp = lp - lo; wsize = hi - lo;
      // frame: a band just inside the opening, mullions, the pair split and an office transom
      float fw = glassy ? 0.05 : 0.07;
      float inner = rect(lp, lo + fw, hi - fw, w);
      float mull = paired > 0.5 ? band(lp.x, x0 + winW, x0 + winW + gap, w.x) : 0.0;
      if (!glassy && winW > 1.3 && paired < 0.5) mull = max(mull, band(lp.x, x0 + winW * 0.5 - 0.03, x0 + winW * 0.5 + 0.03, w.x));
      float transom = office > 0.5 && !glassy ? band(lp.y, y0 + wh * 0.72 - 0.03, y0 + wh * 0.72 + 0.03, w.y) : 0.0;
      if (glassy) {
        // curtain wall: slim mullions at every module, a spandrel panel at each slab
        float spand = arch < 5.5 ? band(lp.y, 0.0, 1.05, w.y) : 0.0;
        mull = band(lp.x, 0.0, 0.05, w.x) + band(lp.x, cellW - 0.05, cellW, w.x) + band(lp.y, 0.0, 0.06, w.y);
        frameMask = clamp(mull + spand * 0.0, 0.0, 1.0);
        trimMask = spand;
      } else {
        frameMask = clamp((glassMask - inner) + mull + transom, 0.0, 1.0) * glassMask;
        // stone sill under each window, lintel above
        trimMask = rect(lp, vec2(x0 - 0.12, y0 - 0.14), vec2(x0 + winSpan + 0.12, y0), w);
        if (arch < 2.5) trimMask = max(trimMask, rect(lp, vec2(x0 - 0.06, y0 + wh), vec2(x0 + winSpan + 0.06, y0 + wh + 0.22), w));
        // limestone / granite: a band course at every floor line
        if (arch > 1.5 && arch < 4.5) trimMask = max(trimMask, band(lp.y, 0.0, 0.16, w.y) * 0.8);
      }
      roomSeed = id.x * 13.0 + id.y * 131.0 + face * 7.0 + seed;
    }

    // ---------- wall ----------
    float grime = fnoise(vec2(u, v) * 0.35 + seed) * 0.16 + fnoise(vec2(u * 0.08, v * 0.5) + seed) * 0.1;
    vec3 wall = wallCol * (0.84 + grime);
    // brick courses up close (fade out long before they could alias)
    if (arch < 1.5) {
      float course = v / 0.075;
      float row = floor(course);
      float bxk = (u + (mod(row, 2.0) * 0.11)) / 0.225;
      float mortar = max(1.0 - smoothstep(0.0, 0.12, fract(course)), 1.0 - smoothstep(0.0, 0.05, fract(bxk)));
      float mfade = 1.0 - smoothstep(0.004, 0.012, px);
      wall *= mix(1.0, (0.86 + 0.28 * fh1(vec2(floor(bxk), row))) * mix(1.0, 0.72, mortar), mfade);
    }
    // rusticated base for stone buildings
    if ((arch > 1.5 && arch < 4.5) && v < groundH + floorH * 1.0) wall *= 1.0 - 0.18 * (1.0 - smoothstep(0.0, 0.05, fract(v / 0.62))) * (1.0 - smoothstep(0.01, 0.03, px));
    // soot streaks below sills and a darker, dirtier street level
    float streak = fnoise(vec2(u * 1.7, floor(v / floorH) * 3.0 + seed)) * (1.0 - smoothstep(0.0, floorH * 0.6, lp.y - sill + floorH * 0.0));
    wall *= 1.0 - 0.12 * streak * (1.0 - glassMask);
    wall *= mix(0.7, 1.0, smoothstep(0.0, 9.0, v));
    vec3 trim = vTrim * (0.9 + grime * 0.6);
    vec3 frame = vFrame;

    // ---------- glass: interior room + reflection ----------
    vec3 V = normalize(P - cameraPosition);
    // ray in room space: x along the face, y up, z into the building
    vec3 d = vec3(dot(V, T), V.y, -dot(V, N));
    float roomW = ground ? wsize.x : cellW;
    float roomH = ground ? wsize.y + 1.0 : floorH;
    float roomD = ground ? 7.0 : 4.5 + fh1(vec2(roomSeed, 2.0)) * 2.0;
    vec3 o = vec3(ground ? wp.x : lp.x, ground ? wp.y + 0.3 : lp.y, 0.0);
    float rnd = fh1(vec2(roomSeed, 1.0));
    // who has the lights on: apartments per room, offices by floor zone; shops all evening
    float zone = fh1(vec2(floor(id.x / 6.0) + seed, id.y));
    float onDraw = office > 0.5 ? zone * 0.8 + rnd * 0.2 : rnd;
    float isOn = ground ? step(0.25, fh1(vec2(roomSeed, 9.0))) : step(onDraw, lit);
    // late-night thinning: fewer lights as the night deepens is too subtle to see; keep it simple
    float warmCool = office > 0.5 ? step(0.35, fh1(vec2(seed, 4.0))) : step(0.8, fh1(vec2(roomSeed, 4.0)));
    vec3 lampCol = mix(vec3(1.0, 0.72, 0.44), vec3(0.78, 0.88, 1.0), warmCool);
    float lampPow = (ground ? 3.2 : 1.9) * (0.7 + 0.6 * fh1(vec2(roomSeed, 5.0)));
    float night = uNight;
    float lamp = isOn * lampPow * smoothstep(0.15, 0.7, night);
    float dayIn = 0.22 * (1.0 - night);
    vec3 room = vec3(0.0);
    if (glassMask > 0.001 && far < 0.999 && d.z > 0.0) {
      room = roomColor(o, d, vec3(roomW, roomH, roomD), roomSeed, lamp, dayIn, lampCol, ground ? 0.0 : office);
      // blinds / curtains right behind the glass
      if (!ground) {
        float kind = fh1(vec2(roomSeed, 6.0));
        vec2 q = wp / max(wsize, vec2(0.01));
        if (kind < 0.3) {
          float drop = 0.15 + 0.7 * fh1(vec2(roomSeed, 8.0));
          float slats = 0.75 + 0.25 * smoothstep(0.3, 0.5, fract(wp.y / 0.06)) * (1.0 - smoothstep(0.004, 0.01, px));
          float blind = step(1.0 - drop, q.y);
          vec3 bc = vec3(0.72, 0.7, 0.66) * slats;
          room = mix(room, bc * (lamp * lampCol * 0.55 + dayIn * 1.6), blind);
        } else if (kind < 0.55) {
          float open = 0.18 + 0.3 * fh1(vec2(roomSeed, 10.0));
          float cur = max(1.0 - smoothstep(open - 0.02, open + 0.02, q.x), smoothstep(1.0 - open - 0.02, 1.0 - open + 0.02, q.x));
          vec3 cc = mix(vec3(0.75, 0.68, 0.55), vec3(0.45, 0.2, 0.18), step(0.6, fh1(vec2(roomSeed, 12.0))));
          room = mix(room, cc * (lamp * lampCol * 0.7 + dayIn * 1.4), cur * 0.92);
        }
        // a TV's blue flicker in a few dark rooms
        float tv = step(0.93, fh1(vec2(roomSeed, 14.0))) * (1.0 - isOn) * smoothstep(0.4, 0.8, night);
        room += tv * vec3(0.25, 0.4, 1.0) * (0.35 + 0.25 * sin(uTime * (7.0 + rnd * 5.0)) * sin(uTime * 2.3 + rnd * 20.0));
      }
    }
    // distance average: lit fraction of rooms glowing, the rest dark glass
    vec3 roomAvg = mix(vec3(0.03), lampCol * 0.55, lit) * lampPow * smoothstep(0.15, 0.7, night) + vec3(0.05) * (1.0 - night);
    room = mix(room, roomAvg, far);
    vec3 tint = mix(vec3(1.0), vGlass * 2.2, glassy ? 0.85 : 0.35);

    // ---------- storefront sign ----------
    vec3 signCol = vec3(0.0);
    if (signMask > 0.0) {
      float sc = fh1(vec2(roomSeed, 21.0));
      vec3 sgn = sc < 0.25 ? vec3(0.9, 0.2, 0.15) : sc < 0.5 ? vec3(0.1, 0.35, 0.8) : sc < 0.7 ? vec3(0.1, 0.5, 0.3) : sc < 0.85 ? vec3(0.9, 0.7, 0.2) : vec3(0.85, 0.85, 0.82);
      signCol = sgn;
    }

    // ---------- compose ----------
    float gm = clamp(glassMask - frameMask, 0.0, 1.0);
    // far away the openings collapse to their coverage fraction
    float cover = ground ? 0.55 : (glassy ? 0.85 : (winSpan * winH) / (cellW * floorH));
    gm = mix(gm, cover * 0.9, far);
    float fm = mix(frameMask, cover * 0.1, far);
    float tm = mix(trimMask, 0.08, far);
    vec3 base = mix(wall, trim, tm * (1.0 - gm));
    base = mix(base, frame, fm);
    base = mix(base, signCol * 0.6 + vec3(0.02), signMask * (1.0 - far));
    // glass itself is dark: what you see is the room (emission) plus the specular reflection
    diffuseColor.rgb = mix(base, vGlass * 0.05, gm);
    // mirror-ish curtain walls; clear residential glass is a dielectric
    float panelRough = 0.04 + 0.08 * fh1(vec2(id.x + seed, id.y));
    gRough = mix(mix(0.9, 0.55, fm), glassy ? panelRough : 0.06, gm);
    gMetal = mix(mix(0.0, glassy ? 0.6 : 0.1, fm), glassy ? 0.75 : 0.0, gm);
    if (glassy) diffuseColor.rgb = mix(diffuseColor.rgb, vGlass * 0.9, gm * 0.9); // metal tint colours the reflection
    gEmit = room * tint * gm * (glassy ? 0.55 : 1.0);
    gEmit += signCol * signMask * (1.0 - far) * (0.02 + 1.6 * smoothstep(0.2, 0.7, night));
    if (uFDebug > 0.5) { diffuseColor.rgb = uFDebug < 1.5 ? vec3(gm) : uFDebug < 2.5 ? vec3(rnd) : vec3(far); gEmit = vec3(0.0); gMetal = 0.0; gRough = 1.0; }
  } else if (N.y > 0.5) {
    // roofs: tar with patches, pale membrane with seams, or gravel
    float kind = vFacade3.w;
    float n = fnoise(P.xz * 0.6 + seed) * 0.5 + fnoise(P.xz * 3.1) * 0.25;
    vec2 w2 = fwidth(P.xz) + 1e-4;
    if (kind < 0.5) diffuseColor.rgb = vec3(0.09, 0.09, 0.1) * (0.8 + n) + vec3(0.03) * step(0.72, fnoise(P.xz * 0.25 + seed));
    else if (kind < 1.5) {
      float seam = 1.0 - smoothstep(0.0, 0.03 + w2.x, abs(fract(P.x / 1.8) - 0.5) * 1.8 - 0.86);
      diffuseColor.rgb = vec3(0.55, 0.56, 0.57) * (0.82 + n * 0.4) * mix(1.0, 0.8, seam * 0.5);
    } else diffuseColor.rgb = mix(vec3(0.3, 0.29, 0.27), vec3(0.42, 0.4, 0.37), fnoise(P.xz * 9.0)) * (0.8 + n * 0.5);
    gRough = kind > 0.5 && kind < 1.5 ? 0.7 : 0.95;
  } else {
    diffuseColor.rgb *= 0.3;
  }
}`).replace(`#include <roughnessmap_fragment>`,`#include <roughnessmap_fragment>
roughnessFactor = gRough;`).replace(`#include <metalnessmap_fragment>`,`#include <metalnessmap_fragment>
metalnessFactor = gMetal;`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
totalEmissiveRadiance += gEmit;`)},e.customProgramCacheKey=()=>`facade-v2`,e}function Vd(e,t,n,r){let i=new oa({color:new U(.11,.11,.115),roughness:.9}),a=e.slice(0,16),o=t.slice(0,16);for(;a.length<16;)a.push(1e6);for(;o.length<16;)o.push(1e6);return i.onBeforeCompile=e=>{e.uniforms.uAx={value:a},e.uniforms.uSz={value:o},e.uniforms.uAw={value:n},e.uniforms.uSw={value:r},e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vGW;`).replace(`#include <project_vertex>`,`#include <project_vertex>
vGW = (modelMatrix * vec4(transformed, 1.0)).xyz;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying vec3 vGW;
uniform float uAx[16];
uniform float uSz[16];
uniform float uAw;
uniform float uSw;
float gh(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p))) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) * (1.0 / 4294967295.0);
}
float gn(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(gh(i), gh(i+vec2(1,0)), u.x), mix(gh(i+vec2(0,1)), gh(i+vec2(1,1)), u.x), u.y); }
float gRoughG;`).replace(`#include <color_fragment>`,`#include <color_fragment>
{
  vec2 p = vGW.xz;
  float dAx = 1e9; float dSz = 1e9;
  for (int i = 0; i < 16; i++) { dAx = min(dAx, abs(p.x - uAx[i])); dSz = min(dSz, abs(p.y - uSz[i])); }
  float onAve = step(dAx, uAw * 0.5);
  float onSt = step(dSz, uSw * 0.5);
  float inter = onAve * onSt;
  vec2 fw = fwidth(p) + 1e-4;
  vec3 col = diffuseColor.rgb * (0.8 + 0.35 * gn(p * 0.8) + 0.15 * gn(p * 7.0));
  float paint = 0.0; vec3 paintCol = vec3(0.85);
  // avenue: double yellow centre line + dashed lane lines
  if (onAve > 0.5 && inter < 0.5) {
    float yl = 1.0 - smoothstep(0.08 - fw.x, 0.08 + fw.x, abs(dAx - 0.18));
    if (yl > 0.0) { paint = yl; paintCol = vec3(0.85, 0.65, 0.12); }
    float lane = (1.0 - smoothstep(0.07 - fw.x, 0.07 + fw.x, abs(dAx - uAw * 0.25))) * step(fract(p.y / 9.0), 0.45);
    paint = max(paint, lane);
  }
  if (onSt > 0.5 && inter < 0.5) {
    float yl = 1.0 - smoothstep(0.08 - fw.y, 0.08 + fw.y, abs(dSz - 0.15));
    if (yl > 0.0) { paint = yl; paintCol = vec3(0.85, 0.65, 0.12); }
  }
  // crosswalk zebras at intersection edges
  float cwA = step(uSw * 0.5 - 3.2, dSz) * step(dSz, uSw * 0.5 - 0.4) * onAve;
  float cwS = step(uAw * 0.5 - 3.2, dAx) * step(dAx, uAw * 0.5 - 0.4) * onSt;
  float zebraA = cwA * step(0.5, fract(p.x / 1.2));
  float zebraS = cwS * step(0.5, fract(p.y / 1.2));
  paint = max(paint, max(zebraA, zebraS) * (1.0 - inter * 0.0));
  float worn = 0.75 + 0.25 * gn(p * 2.3);
  col = mix(col, paintCol * worn, paint);
  diffuseColor.rgb = col;
  gRoughG = mix(0.92, 0.6, paint);
}`).replace(`#include <roughnessmap_fragment>`,`#include <roughnessmap_fragment>
roughnessFactor = gRoughG;`)},i.customProgramCacheKey=()=>`ground-v1`,i}var Hd=new _n,Ud=new mt,Wd=new V,Gd=new V,Kd=new V(0,1,0),qd=class{mats=[];cols=[];extra=[];add(e,t,n,r,i,a,o=0,s,c){Ud.setFromAxisAngle(Kd,o),Hd.compose(Wd.set(e,t,n),Ud,Gd.set(r,i,a)),this.mats.push(...Hd.elements),s&&this.cols.push(s.r,s.g,s.b),c&&c.forEach((e,t)=>(this.extra[t]??=[]).push(e))}get count(){return this.mats.length/16}build(e,t,n=!0,r=[],i=[]){let a=this.count;if(a===0)return null;let o=new xi(e,t,a);return o.instanceMatrix.array.set(this.mats),this.cols.length&&(o.instanceColor=new pi(new Float32Array(this.cols),3)),r.forEach((t,n)=>e.setAttribute(t,new pi(new Float32Array(this.extra[n]),i[n]))),o.castShadow=n,o.receiveShadow=!0,o.computeBoundingSphere(),o}};function Jd(){let e=new Hr(1,1,1);return e.translate(0,.5,0),e}var Yd=class{city;group=new si;drawCalls=0;instances=0;lampPool=null;constructor(e){this.city=e,this.buildGround(),this.buildBuildings(),this.buildProps()}addTo(e){e.add(this.group)}add(e){e&&(this.group.add(e),this.drawCalls++,e instanceof xi&&(this.instances+=e.count))}buildGround(){let e=this.city.bounds,t=this.city.params,n=new ia(e.x1-e.x0+12,e.z1-e.z0+12);n.rotateX(-Math.PI/2);let r=new zr(n,Vd(this.city.avenueX,this.city.streetZ,t.avenueWidth,t.streetWidth));r.position.set((e.x0+e.x1)/2,0,(e.z0+e.z1)/2),r.receiveShadow=!0,this.add(r);let i=new qd,a=new qd;for(let e of this.city.blocks)(e.park?a:i).add((e.x0+e.x1)/2,0,(e.z0+e.z1)/2,e.x1-e.x0,.14,e.z1-e.z0);this.add(i.build(Jd(),new oa({color:7828332,roughness:.92}),!1)),this.add(a.build(Jd(),new oa({color:4151854,roughness:1}),!1))}buildBuildings(){let e=Bd(),t=this.city.bounds,n=Math.ceil((t.x1-t.x0)/160),r=Math.ceil((t.z1-t.z0)/160),i=Array.from({length:n*r},()=>new qd),a=new U,o=new U,s=new U,c=new U,l=new qd;for(let e of this.city.buildings){a.setHex(e.wallColor),o.setHex(e.glassColor),s.setHex(e.frameColor),c.setHex(e.trimColor);for(let u of e.tiers){let d=(u.x0+u.x1)/2,f=(u.z0+u.z1)/2;i[Math.min(n-1,Math.floor((d-t.x0)/160))+Math.min(r-1,Math.floor((f-t.z0)/160))*n].add(d,u.y0,f,u.x1-u.x0,u.y1-u.y0,u.z1-u.z0,0,a,[e.windowW,e.windowH,e.floorH,e.seed,e.archetype,e.litFraction,e.pier,e.sill,e.groundH,+!!e.paired,+!!e.office,e.roofKind,o.r,o.g,o.b,s.r,s.g,s.b,c.r,c.g,c.b]);let p=c.clone().multiplyScalar(.85),m=u.x1-u.x0,h=u.z1-u.z0,g=.3,_=.55,v=u.y1-.45;l.add(d,v,u.z0+.15,m+2*g,_,.9,0,p),l.add(d,v,u.z1-.15,m+2*g,_,.9,0,p),l.add(u.x0+.15,v,f,.9,_,h,0,p),l.add(u.x1-.15,v,f,.9,_,h,0,p)}}let u=Jd(),d=[[`aFacade`,4],[`aFacade2`,4],[`aFacade3`,4],[`aGlass`,3],[`aFrame`,3],[`aTrim`,3]];for(let t of i){if(!t.count)continue;let n=u.clone(),r=t.extra,i=0,a=d.map(([e,n])=>{let a=new Float32Array(t.count*n);for(let e=0;e<t.count;e++)for(let t=0;t<n;t++)a[e*n+t]=r[i+t][e];return i+=n,[e,new pi(a,n)]});t.extra=[];let o=t.build(n,e);if(o){for(let[e,t]of a)n.setAttribute(e,t);this.add(o)}}this.add(l.build(Jd(),new oa({color:16777215,roughness:.8})))}buildProps(){let e=new Map;for(let t of this.city.props){let n=e.get(t.type);n||e.set(t.type,n=[]),n.push(t)}let t=t=>e.get(t)??[],n=new ll(99),r=new oa({color:16777215,roughness:.85}),i=new oa({color:9080724,roughness:.45,metalness:.7}),a=new oa({color:2895924,roughness:.5,metalness:.6}),o=new oa({color:7031346,roughness:.8});{let e=new qd,n=new U;for(let r of t(`parapet`)){let t=this.city.buildings[r.building];n.setHSL(t.hue,t.sat*.8,t.light*.85),e.add(r.x,r.y,r.z,r.sx,r.sy,r.sz,0,n)}this.add(e.build(Jd(),r))}{let e=new qd,n=new qd,r=new qd;for(let r of t(`hvac`))e.add(r.x,r.y,r.z,r.sx,r.sy,r.sz),n.add(r.x,r.y+r.sy,r.z,Math.min(r.sx,r.sz)*.35,.15,Math.min(r.sx,r.sz)*.35);for(let e of t(`vent`))r.add(e.x,e.y,e.z,e.sx*.3,e.sy,e.sx*.3);this.add(e.build(Jd(),i));let o=new ea(1,1,1,14);o.translate(0,.5,0),this.add(n.build(o,a));let s=new ea(1,1,1,10);s.translate(0,.5,0),this.add(r.build(s,i))}{let e=new qd,n=new qd,r=new qd,i=new qd;for(let a of t(`waterTower`)){let t=a.sx,o=a.sy,s=a.sz;e.add(a.x,a.y+o,a.z,t,s,t,a.rotY),i.add(a.x,a.y+o+s*.33,a.z,t*1.02,.15,t*1.02),i.add(a.x,a.y+o+s*.66,a.z,t*1.02,.15,t*1.02),n.add(a.x,a.y+o+s,a.z,t*1.05,t*.55,t*1.05,a.rotY);for(let e=0;e<4;e++){let n=a.rotY+e*Math.PI/2+Math.PI/4;r.add(a.x+Math.cos(n)*t*.75,a.y,a.z+Math.sin(n)*t*.75,.25,o+.2,.25)}}let s=new ea(1,1,1,18);s.translate(0,.5,0),this.add(e.build(s,o)),this.add(i.build(s.clone(),a));let c=new ta(1,1,18);c.translate(0,.5,0),this.add(n.build(c,new oa({color:3815996,roughness:.7}))),this.add(r.build(Jd(),a))}{let e=new qd,n=new qd;for(let r of t(`antenna`))e.add(r.x,r.y,r.z,.35,r.sy,.35),n.add(r.x,r.y+r.sy,r.z,.5,.5,.5);let r=new ea(.4,1,1,8);r.translate(0,.5,0),this.add(e.build(r,i)),this.add(n.build(new ra(1,1),new oa({color:2228224,emissive:16719888,emissiveIntensity:6}),!1))}{let e=new qd,n=Array.from({length:6},()=>new qd);for(let r of t(`billboard`)){let t=Math.max(r.sx,r.sz),i=r.sy-3;e.add(r.x,r.y,r.z,r.sx===.5?.4:t*.05,3,r.sz===.5?.4:t*.05,0),e.add(r.x,r.y+2.2,r.z,r.sx+.3,i+.8,r.sz+.3,0),n[r.variant%6].add(r.x,r.y+2.6+i/2,r.z,t,i,1,r.rotY),n[r.variant%6].add(r.x,r.y+2.6+i/2,r.z,t,i,1,r.rotY+Math.PI)}this.add(e.build(Jd(),a));let r=Zd();n.forEach((e,t)=>{let n=new ia(1,1),i=n.attributes.uv;for(let e=0;e<i.count;e++)i.setX(e,(i.getX(e)+t)/6);n.translate(0,0,.36);let a=new oa({map:r,emissiveMap:r,emissive:16777215,emissiveIntensity:.9,roughness:.5});this.add(e.build(n,a,!1))})}{let e=new qd,n=new qd,r=new qd,i=new qd;for(let a of t(`streetLight`)){e.add(a.x,0,a.z,.14,a.sy,.14);let t=Math.sin(a.rotY+Math.PI/2),o=-Math.cos(a.rotY+Math.PI/2)*1.3,s=t*1.3;n.add(a.x+o*.5,a.sy-.1,a.z+s*.5,Math.abs(o)+.12,.12,Math.abs(s)+.12),r.add(a.x+o,a.sy-.35,a.z+s,.55,.25,.55),i.add(a.x+o,.03,a.z+s,9,1,9)}let o=new ea(.6,1,1,8);o.translate(0,.5,0),this.add(e.build(o,a)),this.add(n.build(Jd(),a)),this.add(r.build(Jd(),new oa({color:3355443,emissive:16767392,emissiveIntensity:3}),!1));let s=new ia(1,1);s.rotateX(-Math.PI/2);let c=new fr({map:Xd(),color:16763274,transparent:!0,blending:2,depthWrite:!1,opacity:0});c.onBeforeCompile=e=>{e.uniforms.uNight=Id.uNight,e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float uNight;`).replace(`#include <opaque_fragment>`,`diffuseColor.a = diffuseColor.a * 0.0 + texture2D(map, vMapUv).r * uNight * 0.55;
#include <opaque_fragment>`)},c.opacity=1,this.lampPool=i.build(s,c,!1),this.lampPool&&(this.lampPool.receiveShadow=!1),this.add(this.lampPool)}{let e=new qd,n=new qd,r=new qd,i=new qd;for(let a of t(`signal`)){e.add(a.x,0,a.z,.2,a.sy,.2);let t=a.variant===0?-1:1;n.add(a.x+t*0,a.sy-1.6,a.z,.45,1.3,.45),(a.variant===0?r:i).add(a.x,a.sy-.9,a.z,.2,.2,.2)}let o=new ea(.5,.5,1,8);o.translate(0,.5,0),this.add(e.build(o,a)),this.add(n.build(Jd(),new oa({color:1908772,roughness:.6})));let s=new ra(1,1);this.add(r.build(s,new oa({color:2097152,emissive:16722458,emissiveIntensity:5}),!1)),this.add(i.build(s,new oa({color:8192,emissive:3211136,emissiveIntensity:5}),!1))}{let e=new qd,r=new qd,i=new U;for(let a of t(`tree`)){e.add(a.x,0,a.z,.18*a.sx,a.sy*.5,.18*a.sx),i.setHSL(.22+n.range(-.04,.05),.45,.2+n.range(-.05,.06));let t=a.sy*.28;r.add(a.x,a.sy*.62,a.z,t,t*.85,t,a.rotY,i),r.add(a.x+t*.4,a.sy*.52,a.z+t*.2,t*.7,t*.6,t*.7,a.rotY,i)}let a=new ea(.7,1,1,7);a.translate(0,.5,0),this.add(e.build(a,o)),this.add(r.build(new ra(1,1),new oa({color:16777215,roughness:.9,flatShading:!0})))}{let e=new qd,n=new qd,r=new qd;for(let n of t(`bench`))e.add(n.x,0,n.z,1.8,.5,.6,n.rotY);for(let e of t(`hydrant`))n.add(e.x,0,e.z,.22,.8,.22);for(let e of t(`kiosk`))r.add(e.x,0,e.z,e.sx,e.sy,e.sz);this.add(e.build(Jd(),o));let i=new ea(1,1,1,8);i.translate(0,.5,0),this.add(n.build(i,new oa({color:11545118,roughness:.5}))),this.add(r.build(Jd(),new oa({color:3104080,roughness:.6})))}}};function Xd(){let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);return n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.5,`rgba(160,160,160,1)`),n.addColorStop(1,`rgba(0,0,0,1)`),t.fillStyle=n,t.fillRect(0,0,64,64),new Xi(e)}function Zd(){let e=document.createElement(`canvas`);e.width=1536,e.height=110;let t=e.getContext(`2d`);[[`#0e2a47`,`#39c6ff`,`NIMBUS`,`AIR · 24/7`],[`#3d0d24`,`#ff4f8b`,`PULSE`,`energy soda`],[`#10291a`,`#8cff6a`,`VERDE`,`city greens`],[`#2b1a05`,`#ffb347`,`HALCYON`,`hotel & spa`],[`#161616`,`#f2f2f2`,`OBLIQUE`,`new season`],[`#221043`,`#b890ff`,`LUMEN`,`stream it`]].forEach(([e,n,r,i],a)=>{let o=a*256,s=t.createLinearGradient(o,0,o+256,110);s.addColorStop(0,e),s.addColorStop(1,`#000000`),t.fillStyle=s,t.fillRect(o,0,256,110),t.fillStyle=n,t.globalAlpha=.25,t.beginPath(),t.arc(o+209.92,55,44,0,Math.PI*2),t.fill(),t.globalAlpha=1,t.font=`bold 46px sans-serif`,t.fillText(r,o+14,58),t.font=`20px sans-serif`,t.fillStyle=`#ffffffcc`,t.fillText(i,o+16,90)});let n=new Xi(e);return n.colorSpace=Ne,n.anisotropy=4,n}var Qd={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},$d=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},ef=new Aa(-1,1,1,-1,0,1),tf=new class extends Dr{constructor(){super(),this.setAttribute(`position`,new yr([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new yr([0,2,0,0,2,0],2))}},nf=class{constructor(e){this._mesh=new zr(tf,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ef)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},rf=class extends $d{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Xr?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=qr.clone(e.uniforms),this.material=new Xr({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new nf(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},af=class extends $d{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},of=class extends $d{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},sf=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new B);this._width=n.width,this._height=n.height,t=new Bt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:g}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new rf(Qd),this.copyPass.material.blending=0,this.clock=new Pa}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}af!==void 0&&(r instanceof af?n=!0:r instanceof of&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new B);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},cf=class extends $d{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new U}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},lf={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new U(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},uf=class e extends $d{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new B(256,256):new B(e.x,e.y),this.clearColor=new U(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Bt(i,a,{type:g}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new Bt(i,a,{type:g});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new Bt(i,a,{type:g});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=lf;this.highPassUniforms=qr.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Xr({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[3,5,7,9,11];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new B(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new V(1,1,1),new V(1,1,1),new V(1,1,1),new V(1,1,1),new V(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=qr.clone(Qd.uniforms),this.blendMaterial=new Xr({uniforms:this.copyUniforms,vertexShader:Qd.vertexShader,fragmentShader:Qd.fragmentShader,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new U,this._oldClearAlpha=1,this._basic=new fr,this._fsQuad=new nf(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new B(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Xr({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new B(.5,.5)},direction:{value:new B(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}_getCompositeMaterial(e){return new Xr({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};uf.BlurDirectionX=new B(1,0),uf.BlurDirectionY=new B(0,1);var df={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},ff=class extends $d{constructor(){super(),this.uniforms=qr.clone(df.uniforms),this.material=new aa({name:df.name,uniforms:this.uniforms,vertexShader:df.vertexShader,fragmentShader:df.fragmentShader}),this._fsQuad=new nf(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Dt.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},pf={name:`SMAAEdgesShader`,defines:{SMAA_THRESHOLD:`0.1`},uniforms:{tDiffuse:{value:null},resolution:{value:new B(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},mf={name:`SMAAWeightsShader`,defines:{SMAA_MAX_SEARCH_STEPS:`8`,SMAA_AREATEX_MAX_DISTANCE:`16`,SMAA_AREATEX_PIXEL_SIZE:`( 1.0 / vec2( 160.0, 560.0 ) )`,SMAA_AREATEX_SUBTEX_SIZE:`( 1.0 / 7.0 )`},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new B(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},hf={name:`SMAABlendShader`,uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new B(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`},gf=class extends $d{constructor(){super(),this._edgesRT=new Bt(1,1,{depthBuffer:!1,type:g}),this._edgesRT.texture.name=`SMAAPass.edges`,this._weightsRT=new Bt(1,1,{depthBuffer:!1,type:g}),this._weightsRT.texture.name=`SMAAPass.weights`;let e=this,t=new Image;t.src=this._getAreaTexture(),t.onload=function(){e._areaTexture.needsUpdate=!0},this._areaTexture=new Lt,this._areaTexture.name=`SMAAPass.area`,this._areaTexture.image=t,this._areaTexture.minFilter=o,this._areaTexture.generateMipmaps=!1,this._areaTexture.flipY=!1;let n=new Image;n.src=this._getSearchTexture(),n.onload=function(){e._searchTexture.needsUpdate=!0},this._searchTexture=new Lt,this._searchTexture.name=`SMAAPass.search`,this._searchTexture.image=n,this._searchTexture.magFilter=r,this._searchTexture.minFilter=r,this._searchTexture.generateMipmaps=!1,this._searchTexture.flipY=!1,this._uniformsEdges=qr.clone(pf.uniforms),this._materialEdges=new Xr({defines:Object.assign({},pf.defines),uniforms:this._uniformsEdges,vertexShader:pf.vertexShader,fragmentShader:pf.fragmentShader}),this._uniformsWeights=qr.clone(mf.uniforms),this._uniformsWeights.tDiffuse.value=this._edgesRT.texture,this._uniformsWeights.tArea.value=this._areaTexture,this._uniformsWeights.tSearch.value=this._searchTexture,this._materialWeights=new Xr({defines:Object.assign({},mf.defines),uniforms:this._uniformsWeights,vertexShader:mf.vertexShader,fragmentShader:mf.fragmentShader}),this._uniformsBlend=qr.clone(hf.uniforms),this._uniformsBlend.tDiffuse.value=this._weightsRT.texture,this._materialBlend=new Xr({uniforms:this._uniformsBlend,vertexShader:hf.vertexShader,fragmentShader:hf.fragmentShader}),this._fsQuad=new nf(null)}render(e,t,n){this._uniformsEdges.tDiffuse.value=n.texture,this._fsQuad.material=this._materialEdges,e.setRenderTarget(this._edgesRT),this.clear&&e.clear(),this._fsQuad.render(e),this._fsQuad.material=this._materialWeights,e.setRenderTarget(this._weightsRT),this.clear&&e.clear(),this._fsQuad.render(e),this._uniformsBlend.tColor.value=n.texture,this._fsQuad.material=this._materialBlend,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(),this._fsQuad.render(e))}setSize(e,t){this._edgesRT.setSize(e,t),this._weightsRT.setSize(e,t),this._materialEdges.uniforms.resolution.value.set(1/e,1/t),this._materialWeights.uniforms.resolution.value.set(1/e,1/t),this._materialBlend.uniforms.resolution.value.set(1/e,1/t)}dispose(){this._edgesRT.dispose(),this._weightsRT.dispose(),this._areaTexture.dispose(),this._searchTexture.dispose(),this._materialEdges.dispose(),this._materialWeights.dispose(),this._materialBlend.dispose(),this._fsQuad.dispose()}_getAreaTexture(){return`data:image/png;base64,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`}_getSearchTexture(){return`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII=`}},_f={uniforms:{tDiffuse:{value:null},uAmount:{value:0},uVignette:{value:.35},uCenter:{value:new B(.5,.52)}},vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`
    uniform sampler2D tDiffuse; uniform float uAmount; uniform float uVignette; uniform vec2 uCenter;
    varying vec2 vUv;
    void main(){
      vec2 d = vUv - uCenter;
      float r = length(d);
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      if (uAmount > 0.001) {
        // blur only toward the edges so the hero at the centre stays crisp
        float k = uAmount * smoothstep(0.12, 0.7, r);
        vec3 acc = col; float wsum = 1.0;
        for (int i = 1; i <= 8; i++) {
          float s = float(i) / 8.0;
          vec2 uv = vUv - d * s * k * 0.12;
          acc += texture2D(tDiffuse, uv).rgb * (1.0 - s * 0.5);
          wsum += 1.0 - s * 0.5;
        }
        col = acc / wsum;
        float ca = k * 0.0015;
        col.r = mix(col.r, texture2D(tDiffuse, vUv + d * ca).r, 0.6);
        col.b = mix(col.b, texture2D(tDiffuse, vUv - d * ca).b, 0.6);
      }
      float vig = 1.0 - smoothstep(0.25, 0.85, r * (1.0 + uVignette * 0.6 + uAmount * 0.25));
      col *= mix(1.0 - uVignette, 1.0, vig);
      gl_FragColor = vec4(col, 1.0);
    }`},vf={uniforms:{tDiffuse:{value:null},uContrast:{value:1},uSaturation:{value:1},uVibrance:{value:0}},vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`
    uniform sampler2D tDiffuse; uniform float uContrast; uniform float uSaturation; uniform float uVibrance;
    varying vec2 vUv;
    void main(){
      vec3 c = max(texture2D(tDiffuse, vUv).rgb, vec3(0.0));
      c = 0.18 * pow(c / 0.18 + 1e-6, vec3(uContrast));
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
      float sat = (mx - mn) / max(mx, 1e-5);
      float k = uSaturation * (1.0 + uVibrance * (1.0 - sat));
      c = max(mix(vec3(l), c, k), vec3(0.0));
      gl_FragColor = vec4(c, 1.0);
    }`},yf={uniforms:{tDiffuse:{value:null},uLift:{value:new V(0,0,0)},uGamma:{value:new V(1,1,1)},uGain:{value:new V(1,1,1)},uSplitShadows:{value:0},uSplitHighlights:{value:0},uSplitBalance:{value:0}},vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`
    uniform sampler2D tDiffuse; uniform vec3 uLift; uniform vec3 uGamma; uniform vec3 uGain;
    uniform float uSplitShadows; uniform float uSplitHighlights; uniform float uSplitBalance;
    varying vec2 vUv;
    void main(){
      vec4 src = texture2D(tDiffuse, vUv);
      vec3 c = clamp(src.rgb, 0.0, 1.0);
      c = clamp(c * uGain + uLift * (1.0 - c), 0.0, 1.0);
      c = pow(c, 1.0 / max(uGamma, vec3(0.01)));
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float pivot = 0.5 + uSplitBalance * 0.25;
      float sh = (1.0 - smoothstep(0.0, pivot, l)) * uSplitShadows;
      float hi = smoothstep(pivot, 1.0, l) * uSplitHighlights;
      c += (vec3(-0.035, 0.0, 0.05) * sh + vec3(0.045, 0.012, -0.04) * hi) * (1.0 - l * 0.5);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), src.a);
    }`},bf=class{renderer;composer;bloom;speed;gradeHDR;gradeLDR;smaa;enabled=!0;bloomScale=1;lookBloom=.6;constructor(e,t,n){this.renderer=e;let r=e.getDrawingBufferSize(new B),i=new Bt(r.x,r.y,{type:g,samples:0});this.composer=new sf(e,i),this.composer.addPass(new cf(t,n)),this.bloom=new uf(new B(r.x,r.y),.55,.5,1.2);let a=this.bloom.materialHighPassFilter;a.fragmentShader=a.fragmentShader.replace(`vec4 texel = texture2D( tDiffuse, vUv );`,`vec4 texel = texture2D( tDiffuse, vUv );
			if ( any( isnan( texel ) ) || any( isinf( texel ) ) ) texel = vec4( 0.0 );
			texel = min( texel, vec4( 4096.0 ) );`),a.needsUpdate=!0,this.composer.addPass(this.bloom),this.speed=new rf(_f),this.composer.addPass(this.speed),this.gradeHDR=new rf(vf),this.composer.addPass(this.gradeHDR),this.composer.addPass(new ff),this.gradeLDR=new rf(yf),this.composer.addPass(this.gradeLDR),this.smaa=new gf,this.composer.addPass(this.smaa)}setLook(e){this.lookBloom=e.bloomStrength,this.bloom.strength=e.bloomStrength*this.bloomScale,this.bloom.threshold=e.bloomThreshold/Math.max(.05,e.exposure),this.speed.uniforms.uVignette.value=e.vignette;let t=this.gradeHDR.uniforms;t.uContrast.value=e.contrast,t.uSaturation.value=e.saturation,t.uVibrance.value=e.vibrance;let n=this.gradeLDR.uniforms;n.uLift.value.fromArray(e.lift),n.uGamma.value.fromArray(e.gamma),n.uGain.value.fromArray(e.gain),n.uSplitShadows.value=e.splitShadows,n.uSplitHighlights.value=e.splitHighlights,n.uSplitBalance.value=e.splitBalance}setQuality(e){this.enabled=e!==`low`,this.bloom.enabled=e!==`low`,this.smaa.enabled=e===`high`||e===`ultra`}setSpeed(e){this.speed.uniforms.uAmount.value=e}setBloom(e){this.bloomScale=e,this.bloom.strength=this.lookBloom*e}setSize(e,t){this.composer.setSize(e,t)}render(e,t,n){this.enabled?this.composer.render(n):this.renderer.render(e,t)}},xf=null;function Sf(){if(xf)return xf;let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);return n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.35,`rgba(220,240,255,0.55)`),n.addColorStop(1,`rgba(200,230,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),xf=new Xi(e),xf}var Cf=28,wf=class e{mesh;pos=new Float32Array(174);geo=new Dr;shoot=1;linger=0;active=!1;from=new V;to=new V;lingerFrom=new V;_a=new V;_b=new V;_s=new V;_view=new V;t=0;width=.016;static viewportH=720;puff;puffT=1;constructor(e,t=new U(.9,.94,1)){this.geo.setAttribute(`position`,new gr(this.pos,3));let n=[];for(let e=0;e<Cf;e++){let t=e*2;n.push(t,t+1,t+2,t+1,t+3,t+2)}this.geo.setIndex(n);let r=new fr({color:t,side:2,transparent:!0,opacity:.9,depthWrite:!1});this.mesh=new zr(this.geo,r),this.mesh.frustumCulled=!1,this.mesh.renderOrder=2,e.add(this.mesh);let i=new fr({map:Sf(),color:new U(1.4,1.5,1.6),transparent:!0,depthWrite:!1,blending:2});this.puff=new zr(new ia(1,1),i),this.puff.visible=!1,this.puff.renderOrder=3,e.add(this.puff)}fire(){this.shoot=0,this.linger=0}release(){this.active&&(this.linger=.28,this.lingerFrom.copy(this.from))}update(t,n,r,i,a,o){if(this.t+=t,r){this.active||this.fire(),this.active=!0,this.from.copy(r),this.to.copy(i);let e=this.shoot;this.shoot=Math.min(1,this.shoot+t*450/Math.max(8,r.distanceTo(i))),e<1&&this.shoot>=1&&(this.puffT=0)}else{if(this.active&&this.release(),this.active=!1,this.linger-=t,this.linger<=0){this.mesh.visible=!1;return}this.from.lerp(this.to,t*6),this.from.y-=t*4}this.mesh.visible=!0;let s=this.from,c=this._b.copy(s).lerp(this.to,this.shoot),l=s.distanceTo(c),u=(1-a)*Math.min(3,l*.08)+(r?0:1.5),d=Math.min(.06,o/2e5)*Math.sin(this.t*90),f=n.position,p=this.width*(r?1:Math.max(.3,this.linger/.28)),m=n instanceof ti?n.fov:60,h=2*Math.tan(m*Math.PI/360)/e.viewportH;this.updatePuff(t,n);for(let e=0;e<=Cf;e++){let t=e/Cf,n=this._a.copy(s).lerp(c,t),r=4*t*(1-t);n.y-=u*r,n.x+=d*r;let i=this._s.subVectors(c,s).normalize(),a=this._view.subVectors(f,n).normalize(),o=n.distanceTo(f),l=Math.max(p*(.55+.45*(1-t)),o*h*.6),m=i.cross(a).normalize().multiplyScalar(l),g=e*6;this.pos[g]=n.x+m.x,this.pos[g+1]=n.y+m.y,this.pos[g+2]=n.z+m.z,this.pos[g+3]=n.x-m.x,this.pos[g+4]=n.y-m.y,this.pos[g+5]=n.z-m.z}this.geo.attributes.position.needsUpdate=!0}updatePuff(e,t){this.puffT+=e/.28;let n=this.puffT<1;if(this.puff.visible=n,!n)return;let r=this.puffT,i=.6+2.6*r;this.puff.position.copy(this.to),this.puff.quaternion.copy(t.quaternion),this.puff.scale.setScalar(i),this.puff.material.opacity=(1-r)*(1-r)}},Tf=220,Ef=26,Df=class{pts=new Float32Array(660);pos=new Float32Array(1320);col=new Float32Array(1320);geo=new Dr;mat;mesh;_d=new V;seed=1;strength=0;constructor(e){for(let e=0;e<Tf;e++)this.pts[e*3]=(this.rand()-.5)*Ef,this.pts[e*3+1]=(this.rand()-.5)*Ef,this.pts[e*3+2]=(this.rand()-.5)*Ef;this.geo.setAttribute(`position`,new gr(this.pos,3)),this.geo.setAttribute(`color`,new gr(this.col,3)),this.mat=new Ai({vertexColors:!0,transparent:!0,opacity:0,blending:2,depthWrite:!1,fog:!1}),this.mesh=new Hi(this.geo,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=4,e.add(this.mesh)}rand(){return this.seed=this.seed*16807%2147483647,this.seed/2147483647}update(e,t,n,r=50){let i=n.length(),a=Y(r*.7,r,i);if(this.strength+=(a-this.strength)*Math.min(1,e*4),this.mesh.visible=this.strength>.01,!this.mesh.visible)return;this.mat.opacity=this.strength*.55;let o=t.position,s=Ef/2,c=this._d.copy(n).multiplyScalar(1/Math.max(i,.001)),l=Math.min(4,i*.06);for(let e=0;e<Tf;e++){let t=e*3,n=this.pts[t],r=this.pts[t+1],i=this.pts[t+2];n=((n-o.x+s)%Ef+Ef)%Ef-s+o.x,r=((r-o.y+s)%Ef+Ef)%Ef-s+o.y,i=((i-o.z+s)%Ef+Ef)%Ef-s+o.z,this.pts[t]=n,this.pts[t+1]=r,this.pts[t+2]=i;let a=n-o.x,u=r-o.y,d=i-o.z,f=Math.sqrt(a*a+u*u+d*d),p=Y(2.5,5,f)*(1-Y(s*.7,s,f)),m=e*6;this.pos[m]=n,this.pos[m+1]=r,this.pos[m+2]=i,this.pos[m+3]=n-c.x*l,this.pos[m+4]=r-c.y*l,this.pos[m+5]=i-c.z*l,this.col[m]=this.col[m+1]=this.col[m+2]=p,this.col[m+3]=this.col[m+4]=this.col[m+5]=0}this.geo.attributes.position.needsUpdate=!0,this.geo.attributes.color.needsUpdate=!0}},Of=-2.4,kf=3300,Af=function(e){return e[e.Box=0]=`Box`,e[e.Setback=1]=`Setback`,e[e.Crown=2]=`Crown`,e[e.Spire=3]=`Spire`,e[e.Cylinder=4]=`Cylinder`,e[e.Taper=5]=`Taper`,e[e.Slab=6]=`Slab`,e[e.Count=7]=`Count`,e}({});function jf(e){let t=e.bounds,n=t.z0-48,r=t.x0-48,i=e=>r-450+38*Math.sin(e/230)+22*Math.sin(e/97+1.3),a=e=>n-780+55*Math.sin(e/260+.4)+25*Math.sin(e/83),o=e=>r-260-(a(0)-e)*.55,s=n-170,c=e=>t.x1+420+60*Math.sin(e/180)+Math.max(0,n-300-e)*.35;return{quayN:n,quayW:r,farW:i,farN:a,headZ:s,isLand(e,t){if(t>=n&&e>=r)return!0;if(e<i(t)){if(t>=n)return!0;let r=s-t;return r<0||e<i(s)-60-r*r*.004&&r<260}return t>=n?!1:e>c(t)||t<a(e)&&e>o(t)}}}function Mf(e,t,n){let r=Math.max(n.x0-e,0,e-n.x1),i=Math.max(n.z0-t,0,t-n.z1);return Math.hypot(r,i)}function Nf(e,t,n,r,i,a,o,s,c){let l=[];for(let r=0;r<=n;r++)l.push(e+(t-e)*r/n);let u=(e,t)=>{let n=e+t*r,l=i,u=[];for(;Math.abs(n-c)<s;)u.push(n),Math.abs(n-e)>a&&(l=o),n+=t*l;return u.push(n),u};return[...u(e,-1).reverse(),...l,...u(t,1)]}function Pf(e){let t=e.bounds,n=e.params,r=(t.x0+t.x1)/2,i=(t.z0+t.z1)/2,a=jf(e),o=new ll((n.seed^388823)>>>0),s=Nf(t.x0,t.x1,25,48,(n.blockSizeX+n.avenueWidth)/4,1500,(n.blockSizeX+n.avenueWidth)/2,kf,r),c=Nf(t.z0,t.z1,20,48,(n.blockSizeZ+n.streetWidth)/2,1500,n.blockSizeZ+n.streetWidth,kf,i),l=s.length-1,u=c.length-1,d=new Uint8Array(l*u),f=0,p=0;for(let e=0;e<u;e++)for(let n=0;n<l;n++){let r=(s[n]+s[n+1])/2,i=(c[e]+c[e+1])/2,o=0;r>t.x0&&r<t.x1&&i>t.z0&&i<t.z1?o=2:a.isLand(r,i)&&(o=1),d[n+e*l]=o,o===1?f++:o===0&&p++}let m=(e,t)=>{let n=Ff(s,e)-1,r=Ff(c,t)-1;return n<0||r<0||n>=l||r>=u?0:d[n+r*l]},h=Ff(c,a.quayN-1)-1;for(let e=0;e<l;e++){let n=(s[e]+s[e+1])/2;if(!(n<t.x0+40||n>t.x1+200)&&e%5==2)for(let t=h;t>h-2&&t>=0;t--)d[e+t*l]===0&&(d[e+t*l]=3)}let g=Ff(s,a.quayW-1)-1;for(let e=0;e<u;e++){let n=(c[e]+c[e+1])/2;if(!(n<t.z0+60||n>t.z1+400)&&e%5==1)for(let t=g;t>g-2&&t>=0;t--)d[t+e*l]===0&&(d[t+e*l]=3)}let _=n.blockSizeX+n.avenueWidth,v=n.blockSizeZ+n.streetWidth,y=t.x0+n.avenueWidth/2,b=t.z0+n.streetWidth/2,x=[{x:r+120,z:a.quayN-1250,r:520,w:1},{x:t.x1+1150,z:i-250,r:420,w:.75},{x:r-250,z:t.z1+1350,r:450,w:.6},{x:a.quayW-1050,z:i+350,r:380,w:.45},{x:t.x1+650,z:a.quayN-900,r:300,w:.5}],S=(e,t)=>{let n=0;for(let r of x){let i=Math.hypot(e-r.x,t-r.z)/r.r;n=Math.max(n,r.w*Math.exp(-i*i))}return n},C=(e,t,n,r)=>{for(let[i,a]of[[e,t],[n,t],[e,r],[n,r],[(e+n)/2,(t+r)/2]])if(m(i,a)!==1)return!1;return!0},w=[],T=0,E=Math.floor((r-kf-y)/_),D=Math.ceil((r+kf-y)/_),O=Math.floor((i-kf-b)/v),k=Math.ceil((i+kf-b)/v);for(let e=E;e<D;e++)for(let a=O;a<k;a++){if(e>=0&&e<n.blocksX&&a>=0&&a<n.blocksZ)continue;let s=o.fork((e+1e3)*7919+(a+1e3)*131),c=y+e*_+n.avenueWidth/2,l=c+n.blockSizeX,u=b+a*v+n.streetWidth/2,d=u+n.blockSizeZ,f=(c+l)/2,p=(u+d)/2,m=Math.hypot(f-r,p-i);if(m>3150)continue;let h=Mf(f,p,t),g=S(f,p),x=Y(1400,2200,m);if(s.chance(.07*(1-g)))continue;let E=n.sidewalkWidth,D=c+E,O=l-E,k=u+E,A=d-E,j=x>.5?s.int(1,2):s.int(2,4),M=x>.5||s.chance(.35)?1:2;for(let e=0;e<M;e++){let t=J(k,A,e/M),n=J(k,A,(e+1)/M),r=D;for(let i=0;i<j;i++){let a=i===j-1?O-r:(O-D)/j*s.range(.75,1.25),o=Math.min(O,r+a),c=s.range(.5,3),l=r+(i>0?c:0),u=o,d=t+(e>0?c:0),f=n;if(r=o,u-l<8||!C(l,d,u,f))continue;let p=1-Y(60,320,h),m=J(20,40,s.next())*Math.exp(.35*s.gauss());m=J(m,s.range(9,22),p),m*=J(1,1.5,g);let _=s.chance(.08)&&m>25?6:0,v=g*.85+(1-p)*.035,y=u-l,b=f-d,x=(l+u)/2,S=(d+f)/2;if(p<.3&&s.chance(v)){T++;let e=s.next()**+J(2.2,.9,g);m=J(75,J(170,440,g),e),_=m>300&&s.chance(.5)?5:m>200?s.pick([3,2,1,5,4]):s.pick([1,1,0,2,4,6]);let t=Math.min(y,b,J(28,52,s.next()));y=Math.min(y,t*s.range(1,1.35)),b=Math.min(b,t),(_===4||_===5)&&(y=b=Math.min(y,b))}else _===6&&(b=Math.min(b,s.range(12,18)),S=s.chance(.5)?d+b/2:f-b/2);m=q(m,7,460);let E=m>90?s.chance(.62)?1:2:s.chance(.58)?0:s.chance(.5)?2:1;w.push({x,z:S,w:y,d:b,h:m,rot:_===4?s.range(0,Math.PI):0,variant:_,style:E,hue:E===1?s.range(.5,.6):s.pick([.03,.06,.08,.1,.12,.58])+s.range(-.02,.02),sat:E===1?s.range(.12,.3):s.range(.06,.3),light:E===1?s.range(.16,.3):s.range(.3,.6),lit:s.range(.2,.65),floorH:3.6*s.range(.92,1.12),seed:s.next()*1e3,crownLight:m>150&&s.chance(.4)?s.chance(.2)?2:1:0})}}}let A=a.farW(a.headZ)-150,j=a.headZ+40,M=a.farN(A+250),N={ax:A,az:j,bx:A+330,bz:M-150,towerT:[.22,.78],deckY:32,towerH:150,width:26},ee=[];for(let e=t.x0-30;e<=t.x1+150;e+=24)ee.push(e,a.quayN+3);for(let e=a.quayN+20;e<=t.z1+300;e+=24)ee.push(a.quayW+3,e);let P=new Float32Array(2048),F=(e,t,n,a,o)=>{let s=e-r,c=t-i,l=Math.hypot(s,c);if(l<1)return;let u=Math.atan2(c,s),d=Math.atan(n/l),f=Math.floor((u-d+Math.PI)/(2*Math.PI)*512),p=Math.floor((u+d+Math.PI)/(2*Math.PI)*512),m=Math.atan2(a,l);for(let e=f;e<=p;e++){let t=(e%512+512)%512*4;m>(P[t]>0?Math.atan2(P[t],P[t+1]):-1)&&(P[t]=a,P[t+1]=l),P[t+2]+=o/Math.max(1,p-f+1),P[t+3]=Math.max(P[t+3],l)}};for(let e of w)Mf(e.x,e.z,t)<250||F(e.x,e.z,Math.max(e.w,e.d)/2,e.h,e.lit*e.h*Math.max(e.w,e.d)*5e-4);for(let e of N.towerT)F(J(N.ax,N.bx,e),J(N.az,N.bz,e),6,N.towerH,.2);let te=1e-6;for(let e=0;e<512;e++)te=Math.max(te,P[e*4+2]);for(let e=0;e<512;e++)P[e*4+2]=Math.min(1,P[e*4+2]/te*1.6);return{bounds:{...t},centre:{x:r,z:i},xs:s,zs:c,cells:d,buildings:w,bridge:N,lamps:ee,quayN:a.quayN,quayW:a.quayW,pano:P,stats:{cells:l*u,land:f,water:p,buildings:w.length,towers:T}}}function Ff(e,t){let n=0,r=e.length;for(;n<r;){let i=n+r>>1;e[i]<=t?n=i+1:r=i}return n}var If={uAtmo:ld,hSunDir:{value:new V(0,1,0)},hSunColor:{value:new U},hHemiSky:{value:new U},hHemiGround:{value:new U},hAmbUp:{value:new U},hAmbPX:{value:new U},hAmbNX:{value:new U},hAmbPZ:{value:new U},hAmbNZ:{value:new U},hNight:Id.uNight,hDark:{value:0},hTime:{value:0}},Lf=`
${ud}
uniform vec3 hSunDir;
uniform vec3 hSunColor;
uniform vec3 hHemiSky;
uniform vec3 hHemiGround;
uniform vec3 hAmbUp;
uniform vec3 hAmbPX;
uniform vec3 hAmbNX;
uniform vec3 hAmbPZ;
uniform vec3 hAmbNZ;
uniform float hNight;
uniform float hDark;
uniform float hTime;

// Sky radiance in a direction (the dome's, minus the sun disc).
vec3 hSky(vec3 dir) {
  vec3 d = normalize(dir);
  return strandSkyBase(d) + uAtmo[4].rgb * strandHG(dot(d, uAtmo[0].xyz), uAtmo[4].w);
}

// Cosine-weighted sky light for a surface normal (precomputed per direction on the CPU).
vec3 hAmbient(vec3 n) {
  vec3 w = n * n;
  vec3 side = (n.x > 0.0 ? hAmbPX : hAmbNX) * w.x + (n.z > 0.0 ? hAmbPZ : hAmbNZ) * w.z;
  vec3 vert = n.y > 0.0 ? hAmbUp : mix(hHemiGround * 0.25, hAmbUp * 0.3, 0.5);
  return side + vert * w.y;
}

// Integer hash: stable at world scale.
float hHash(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p))) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) * (1.0 / 4294967295.0);
}
float hNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hHash(i), hHash(i + vec2(1, 0)), u.x), mix(hHash(i + vec2(0, 1)), hHash(i + vec2(1, 1)), u.x), u.y);
}

// Atmospheric perspective for a point at camera-relative 'rel': the district's own height and
// aerial fog, plus a guaranteed full fade before the far plane (view depth 3000).
float hFogAmount(vec3 rel, float viewDepth) {
  return max(strandFogAmount(rel, cameraPosition.y), smoothstep(2250.0, 2940.0, viewDepth));
}
vec3 hAtmosColor(vec3 dir) {
  return strandFogColor(dir);
}
`;function Rf(e,t){let n=cd,r=n[0],i=n[2],a=(1-Math.max(e.y,0))**n[7],o=Math.hypot(e.x,e.z)||1,s=Math.hypot(r,i)||1,c=((e.x/o*(r/s)+e.z/o*(i/s))*.5+.5)**n[11],l=e.x*n[0]+e.y*n[1]+e.z*n[2],u=(e=>(1-e*e)/(12.5663706*Math.max(1+e*e-2*e*l,1e-4)**1.5))(n[23])*(.3+.7*a),d=e=>{let t=n[8+e]+(n[12+e]-n[8+e])*c;return n[4+e]+(t-n[4+e])*a+n[20+e]*u};return t.setRGB(d(0),d(1),d(2))}var zf=new V,Bf=new U;function Vf(e,t){t.setRGB(0,0,0);let n=0;for(let r=0;r<24;r++){let i=r/24*Math.PI*2;for(let r of[.06,.35,.75,1.25]){zf.set(Math.cos(i)*Math.cos(r),Math.sin(r),Math.sin(i)*Math.cos(r));let a=Math.max(0,zf.dot(e))*Math.cos(r);a<=0||(Rf(zf,Bf),t.r+=Bf.r*a,t.g+=Bf.g*a,t.b+=Bf.b*a,n+=a)}}let r=e.y>=0?.5+.5*e.y:.5*(1+e.y);return t.multiplyScalar(r/Math.max(1e-6,n))}var Hf=[[`hAmbUp`,new V(0,1,0)],[`hAmbPX`,new V(1,0,0)],[`hAmbNX`,new V(-1,0,0)],[`hAmbPZ`,new V(0,0,1)],[`hAmbNZ`,new V(0,0,-1)]],Uf=``;function Wf(e,t){let n=If;n.hTime.value+=t,n.hSunDir.value.copy(e.shadows.dir),n.hSunColor.value.copy(e.sun.color).multiplyScalar(e.sun.intensity),n.hHemiSky.value.copy(e.hemi.color).multiplyScalar(e.hemi.intensity),n.hHemiGround.value.copy(e.hemi.groundColor).multiplyScalar(e.hemi.intensity);let r=Math.asin(q(e.sunDir.y,-1,1))*(180/Math.PI);n.hDark.value=1-Y(-5,6,r);let i=e.timeOfDay.toFixed(4);if(i!==Uf){Uf=i;for(let[e,t]of Hf)Vf(t,n[e].value)}}var Gf=class{pos=[];nor=[];quad(e,t,n,r){let i=t[0]-e[0],a=t[1]-e[1],o=t[2]-e[2],s=r[0]-e[0],c=r[1]-e[1],l=r[2]-e[2],u=a*l-o*c,d=o*s-i*l,f=i*c-a*s,p=Math.hypot(u,d,f)||1;u/=p,d/=p,f/=p;for(let i of[e,t,n,e,n,r])this.pos.push(i[0],i[1],i[2]),this.nor.push(u,d,f)}prism(e,t,n,r,i,a=!0,o=Math.PI/4){let s=e===4?Math.SQRT2:1/Math.cos(Math.PI/e),c=(t,n,r)=>{let i=o+t/e*Math.PI*2;return[Math.cos(i)*r*s,n,Math.sin(i)*r*s]};for(let a=0;a<e;a++){let e=c(a,t,r),o=c(a+1,t,r),s=c(a+1,n,i),l=c(a,n,i);this.quad(o,e,l,s)}if(a&&i>0){let t=[0,n,0];for(let r=0;r<e;r++){let e=c(r,n,i),a=c(r+1,n,i);this.pos.push(...t,...a,...e);for(let e=0;e<3;e++)this.nor.push(0,1,0)}}}box(e,t,n){this.prism(4,e,t,n,n)}build(){let e=new Dr;return e.setAttribute(`position`,new yr(this.pos,3)),e.setAttribute(`normal`,new yr(this.nor,3)),e}};function Kf(e){let t=new Gf;switch(e){case Af.Box:case Af.Slab:t.box(0,.965,.5),t.box(.965,1,.16);break;case Af.Setback:t.box(0,.56,.5),t.box(.56,.8,.39),t.box(.8,.975,.28),t.box(.975,1,.12);break;case Af.Crown:t.box(0,.82,.5),t.box(.82,.86,.47),t.box(.86,.9,.4),t.box(.9,.935,.31),t.box(.935,.965,.21),t.prism(4,.965,1,.11,0,!1);break;case Af.Spire:t.box(0,.48,.5),t.box(.48,.66,.4),t.box(.66,.8,.3),t.prism(4,.8,.84,.3,.2),t.prism(8,.84,1,.035,.004);break;case Af.Cylinder:t.prism(8,0,.93,.5,.5,!0,Math.PI/8),t.prism(8,.93,.975,.4,.4,!0,Math.PI/8),t.prism(8,.975,1,.4,.12,!1,Math.PI/8);break;case Af.Taper:t.prism(4,0,.9,.5,.33),t.prism(4,.9,.955,.3,.24),t.prism(4,.955,1,.16,.02,!1);break;default:t.box(0,1,.5)}return t.build()}var qf=`
attribute vec4 aP0; // seed, litFraction, style, floorH
attribute vec4 aP1; // height (m), crownLight, 0, 0
varying vec3 vWPos;
varying vec3 vWN;
varying vec3 vLP;
varying vec3 vLN;
varying float vDepth;
flat varying vec4 vP0;
flat varying vec4 vP1;
flat varying vec3 vCol;
void main() {
  vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  vLP = position * sc;
  vLN = normalize(normal / sc);
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWPos = wp.xyz;
  vWN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * (normal / (sc * sc)));
  vP0 = aP0;
  vP1 = aP1;
  vCol = instanceColor;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`,Jf=`
${Lf}
varying vec3 vWPos;
varying vec3 vWN;
varying vec3 vLP;
varying vec3 vLN;
varying float vDepth;
flat varying vec4 vP0;
flat varying vec4 vP1;
flat varying vec3 vCol;

float aaBox(vec2 f, vec2 c, vec2 h, vec2 w) {
  vec2 d = abs(f - c) - h;
  vec2 m = 1.0 - smoothstep(-w, w, d);
  return m.x * m.y;
}

void main() {
  vec3 N = normalize(vWN);
  vec3 toCam = cameraPosition - vWPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  float seed = vP0.x, lit = vP0.y, style = vP0.z, floorH = vP0.w;
  float height = vP1.x;
  vec3 base = vCol;
  vec3 albedo;
  vec3 emit = vec3(0.0);
  float glassAmt = 0.0;
  float v = vLP.y;

  if (abs(vLN.y) < 0.6) {
    // --- facade: window grid in building-local metres ---
    vec2 t = normalize(vec2(-vLN.z, vLN.x));
    float u = dot(vLP.xz, t);
    float face = floor(atan(vLN.z, vLN.x) * 1.27 + 4.5);
    float cw = style < 0.5 ? 3.1 : style < 1.5 ? 1.6 : 2.8;
    vec2 cell = vec2(u / cw, v / floorH);
    vec2 id = floor(cell);
    vec2 f = fract(cell);
    vec2 fw = fwidth(cell);
    vec2 hs = style < 0.5 ? vec2(0.24, 0.27) : style < 1.5 ? vec2(0.44, 0.4) : vec2(0.5, 0.2);
    float mask = aaBox(f, vec2(0.5, 0.55), hs, fw * 1.2 + 1e-4);
    float far = smoothstep(0.12, 0.4, max(fw.x, fw.y));
    mask = mix(mask, 4.0 * hs.x * hs.y, far);
    float r1 = hHash(id + vec2(seed, face * 97.0));
    // coarse clusters (office floors, apartments) keep a patchwork even when windows are sub-pixel
    vec2 cid = floor(id / vec2(6.0, 3.0));
    float r2 = hHash(cid + vec2(seed * 1.7 + 13.0, face * 31.0));
    float litLocal = clamp(lit * (0.2 + 1.6 * r2 * r2), 0.0, 1.0);
    float on = mix(step(r1, litLocal), litLocal, far);
    float grime = hNoise(vLP.xy * 0.08 + vLP.zy * 0.08 + seed) * 0.16;
    vec3 wall = base * (0.84 + grime) * mix(0.6, 1.0, smoothstep(0.0, 18.0, v));
    // slab edges on curtain walls
    if (style > 0.5 && style < 1.5) wall = mix(wall, base * 0.55, (1.0 - smoothstep(0.0, 0.09, abs(f.y - 0.04) - fw.y)) * (1.0 - far));
    vec3 glass = mix(vec3(0.045, 0.055, 0.07), vec3(0.07, 0.085, 0.1), mix(r1, 0.5, far));
    albedo = mix(wall, glass, mask);
    glassAmt = mask;
    // interiors: warm tungsten, a few cool offices; brighter at street level
    vec3 warm = mix(vec3(1.0, 0.7, 0.4), vec3(0.72, 0.84, 1.0), step(0.8, hHash(id * 3.0 + vec2(seed + 7.0, 11.0))));
    float inten = mix(mix(0.45, 1.5, hHash(id + vec2(seed * 2.0 + 3.0, 5.0))), 1.0, far);
    // same curve as the district's windows: dark by day, lit rooms reading as points at night
    // once windows are sub-pixel their average must stay dim, or whole towers glow beige
    emit = warm * inten * on * mask * (hNight * hNight * 0.9) * mix(1.0, 0.3, far);
    // floodlit crowns at night
    if (vP1.y > 0.5) {
      float top = smoothstep(height * 0.84, height * 0.95, v);
      vec3 cc = vP1.y > 1.5 ? vec3(0.25, 0.88, 0.94) : vec3(1.0, 0.8, 0.55);
      emit += cc * top * hNight * 0.9 * (0.55 + 0.45 * (1.0 - mask));
    }
  } else if (vLN.y > 0.0) {
    // roofs: tar and gravel
    albedo = mix(vec3(0.13, 0.13, 0.14), base * 0.5, 0.3) * (0.8 + 0.4 * hNoise(vWPos.xz * 0.2));
  } else {
    albedo = base * 0.3;
  }

  // --- lighting: live sun + cosine-weighted sky + hemisphere ---
  float ndl = max(dot(N, hSunDir), 0.0);
  vec3 irr = hSunColor * ndl + mix(hHemiGround, hHemiSky, 0.5 * N.y + 0.5);
  vec3 col = albedo * (irr * 0.31830988 + hAmbient(N) * 0.9);
  // glass reflects the sky (Fresnel) and catches the sun
  if (glassAmt > 0.0) {
    vec3 R = reflect(-V, N);
    float F = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
    vec3 refl = hSky(normalize(vec3(R.x, max(R.y, 0.02), R.z)));
    float sunSpec = pow(max(dot(R, hSunDir), 0.0), 350.0) * 40.0;
    col += glassAmt * (refl * F * 0.9 + hSunColor * sunSpec * F);
  }

  // --- atmosphere ---
  float fog = hFogAmount(-V * dist, vDepth);
  vec3 atm = hAtmosColor(-V);
  col = mix(col, atm, fog) + emit * pow(1.0 - fog, 0.7 + 0.8 * (1.0 - hNight));
  gl_FragColor = vec4(col, 1.0);
}`;function Yf(){return new Xr({name:`HorizonSkyline`,uniforms:If,vertexShader:qf,fragmentShader:Jf})}var Xf=`
attribute float aPhase;
uniform float hTime;
uniform float hNight;
uniform float uPixelRatio;
varying float vI;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float d = -mv.z;
  float blink = step(0.55, fract(hTime * 0.8 + aPhase));
  vI = blink * (0.25 + hNight) * (1.0 - smoothstep(2300.0, 2900.0, d));
  gl_PointSize = uPixelRatio * mix(3.5, 2.2, smoothstep(500.0, 2500.0, d));
  gl_Position = projectionMatrix * mv;
}`,Zf=`
varying float vI;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = 1.0 - smoothstep(0.15, 0.5, length(c));
  if (vI * a < 0.01) discard;
  gl_FragColor = vec4(vec3(4.0, 0.35, 0.2) * vI * a, 1.0);
}`,Qf=new _n,$f=new mt,ep=new V,tp=new V,np=new V(0,1,0),rp=class{group=new si;material=Yf();lightMat;instances=0;drawCalls=0;constructor(e){let t=Array.from({length:Af.Count},()=>[]);for(let n of e.buildings)t[n.variant].push(n);let n=new U;t.forEach((e,t)=>{if(!e.length)return;let r=Kf(t),i=e.length,a=new xi(r,this.material,i),o=new Float32Array(i*4),s=new Float32Array(i*4),c=new Float32Array(i*3);e.forEach((e,t)=>{$f.setFromAxisAngle(np,e.rot),Qf.compose(ep.set(e.x,0,e.z),$f,tp.set(e.w,e.h,e.d)),a.setMatrixAt(t,Qf),n.setHSL(e.hue,e.sat,e.light),c.set([n.r,n.g,n.b],t*3),o.set([e.seed,e.lit,e.style,e.floorH],t*4),s.set([e.h,e.crownLight,0,0],t*4)}),a.instanceColor=new pi(c,3),r.setAttribute(`aP0`,new pi(o,4)),r.setAttribute(`aP1`,new pi(s,4)),a.castShadow=!1,a.receiveShadow=!1,a.frustumCulled=!1,a.renderOrder=2,a.name=`skyline-${t}`,this.group.add(a),this.instances+=i,this.drawCalls++});let r=[],i=[];for(let t of e.buildings)t.h<170||(r.push(t.x,t.h+(t.variant===Af.Spire?0:1.5),t.z),i.push(t.seed%1*.3));if(this.lightMat=new Xr({uniforms:{hTime:If.hTime,hNight:If.hNight,uPixelRatio:{value:1}},vertexShader:Xf,fragmentShader:Zf}),r.length){let e=new Dr;e.setAttribute(`position`,new yr(r,3)),e.setAttribute(`aPhase`,new yr(i,1));let t=new Ji(e,this.lightMat);t.frustumCulled=!1,t.renderOrder=3,this.group.add(t),this.drawCalls++}}setPixelRatio(e){this.lightMat.uniforms.uPixelRatio.value=e}},ip=class{group=new si;mesh;drawCalls=0;constructor(e,t){let{xs:n,zs:r,cells:i}=e,a=n.length-1,o=r.length-1,s=[],c=[],l=[],u=new Int32Array((a+1)*(o+1)).fill(-1),d=(e,t)=>{let i=e+t*(a+1);return u[i]<0&&(u[i]=s.length/3,s.push(n[e],0,r[t]),c.push(0,1,0)),u[i]},f=(e,t)=>{if(e<0||t<0||e>=a||t>=o)return!1;let n=i[e+t*a];return n===1||n===3},p=(e,t)=>e>=0&&t>=0&&e<a&&t<o&&i[e+t*a]===0;for(let e=0;e<o;e++)for(let t=0;t<a;t++){if(!f(t,e))continue;let n=d(t,e),r=d(t+1,e),i=d(t+1,e+1),a=d(t,e+1);l.push(n,a,i,n,i,r)}let m=(e,t,n,r,i)=>{let a=s.length/3,o=Of-1.5;s.push(e,0,t,n,0,r,n,o,r,e,o,t);for(let e=0;e<4;e++)c.push(i[0],0,i[1]);(n-e)*i[1]-(r-t)*i[0]<0?l.push(a,a+1,a+2,a,a+2,a+3):l.push(a,a+2,a+1,a,a+3,a+2)};for(let e=0;e<o;e++)for(let t=0;t<a;t++)f(t,e)&&(p(t-1,e)&&m(n[t],r[e],n[t],r[e+1],[-1,0]),p(t+1,e)&&m(n[t+1],r[e],n[t+1],r[e+1],[1,0]),p(t,e-1)&&m(n[t],r[e],n[t+1],r[e],[0,-1]),p(t,e+1)&&m(n[t],r[e+1],n[t+1],r[e+1],[0,1]));let h=new Dr;h.setAttribute(`position`,new yr(s,3)),h.setAttribute(`normal`,new yr(c,3)),h.setIndex(new vr(l,1)),h.computeBoundingSphere(),this.mesh=new zr(h,ap(e,t)),this.mesh.receiveShadow=!0,this.mesh.frustumCulled=!1,this.mesh.renderOrder=1,this.mesh.name=`horizon-ground`,this.group.add(this.mesh),this.drawCalls++,this.buildPromenade(e)}buildPromenade(e){let t=e.lamps,n=t.length/2,r=new _n,i=new mt,a=new V,o=new V,s=new ea(.07,.11,1,6);s.translate(0,.5,0);let c=new xi(s,new oa({color:2303787,roughness:.5,metalness:.6}),n),l=new xi(new ra(.32,1),new oa({color:3355443,emissive:new U(1,.82,.58),emissiveIntensity:2.4}),n);for(let e=0;e<n;e++)r.compose(a.set(t[e*2],0,t[e*2+1]),i,o.set(1,5.6,1)),c.setMatrixAt(e,r),r.compose(a.set(t[e*2],5.75,t[e*2+1]),i,o.set(1,.8,1)),l.setMatrixAt(e,r);for(let e of[c,l])e.castShadow=e===c,e.receiveShadow=!1,e.computeBoundingSphere(),this.group.add(e),this.drawCalls++;let u=[];for(let e=0;e<n-1;e++){let n=(t[e*2]+t[e*2+2])/2,r=(t[e*2+1]+t[e*2+3])/2;if(Math.hypot(t[e*2+2]-t[e*2],t[e*2+3]-t[e*2+1])>30)continue;let i=Math.abs(t[e*2+3]-t[e*2+1])<1;u.push(i?n:n+9,i?r+9:r)}let d=u.length/2,f=new ea(.12,.18,1,6);f.translate(0,.5,0);let p=new xi(f,new oa({color:4863527,roughness:.9}),d),m=new xi(new ra(1,1),new oa({color:4020778,roughness:.95,flatShading:!0}),d),h=new U;for(let e=0;e<d;e++){let t=u[e*2],n=u[e*2+1],s=5.5+e*7919%13/13*2.5;r.compose(a.set(t,0,n),i,o.set(1,s*.55,1)),p.setMatrixAt(e,r),r.compose(a.set(t,s*.72,n),i,o.set(s*.3,s*.27,s*.3)),m.setMatrixAt(e,r),h.setHSL(.24+e*31%7*.008,.42,.2+e*17%5*.012),m.setColorAt(e,h)}for(let e of[p,m])e.castShadow=!0,e.receiveShadow=!0,e.computeBoundingSphere(),this.group.add(e),this.drawCalls++}};function ap(e,t){let n=t.params,r=t.bounds,i=new oa({color:16777215,roughness:.9,metalness:0});i.fog=!1,i.polygonOffset=!0,i.polygonOffsetFactor=1,i.polygonOffsetUnits=2;let a=new Rt(r.x0+n.avenueWidth/2,r.z0+n.streetWidth/2,n.blockSizeX+n.avenueWidth,n.blockSizeZ+n.streetWidth),o=new Rt(n.avenueWidth,n.streetWidth,n.sidewalkWidth,0),s=new Rt(r.x0,r.z0,r.x1,r.z1),c=new Rt(e.quayN,e.quayW,17,0);return i.onBeforeCompile=e=>{Object.assign(e.uniforms,If),e.uniforms.uGrid={value:a},e.uniforms.uRoads={value:o},e.uniforms.uDistrict={value:s},e.uniforms.uQuays={value:c},e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vGW;
varying vec3 vGN;`).replace(`#include <project_vertex>`,`#include <project_vertex>
vGW = (modelMatrix * vec4(transformed, 1.0)).xyz;
vGN = normalize(mat3(modelMatrix) * objectNormal);`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
${Lf}
varying vec3 vGW;
varying vec3 vGN;
uniform vec4 uGrid;     // avenue x0, street z0, pitch x, pitch z
uniform vec4 uRoads;    // avenue width, street width, sidewalk width
uniform vec4 uDistrict; // x0 z0 x1 z1
uniform vec4 uQuays;    // north quay z, west quay x, drive width
float gRoughH; vec3 gEmitH;
// 1 inside a band of half-width h around 0, anti-aliased by w
float band(float d, float h, float w) { return 1.0 - smoothstep(h - w, h + w, d); }`).replace(`#include <color_fragment>`,`#include <color_fragment>
{
  vec2 P = vGW.xz;
  vec2 fw = fwidth(P) + 1e-4;
  float fwm = max(fw.x, fw.y);
  gRoughH = 0.92; gEmitH = vec3(0.0);
  vec3 N = normalize(vGN);
  float n1 = hNoise(P * 0.7), n2 = hNoise(P * 5.3);
  vec3 asphalt = vec3(0.105, 0.105, 0.11) * (0.8 + 0.3 * n1 + 0.14 * n2);
  vec3 walk = vec3(0.19, 0.178, 0.155) * (0.88 + 0.2 * n1);
  vec3 col;
  if (N.y < 0.5) {
    // quay wall: stone courses, wet dark band at the waterline, algae below
    float y = vGW.y;
    float course = fract(y / 0.6);
    float joint = 1.0 - smoothstep(0.0, 0.1, min(course, 1.0 - course)) * (1.0 - smoothstep(0.3, 1.0, fwidth(y / 0.6)));
    vec3 stone = vec3(0.3, 0.28, 0.25) * (0.75 + 0.35 * hNoise(vec2(dot(P, vec2(0.7, 0.7)) * 0.9, y * 2.0)));
    stone *= 1.0 - 0.35 * joint;
    float wet = 1.0 - smoothstep(${(Of-.1).toFixed(2)}, ${(Of+1.1).toFixed(2)}, y);
    stone = mix(stone, vec3(0.06, 0.075, 0.06), wet * 0.85);
    col = stone;
    gRoughH = mix(0.85, 0.35, wet);
  } else {
    float dNorth = uDistrict.y - P.y;           // metres north of the district
    float dWest = uDistrict.x - P.x;            // metres west of the district
    bool promN = P.y >= uQuays.x && dNorth > 0.0 && P.x > uQuays.y;
    bool promW = P.x >= uQuays.y && dWest > 0.0 && P.y > uQuays.x;
    bool pier = (P.y < uQuays.x && P.y > uQuays.x - 110.0 && P.x > uQuays.y - 20.0 && P.x < uDistrict.z + 260.0) ||
                (P.x < uQuays.y && P.x > uQuays.y - 110.0 && P.y > uQuays.x - 20.0);
    if (pier) {
      // timber deck on concrete
      float plank = fract((abs(P.x - uQuays.y) < 110.0 && P.y > uQuays.x ? P.y : P.x) / 0.9);
      float seam = (1.0 - smoothstep(0.0, 0.08, min(plank, 1.0 - plank))) * (1.0 - smoothstep(0.1, 0.6, fwm));
      col = vec3(0.23, 0.19, 0.15) * (0.8 + 0.35 * hNoise(P * vec2(0.3, 3.0))) * (1.0 - 0.4 * seam);
      gRoughH = 0.8;
    } else if (promN || promW) {
      // waterfront drive next to the district, then a paved promenade to the quay edge
      float dEdge = promN ? dNorth : dWest;         // from the district edge
      float dQuay = promN ? P.y - uQuays.x : P.x - uQuays.y;
      float along = promN ? P.x : P.y;
      float fwa = promN ? fw.y : fw.x;
      if (dEdge < uQuays.z) {
        col = asphalt;
        float cl = band(abs(abs(dEdge - uQuays.z * 0.5) - 0.18), 0.08, fwa);
        float dash = step(0.5, fract(along / 9.0));
        float lanes = band(abs(abs(dEdge - uQuays.z * 0.5) - uQuays.z * 0.25), 0.07, fwa) * dash;
        col = mix(col, vec3(0.8, 0.62, 0.12), cl);
        col = mix(col, vec3(0.8), lanes);
        gRoughH = 0.9;
      } else if (dEdge < uQuays.z + uRoads.z) {
        col = walk;
      } else {
        // stone paving with a joint grid, a grass strip, and a granite kerb along the water
        vec2 q = vec2(along, dQuay) / 1.5;
        vec2 fq = abs(fract(q) - 0.5);
        float joints = (1.0 - smoothstep(0.43, 0.49, max(fq.x, fq.y))) ;
        joints = mix(joints, 0.85, smoothstep(0.1, 0.5, fwm / 1.5));
        vec3 pave = vec3(0.3, 0.27, 0.23) * (0.85 + 0.25 * hNoise(floor(q) * 0.37)) * mix(0.8, 1.0, joints);
        float grass = band(abs(dQuay - 12.0), 2.6, fwa);
        pave = mix(pave, vec3(0.07, 0.11, 0.045) * (0.8 + 0.4 * n2), grass);
        float kerb = band(dQuay, 0.9, fwa);
        col = mix(pave, vec3(0.36, 0.35, 0.33), kerb);
        gRoughH = mix(0.8, 0.95, grass);
      }
    } else {
      // the street grid carries on beyond the district
      float dA = abs(mod(P.x - uGrid.x + uGrid.z * 0.5, uGrid.z) - uGrid.z * 0.5);
      float dS = abs(mod(P.y - uGrid.y + uGrid.w * 0.5, uGrid.w) - uGrid.w * 0.5);
      float hA = uRoads.x * 0.5, hS = uRoads.y * 0.5;
      float road = max(band(dA, hA, fw.x), band(dS, hS, fw.y));
      float side = max(band(dA, hA + uRoads.z, fw.x), band(dS, hS + uRoads.z, fw.y));
      vec2 blockId = floor((P - uGrid.xy + uGrid.zw * 0.5) / uGrid.zw);
      float bh = hHash(blockId + 71.0);
      // block interiors (mostly under buildings): courtyards, parking, a few small parks
      vec3 inner = bh < 0.18 ? vec3(0.06, 0.1, 0.04) * (0.8 + 0.4 * n1) : vec3(0.15, 0.145, 0.14) * (0.8 + 0.3 * n2);
      col = mix(inner, walk, side);
      col = mix(col, asphalt, road);
      // markings: double yellow on avenues, dashed lanes, crossings
      float onA = band(dA, hA, fw.x) * (1.0 - band(dS, hS, fw.y));
      float onS = band(dS, hS, fw.y) * (1.0 - band(dA, hA, fw.x));
      float yl = max(band(abs(dA - 0.18), 0.08, fw.x) * onA, band(abs(dS - 0.15), 0.08, fw.y) * onS);
      float lane = band(abs(dA - uRoads.x * 0.25), 0.07, fw.x) * step(0.55, fract(P.y / 9.0)) * onA;
      float fadeM = 1.0 - smoothstep(0.08, 0.6, fwm);
      col = mix(col, vec3(0.8, 0.62, 0.12), yl * fadeM);
      col = mix(col, vec3(0.78), lane * fadeM);
      gRoughH = mix(0.92, 0.88, road);
      // night: sodium street lighting along the kerbs (reads as glowing grid lines from afar)
      float kerbLine = max(band(abs(dA - hA - 1.0), 0.6, fw.x), band(abs(dS - hS - 1.0), 0.6, fw.y));
      float lampDots = max(band(abs(mod(P.y, 26.0) - 13.0), 1.2, fw.y), band(abs(mod(P.x, 26.0) - 13.0), 1.2, fw.x));
      float lampAvg = mix(lampDots, 0.1, smoothstep(0.2, 1.0, fwm / 2.0));
      float pool = max(band(dA, hA + 3.0, fw.x * 3.0), band(dS, hS + 3.0, fw.y * 3.0));
      gEmitH = vec3(1.0, 0.62, 0.3) * (kerbLine * lampAvg * 2.5 + pool * 0.05) * hDark;
    }
  }
  diffuseColor.rgb = col;
}`).replace(`#include <roughnessmap_fragment>`,`#include <roughnessmap_fragment>
roughnessFactor = gRoughH;`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
totalEmissiveRadiance += gEmitH;`).replace(`#include <fog_fragment>`,`{
  vec3 d = vGW - cameraPosition;
  float dist = length(d);
  float fo = hFogAmount(d, vViewPosition.z);
  gl_FragColor.rgb = mix(gl_FragColor.rgb - gEmitH, hAtmosColor(d), fo) + gEmitH * pow(1.0 - fo, 0.8);
}`)},i.customProgramCacheKey=()=>`horizon-ground-v1`,i}var op=class{mesh;constructor(n){let{xs:r,zs:i,cells:a}=n,s=r.length-1,c=[],l=[];for(let e=0;e<i.length-1;e++)for(let t=0;t<s;t++){if(a[t+e*s]!==0)continue;let n=c.length/3;c.push(r[t],Of,i[e],r[t+1],Of,i[e],r[t+1],Of,i[e+1],r[t],Of,i[e+1]),l.push(n,n+2,n+1,n,n+3,n+2)}let u=new Dr;u.setAttribute(`position`,new yr(c,3)),u.setIndex(l),u.computeBoundingSphere();let d=new fi(new Float32Array(n.pano),512,1,w,h);d.wrapS=e,d.wrapT=t,d.magFilter=d.minFilter=o,d.needsUpdate=!0;let f=new Xr({uniforms:{...If,uPano:{value:d},uCentre:{value:[n.centre.x,n.centre.z]}},vertexShader:`
        varying vec3 vW;
        varying float vDepth;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vec4 mv = viewMatrix * w;
          vDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,fragmentShader:`
        ${Lf}
        uniform sampler2D uPano;
        uniform vec2 uCentre;
        varying vec3 vW;
        varying float vDepth;
        // one directional wave: returns d(height)/d(xz)
        vec2 wave(vec2 p, vec2 dir, float len, float amp, float speed) {
          float k = 6.2831853 / len;
          float ph = dot(p, dir) * k - hTime * speed * k;
          return dir * (amp * k * cos(ph));
        }
        void main() {
          vec3 rel = vW - cameraPosition;
          float dist = length(rel);
          vec3 V = -rel / dist;
          vec2 p = vW.xz;
          // wind waves: detail fades with distance (pixel footprint), leaving a calm, glassy far bay
          float fp = dist / 900.0;
          vec2 g = vec2(0.0);
          g += wave(p, normalize(vec2(0.8, 0.6)), 23.0, 0.20, 3.2) * (1.0 - smoothstep(0.6, 2.5, fp));
          g += wave(p, normalize(vec2(-0.4, 0.9)), 9.0, 0.08, 2.4) * (1.0 - smoothstep(0.25, 1.1, fp));
          g += wave(p, normalize(vec2(0.95, -0.3)), 3.7, 0.035, 1.6) * (1.0 - smoothstep(0.1, 0.45, fp));
          g += (vec2(hNoise(p * 0.9 + hTime * 0.6), hNoise(p.yx * 0.9 - hTime * 0.5)) - 0.5) * 0.18 * (1.0 - smoothstep(0.03, 0.18, fp));
          vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
          float ndv = max(dot(n, V), 0.0);
          float F = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
          vec3 R = reflect(-V, n);
          R.y = max(R.y, 0.001);
          vec3 refl = hSky(R);
          // far shores: does the reflected ray hit the skyline in that direction?
          vec2 fromC = vW.xz - uCentre;
          float az = atan(R.z, R.x) / 6.2831853 + 0.5;
          vec4 pn = texture2D(uPano, vec2(az, 0.5));
          float shoreDist = max(pn.y - dot(normalize(R.xz), fromC), 50.0);
          float elevSky = atan(pn.x - ${Of.toFixed(1)}, shoreDist);
          float elevR = asin(clamp(R.y, 0.0, 1.0));
          float hit = 1.0 - smoothstep(elevSky - 0.004, elevSky + 0.004, elevR);
          vec3 shore = hAtmosColor(vec3(R.x, 0.02, R.z)) * mix(0.55, 0.25, hNight);
          // night: broken vertical streaks of city light across the water
          float streak = hNoise(vec2(az * 900.0, vW.x * 0.05 + vW.z * 0.05 + hTime * 0.4)) * hNoise(vec2(az * 311.0, hTime * 0.8));
          shore += vec3(1.0, 0.75, 0.45) * pn.z * hNight * (0.25 + 1.4 * streak);
          refl = mix(refl, shore, hit);
          // the water body: deep teal, lit by the sky
          vec3 body = vec3(0.012, 0.03, 0.035) * (hAmbUp * 2.0 + hSunColor * 0.04);
          vec3 col = mix(body, refl, F);
          // sun (or moon) glint
          float spec = pow(max(dot(R, hSunDir), 0.0), 900.0) * 60.0 + pow(max(dot(R, hSunDir), 0.0), 60.0) * 0.4;
          col += hSunColor * spec * F * (1.0 - hit);
          // atmosphere
          float fog = hFogAmount(rel, vDepth);
          col = mix(col, hAtmosColor(rel), fog);
          if (any(isnan(col))) col = vec3(0.0);
          gl_FragColor = vec4(clamp(col, 0.0, 4096.0), 1.0);
        }`});this.mesh=new zr(u,f),this.mesh.name=`water`,this.mesh.frustumCulled=!1}},sp=class{group=new si;lights;constructor(e){let t=new V(e.ax,0,e.az),n=new V(e.bx,0,e.bz),r=t.distanceTo(n),i=new V().subVectors(n,t).normalize(),a=new V(-i.z,0,i.x),o=Math.atan2(i.x,i.z),s=new oa({color:new U(6187634),roughness:.55,metalness:.5}),c=new oa({color:new U(9209984),roughness:.85}),l=new zr(new Hr(e.width,3.2,r),s);l.position.copy(t).lerp(n,.5).setY(e.deckY),l.rotation.y=o,this.group.add(l);let u=[];for(let r of e.towerT){let i=t.clone().lerp(n,r);for(let t of[-1,1]){let n=new zr(new Hr(5,e.towerH-Of,6),s);n.position.copy(i).addScaledVector(a,t*(e.width*.5+2)).setY((e.towerH+Of)/2),n.rotation.y=o,this.group.add(n)}for(let t of[e.deckY-4,e.towerH*.62,e.towerH-6]){let n=new zr(new Hr(e.width+8,4,4),s);n.position.copy(i).setY(t),n.rotation.y=o,this.group.add(n)}let l=new zr(new Hr(e.width+16,10,18),c);l.position.copy(i).setY(Of+2),l.rotation.y=o,this.group.add(l),u.push(i)}let d=[],f=[],[p,m]=e.towerT,h=t=>{if(t<p)return e.deckY+2+(e.towerH-4-e.deckY-2)*(t/p);if(t>m)return e.deckY+2+(e.towerH-4-e.deckY-2)*((1-t)/(1-m));let n=(t-p)/(m-p)*2-1;return e.deckY+4+(e.towerH-4-e.deckY-4)*n*n};for(let r of[-1,1]){let i=null;for(let o=0;o<=80;o++){let s=o/80,c=t.clone().lerp(n,s).addScaledVector(a,r*(e.width*.5+2)).setY(h(s));i&&d.push(i.x,i.y,i.z,c.x,c.y,c.z),i=c,s>p&&s<m&&o%2==0&&f.push(c.x,c.y,c.z,c.x,e.deckY+1.6,c.z)}}let g=new Dr;g.setAttribute(`position`,new yr(d,3)),this.group.add(new Hi(g,new Ai({color:5068638})));let _=new Dr;_.setAttribute(`position`,new yr(f,3)),this.group.add(new Hi(_,new Ai({color:4147021,transparent:!0,opacity:.6})));let v=[];for(let r=0;r<=60;r++){let i=r/60;for(let r of[-1,1]){let o=t.clone().lerp(n,i).addScaledVector(a,r*e.width*.5).setY(e.deckY+2.2);v.push(o.x,o.y,o.z)}}for(let t of u)v.push(t.x,e.towerH+1,t.z);let y=new Dr;y.setAttribute(`position`,new yr(v,3)),this.lights=new Ui({color:new U(3.2,2.4,1.5),size:3,sizeAttenuation:!1,transparent:!0,depthWrite:!1});let b=new Ji(y,this.lights);b.frustumCulled=!1,this.group.add(b)}update(){let e=Id.uNight.value;this.lights.opacity=Math.min(1,e*1.4),this.lights.visible=e>.05}},cp=class e{root=new si;hips=new Wn;spine=new Wn;chest=new Wn;neck=new Wn;head=new Wn;shoulderL=new Wn;upperArmL=new Wn;foreArmL=new Wn;handL=new Wn;shoulderR=new Wn;upperArmR=new Wn;foreArmR=new Wn;handR=new Wn;thighL=new Wn;shinL=new Wn;footL=new Wn;thighR=new Wn;shinR=new Wn;footR=new Wn;static UPPER_ARM=.29;static FORE_ARM=.27;static THIGH=.44;static SHIN=.43;materials=[];fx={uTime:{value:0},uEnergy:{value:0},uSkin:{value:0}};static SKINS=[`Strand`,`Classic`];setSkin(t){this.fx.uSkin.value=(t%e.SKINS.length+e.SKINS.length)%e.SKINS.length}get skin(){return this.fx.uSkin.value}fireL={value:0};fireR={value:0};_a=new V;_b=new V;constructor(){let t=(e,t,n,r,i)=>{t.position.set(n,r,i),e.add(t)};this.root.add(this.hips),this.hips.position.set(0,.02,0),t(this.hips,this.spine,0,.1,0),t(this.spine,this.chest,0,.18,0),t(this.chest,this.neck,0,.24,0),t(this.neck,this.head,0,.08,0),t(this.chest,this.shoulderL,.17,.17,0),t(this.shoulderL,this.upperArmL,.05,0,0),t(this.upperArmL,this.foreArmL,0,-e.UPPER_ARM,0),t(this.foreArmL,this.handL,0,-e.FORE_ARM,0),t(this.chest,this.shoulderR,-.17,.17,0),t(this.shoulderR,this.upperArmR,-.05,0,0),t(this.upperArmR,this.foreArmR,0,-e.UPPER_ARM,0),t(this.foreArmR,this.handR,0,-e.FORE_ARM,0),t(this.hips,this.thighL,.1,-.05,0),t(this.thighL,this.shinL,0,-e.THIGH,0),t(this.shinL,this.footL,0,-e.SHIN,0),t(this.hips,this.thighR,-.1,-.05,0),t(this.thighR,this.shinR,0,-e.THIGH,0),t(this.shinR,this.footR,0,-e.SHIN,0),this.buildBody()}update(e,t){this.fx.uTime.value+=e;let n=Math.min(1,Math.max(0,(t-14)/32)),r=this.fx.uEnergy.value;this.fx.uEnergy.value=r+(n*n*(3-2*n)-r)*(1-Math.exp(-e*3)),this.fireL.value=Math.max(0,this.fireL.value-e*2.6),this.fireR.value=Math.max(0,this.fireR.value-e*2.6)}webPulse(e){this.handL.getWorldPosition(this._a),this.handR.getWorldPosition(this._b),(this._a.distanceToSquared(e)<this._b.distanceToSquared(e)?this.fireL:this.fireR).value=1}dispose(){this.root.traverse(e=>{e instanceof zr&&e.geometry.dispose()});for(let e of this.materials)e.dispose()}buildBody(){let t=(e,t=0,n)=>{let r=gp(e,t,this.fx,n??{value:0});return this.materials.push(r),r},n=(e,t,n,r=!1)=>{let i=new zr(t,n);return r&&(i.scale.x=-1),i.castShadow=!0,e.add(i),i};n(this.hips,up([Q(-.122,.04,.04,0,-.004),Q(-.1,.085,.07,0,-.008),Q(-.07,.13,.095,0,-.014),Q(-.03,.148,.103,0,-.014),Q(.01,.142,.098,0,-.008),Q(.06,.13,.091,0,0),Q(.12,.124,.087,0,.004)],28,.008,.02),t(mp.Pelvis)),n(this.spine,up([Q(-.08,.128,.09,0,0),Q(-.02,.122,.088,0,.006),Q(.04,.118,.087,0,.01),Q(.1,.124,.09,0,.012),Q(.16,.13,.094,0,.012),Q(.22,.132,.095,0,.01)],28,.02,.02),t(mp.Abdomen)),n(this.chest,up([Q(-.08,.127,.092,0,.011,2.2),Q(-.03,.134,.098,0,.013,2.3),Q(.02,.147,.11,0,.017,2.4),Q(.07,.16,.121,0,.02,2.5),Q(.115,.17,.12,0,.016,2.7),Q(.16,.178,.108,0,.006,3),Q(.198,.168,.092,0,-.004,2.8),Q(.228,.128,.078,0,-.01,2.4),Q(.252,.078,.066,0,-.012),Q(.27,.062,.06,0,-.01)],28,.02,.01),t(mp.Chest)),n(this.neck,up([Q(-.05,.058,.06,0,-.008),Q(0,.055,.057,0,-.002),Q(.05,.053,.055,0,.005),Q(.1,.052,.054,0,.01)],20,.01,.01),t(mp.Neck));let r=up([Q(-.03,.028,.03,0,.058),Q(-.018,.048,.05,0,.048),Q(.005,.064,.074,0,.032),Q(.035,.073,.089,0,.022),Q(.075,.079,.098,0,.014),Q(.115,.081,.101,0,.01),Q(.15,.08,.1,0,.004),Q(.182,.072,.092,0,-.001),Q(.205,.055,.073,0,-.003),Q(.219,.03,.042,0,-.002)],32,.008,.006);r.translate(0,-.01,0),n(this.head,r,t(mp.Head));let i=e.UPPER_ARM,a=e.FORE_ARM,o=lp(i,[[-.04,.066,.064,-.006,0],[.08,.071,.068,0,.002],[.3,.059,.06,0,.004],[.5,.052,.058,0,.01],[.75,.046,.05,0,.005],[1,.042,.043,0,0]],20,.03,.035),s=lp(a,[[0,.043,.045,0,0],[.18,.049,.049,0,-.003],[.42,.044,.041,0,-.002],[.78,.031,.029,0,0],[1,.026,.031,0,0]],20,.035,.02),c=lp(a,[[.78,.036,.035,0,0],[.9,.033,.037,0,0],[1.04,.031,.037,0,0]],20,0,.012),l=fp();for(let[e,r,u,d]of[[this.upperArmL,this.foreArmL,this.handL,!1],[this.upperArmR,this.foreArmR,this.handR,!0]]){let f=d?this.fireR:this.fireL;n(e,o,t(mp.UpperArm,i),d),n(r,s,t(mp.ForeArm,a,f),d),n(r,c,t(mp.Cuff,-a*.78-.004),d),n(u,l,t(mp.Hand,0,f),d)}let u=e.THIGH,d=e.SHIN,f=lp(u,[[-.08,.082,.084,-.012,0],[.1,.089,.094,-.004,.008],[.35,.08,.086,0,.012],[.62,.068,.071,0,.008],[.88,.057,.06,0,.006],[1,.054,.056,0,.002]],20,.05,.045),p=lp(d,[[0,.053,.055,0,0],[.1,.055,.062,0,-.008],[.28,.057,.068,0,-.02],[.5,.047,.052,0,-.012],[.8,.037,.039,0,-.002],[1,.034,.036,0,0]],20,.04,.03),m=lp(d,[[.7,.043,.046,0,-.004],[.85,.041,.044,0,0],[1.06,.04,.045,0,.004]],20,0,.02),h=pp();for(let[e,r,i,a]of[[this.thighL,this.shinL,this.footL,!1],[this.thighR,this.shinR,this.footR,!0]])n(e,f,t(mp.Thigh,u),a),n(r,p,t(mp.Shin,d),a),n(r,m,t(mp.Cuff,-d*.7-.004),a),n(i,h,t(mp.Boot),a)}},Q=(e,t,n,r=0,i=0,a=2)=>({y:e,rx:t,rz:n,cx:r,cz:i,e:a});function lp(e,t,n,r,i){return up(t.map(([t,n,r,i,a])=>Q(-t*e,n,r,i,a)).sort((e,t)=>e.y-t.y),n,i,r)}function up(e,t,n,r,i=3){let a=[],o=e[0],s=e[e.length-1];if(n>0)for(let e=i;e>=1;e--){let t=e/(i+1)*Math.PI*.5;a.push({...o,y:o.y-n*Math.sin(t),rx:o.rx*Math.cos(t),rz:o.rz*Math.cos(t)})}if(a.push(...e),r>0)for(let e=1;e<=i;e++){let t=e/(i+1)*Math.PI*.5;a.push({...s,y:s.y+r*Math.sin(t),rx:s.rx*Math.cos(t),rz:s.rz*Math.cos(t)})}let c=a.length,l=new Float32Array((c*t+2)*3),u=0;for(let e of a)for(let n=0;n<t;n++){let r=n/t*Math.PI*2,i=Math.cos(r),a=Math.sin(r),o=Math.sign(i)*Math.abs(i)**(2/e.e),s=Math.sign(a)*Math.abs(a)**(2/e.e);l[u++]=e.cx+e.rx*o,l[u++]=e.y,l[u++]=e.cz+e.rz*s}l[u++]=o.cx,l[u++]=o.y-n,l[u++]=o.cz,l[u++]=s.cx,l[u++]=s.y+r,l[u++]=s.cz;let d=[];for(let e=0;e<c-1;e++)for(let n=0;n<t;n++){let r=e*t+n,i=e*t+(n+1)%t,a=(e+1)*t+n,o=(e+1)*t+(n+1)%t;d.push(r,a,i,i,a,o)}let f=c*t,p=c*t+1,m=(c-1)*t;for(let e=0;e<t;e++)d.push(f,e,(e+1)%t),d.push(p,m+(e+1)%t,m+e);let h=new Dr;return h.setAttribute(`position`,new gr(l,3)),h.setIndex(d),h.computeVertexNormals(),h}function dp(e){let t=0,n=0;for(let r of e)t+=r.attributes.position.count,n+=r.index.count;let r=new Float32Array(t*3),i=new Float32Array(t*3),a=Array(n),o=0,s=0;for(let t of e){r.set(t.attributes.position.array,o*3),i.set(t.attributes.normal.array,o*3);let e=t.index.array;for(let t=0;t<e.length;t++)a[s++]=e[t]+o;o+=t.attributes.position.count,t.dispose()}let c=new Dr;return c.setAttribute(`position`,new gr(r,3)),c.setAttribute(`normal`,new gr(i,3)),c.setIndex(a),c}function fp(){let e=up([Q(-.128,.013,.03,-.024,0,2.6),Q(-.112,.016,.037,-.017,0,2.8),Q(-.092,.019,.042,-.008,0,3),Q(-.068,.021,.045,-.002,.001,3),Q(-.035,.022,.043,0,.002,2.8),Q(-.008,.02,.034,0,0,2.4),Q(.012,.022,.03,0,0)],20,.01,.01),t=up([Q(-.055,.011,.012),Q(-.03,.013,.014),Q(0,.014,.016)],12,.01,.008);return t.rotateX(-.3),t.rotateZ(-.35),t.translate(-.006,-.02,.03),dp([e,t])}function pp(){let e=(e,t,n,r,i=3.2)=>Q(e,t,n,0,-r,i),t=up([e(-.07,.034,.04,-.016),e(-.05,.042,.052,-.004),e(-.015,.046,.058,0),e(.03,.049,.048,-.008),e(.085,.05,.036,-.019),e(.14,.047,.027,-.028),e(.18,.04,.023,-.032)],22,.014,.022,3);return t.rotateX(Math.PI/2),t}var mp={Pelvis:0,Abdomen:1,Chest:2,Neck:3,Head:4,UpperArm:5,ForeArm:6,Hand:7,Thigh:8,Shin:9,Boot:10,Cuff:11},hp=`
uniform float uPart;
uniform float uAux;
uniform float uFire;
uniform float uTime;
uniform float uEnergy;
uniform float uSkin;
uniform float uNight;
varying vec3 vLP;
float gCore; float gHalo; float gPanel; float gSeam; float gGear; float gLens; float gLensE; float gAlong; float gPulse;

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
// chord distance from p to the surface line at angle a around the Y axis (0 = +X, PI/2 = +Z)
float chord(vec3 p, float a) {
  float r = length(p.xz);
  return length(p.xz - r * vec2(cos(a), sin(a)));
}
// anti-aliased emissive line; never thinner than ~1 px (it dims instead, so it cannot shimmer)
void strand(float d, float w, float k) {
  float fw = max(fwidth(d), 1e-5);
  float ww = max(w, fw * 0.8);
  float core = (1.0 - smoothstep(ww - fw * 0.5, ww + fw * 0.5, d)) * (w / ww);
  gCore = max(gCore, core * k);
  float h = 1.0 - smoothstep(0.0, w * 3.5 + fw, d);
  gHalo = max(gHalo, h * h * k);
}
// thin dark panel seam, faded out once it is sub-pixel
void seam(float d, float w) {
  float fw = max(fwidth(d), 1e-5);
  gSeam = max(gSeam, (1.0 - smoothstep(w - fw * 0.5, w + fw * 0.5, d)) * clamp(w * 2.0 / fw, 0.0, 1.0));
}
float band(float x, float a, float b, float s) { return smoothstep(a - s, a + s, x) * (1.0 - smoothstep(b - s, b + s, x)); }

void suitPattern(vec3 p) {
  gCore = 0.0; gHalo = 0.0; gPanel = 0.0; gSeam = 0.0; gGear = 0.0; gLens = 0.0; gLensE = 0.0; gPulse = 1.0;
  gAlong = -p.y;
  float W = 0.0052;
  int part = int(uPart + 0.5);
  if (part == 5) {                                   // upper arm: outer strand on a graphite stripe
    float t = -p.y / uAux;
    float d = chord(p, 0.12);
    strand(d, W, smoothstep(-0.2, -0.05, t));
    gPanel = 1.0 - smoothstep(0.034, 0.038, d);
    seam(abs(d - 0.036), 0.0012);
  } else if (part == 6) {                            // forearm: strand, then a double-helix bracer
    float t = -p.y / uAux;
    float d = chord(p, 0.12);
    strand(d, W, 1.0 - smoothstep(0.36, 0.46, t));
    gPanel = (1.0 - smoothstep(0.03, 0.034, d)) * (1.0 - smoothstep(0.4, 0.46, t));
    float turns = 1.35;
    float a = 0.12 + (t - 0.44) * turns * 6.2831853;
    float r = length(p.xz);
    float k = r * turns * 6.2831853 / (uAux * 0.34);
    float dh = min(chord(p, a), chord(p, a + 3.14159265)) / sqrt(1.0 + k * k);
    float hk = band(t, 0.44, 0.76, 0.02);
    strand(dh, W * 0.8, hk * (1.0 + 2.5 * uFire));
    gPanel = max(gPanel, hk * 0.6);
    gAlong = t * 0.5;
  } else if (part == 7) {                            // glove: back-of-hand strand + palm emitter
    gGear = 1.0;
    float back = smoothstep(0.004, 0.012, p.x);
    strand(abs(p.z), W * 0.75, back * band(-p.y, 0.0, 0.07, 0.006));
    float e = length(vec3(p.x + 0.02, p.y + 0.03, p.z * 0.8));
    strand(e, 0.007, (0.55 + 3.0 * uFire) * (1.0 - smoothstep(-0.01, 0.0, p.x)));
    gPulse = 1.0 + 1.5 * uFire;
  } else if (part == 8) {                            // thigh: strand spirals from outer hip to front of knee
    float t = -p.y / uAux;
    float a = mix(0.05, 1.3, smoothstep(0.05, 1.0, t));
    float d = chord(p, a);
    strand(d, W, smoothstep(-0.1, 0.02, t));
    gPanel = 1.0 - smoothstep(0.04, 0.044, d);
    seam(abs(d - 0.042), 0.0012);
  } else if (part == 9) {                            // shin: front strand down to the boot cuff
    float t = -p.y / uAux;
    float a = mix(1.3, 1.52, t);
    float d = chord(p, a);
    strand(d, W, 1.0 - smoothstep(0.62, 0.7, t));
    gPanel = (1.0 - smoothstep(0.034, 0.038, d)) * (1.0 - smoothstep(0.66, 0.7, t));
    seam(abs(d - 0.036), 0.0012);
  } else if (part == 10) {                           // boot: glossy black with a lit sole edge
    gGear = 1.0;
    float side = smoothstep(-0.05, -0.047, p.y);
    strand(abs(p.y + 0.041), W * 0.7, side * smoothstep(-0.09, -0.05, p.z));
    seam(abs(p.z - 0.105), 0.0012);
    gAlong = p.z;
  } else if (part == 11) {                           // glove / boot cuff: gear with a thin top ring
    gGear = 1.0;
    strand(abs(p.y - uAux + 0.012), W * 0.6, 1.0);
    gAlong = 0.0;
  } else if (part == 4) {                            // mask: slit lenses + crest
    float front = smoothstep(0.02, 0.05, p.z);
    vec2 q = vec2(abs(p.x), p.y) - vec2(0.037, 0.108);
    float ca = cos(0.36), sa = sin(0.36);
    q = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float hx = 0.03;
    float hy = 0.0105 * (1.0 - 0.55 * smoothstep(-0.018, 0.03, q.x)) * (0.75 + 0.25 * smoothstep(-0.03, -0.01, q.x));
    float el = length(vec2(q.x / hx, q.y / hy));
    float dl = (el - 1.0) * hy;
    float fw = max(fwidth(dl), 1e-5);
    gLens = (1.0 - smoothstep(-fw * 0.5, fw * 0.5, dl)) * front;
    gLensE = el;
    gSeam = max(gSeam, (1.0 - smoothstep(0.0035, 0.0035 + fw, dl)) * front * (1.0 - gLens));
    // crest strand from the brow over the crown to the nape
    float crest = smoothstep(0.16, 0.19, p.y + p.z * 0.35) + (1.0 - smoothstep(-0.03, 0.0, p.z)) * smoothstep(0.0, 0.05, p.y);
    strand(abs(p.x), W * 0.8, clamp(crest, 0.0, 1.0));
    gPanel = 1.0 - smoothstep(0.012, 0.016, abs(p.x));
    gAlong = p.y - p.z;
  } else if (part == 3) {                            // neck: spine strand continues down the back
    strand(abs(p.x), W * 0.8, 1.0 - smoothstep(-0.03, -0.01, p.z));
  } else {                                           // torso pieces
    float front = smoothstep(0.0, 0.035, p.z);
    float back = smoothstep(0.0, 0.035, -p.z);
    vec2 q = vec2(abs(p.x), p.y);
    float flank = length(vec2(abs(p.x), p.z) - length(vec2(abs(p.x), p.z)) * vec2(1.0, 0.0));
    if (part == 2) {                                 // chest: strands converge on the sternum and the spine
      float dF = min(sdSeg(q, vec2(0.128, 0.205), vec2(0.0, 0.035)), sdSeg(q, vec2(0.0, 0.035), vec2(0.0, -0.12)));
      float dB = min(sdSeg(q, vec2(0.122, 0.2), vec2(0.0, 0.05)), sdSeg(q, vec2(0.0, 0.3), vec2(0.0, -0.12)));
      strand(dF, W, front);
      strand(dB, W, back);
      strand(flank, W, 1.0 - smoothstep(0.08, 0.11, p.y));
      // glossy graphite chest plate and shoulder yoke, split by the strands
      float plate = front * smoothstep(-0.01, 0.01, p.y) * (1.0 - smoothstep(0.155, 0.165, abs(p.x)));
      float yoke = smoothstep(0.15, 0.16, p.y);
      gPanel = max(plate, yoke);
      seam(abs(p.y - 0.155), 0.0012);
      seam(abs(p.y + 0.0) + (1.0 - front) * 0.05, 0.0012);
    } else if (part == 1) {                          // abdomen: centre, spine and flank strands
      strand(abs(p.x), W, max(front, back));
      strand(flank, W, 1.0);
    } else {                                         // pelvis: flank strands end at a waist ring
      strand(flank, W, 1.0 - smoothstep(-0.005, 0.01, p.y));
      strand(abs(p.y - 0.004), W * 0.8, 1.0);
      strand(abs(p.x), W, back * smoothstep(-0.01, 0.01, p.y));
    }
  }
  // travelling energy pulses along the lines at speed
  float wave = pow(0.5 + 0.5 * sin(gAlong * 22.0 - uTime * 16.0), 6.0);
  gPulse *= (0.92 + 0.08 * sin(uTime * 2.1)) * (1.0 + uEnergy * (0.35 + 1.4 * wave));
}
`;function gp(e,t,n,r){let i=new sa({color:16777215,roughness:.5,metalness:0,clearcoat:1,clearcoatRoughness:.18,sheen:.35,sheenRoughness:.5,sheenColor:new U(.16,.34,.48)}),a={value:e},o={value:t};return i.onBeforeCompile=e=>{Object.assign(e.uniforms,{uPart:a,uAux:o,uFire:r,uTime:n.uTime,uEnergy:n.uEnergy,uSkin:n.uSkin,uNight:Id.uNight}),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vLP;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vLP = position;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+hp).replace(`#include <metalnessmap_fragment>`,`#include <metalnessmap_fragment>
suitPattern(vLP);
{
  // midnight satin base, glossy graphite panels, near-black gear; seams darken
  vec3 base = mix(vec3(0.0095, 0.0135, 0.026), vec3(0.03, 0.035, 0.045), gPanel);
  base = mix(base, vec3(0.0065, 0.0072, 0.009), gGear);
  base = mix(base, vec3(0.001), gSeam * 0.85);
  base = mix(base, vec3(0.0), gLens);
  if (uSkin > 0.5) {
    // Classic: red mask, chest, forearms, gloves and boots; blue flanks, upper arms and legs;
    // the suit's own lines become raised silver piping instead of light
    int pt = int(uPart + 0.5);
    vec3 red = vec3(0.42, 0.018, 0.02), blue = vec3(0.012, 0.035, 0.16);
    float isBlue = (pt == 5 || pt == 8 || pt == 9 || pt == 0) ? 1.0 : 0.0;
    if (pt == 1 || pt == 2) {
      // torso: red front and back panel, blue down the sides
      float side = smoothstep(0.075, 0.1, abs(vLP.x)) * (1.0 - smoothstep(0.03, 0.06, abs(vLP.z)) * 0.0);
      isBlue = side * (1.0 - smoothstep(0.035, 0.07, abs(vLP.z)));
    }
    if (pt == 9) isBlue = 1.0 - smoothstep(0.62, 0.66, -vLP.y / max(uAux, 1e-3)); // red boot tops
    base = mix(red, blue, isBlue);
    base *= mix(1.0, 0.85, gPanel);
    base = mix(base, vec3(0.005), gSeam * 0.9);
    base = mix(base, vec3(0.55, 0.57, 0.6), gCore);  // silver piping
    base = mix(base, vec3(0.0), gLens);
  }
  diffuseColor.rgb = base;
  roughnessFactor = mix(mix(0.58, 0.3, gPanel), 0.26, gGear) + gSeam * 0.3;
  roughnessFactor = mix(roughnessFactor, 0.08, gLens);
  metalnessFactor = mix(0.0, 0.35, max(gPanel, gGear * 0.6));
}`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
{
  vec3 cyan = vec3(0.05, 0.745, 0.871);
  float lineK = mix(2.4, 3.6, uNight) * gPulse * (1.0 - step(0.5, uSkin));
  totalEmissiveRadiance += cyan * (gCore * lineK + gHalo * 0.12 * lineK);
  vec3 lensCol = mix(vec3(0.75, 1.0, 1.0) * 6.0, cyan * 4.0, smoothstep(0.25, 1.0, gLensE));
  if (uSkin > 0.5) lensCol = vec3(0.85, 0.88, 0.92) * mix(0.9, 1.6, uNight); // white lenses
  totalEmissiveRadiance += lensCol * gLens * mix(1.0, 1.25, uNight);
  vec3 V = normalize(vViewPosition);
  float fres = pow(1.0 - saturate(dot(normal, V)), 3.0);
  totalEmissiveRadiance += vec3(0.18, 0.46, 0.58) * fres * mix(0.05, 0.4, uNight) * (1.0 - gLens);
}`).replace(`#include <lights_physical_fragment>`,`#include <lights_physical_fragment>
#ifdef USE_CLEARCOAT
  material.clearcoat *= mix(mix(0.3, 1.0, gPanel), 0.9, gGear) * (1.0 - gSeam * 0.8);
#endif`)},i.customProgramCacheKey=()=>`strand-suit-2`,i}var $={hipY:0,hipPitch:1,hipRoll:2,hipYaw:3,spinePitch:4,spineRoll:5,spineYaw:6,chestPitch:7,chestYaw:8,neckPitch:9,headPitch:10,headYaw:11,lThigh:12,lAbduct:13,lKnee:14,lFoot:15,rThigh:16,rAbduct:17,rKnee:18,rFoot:19,lShoulder:20,lArmOut:21,lArmTwist:22,lElbow:23,rShoulder:24,rArmOut:25,rArmTwist:26,rElbow:27};function _p(e){return e.fill(0),e[$.lArmOut]=.12,e[$.rArmOut]=.12,e[$.lElbow]=.15,e[$.rElbow]=.15,e[$.lKnee]=.05,e[$.rKnee]=.05,e}var vp=new V,yp=new V,bp=new V,xp=new V,Sp=new V,Cp=new V,wp=new V,Tp=new V,Ep=new V,Dp=new mt,Op=new mt,kp=new mt,Ap=new mt,jp=new mt;function Mp(e,t,n){Dp.setFromUnitVectors(t,n),e.getWorldQuaternion(Op),Op.premultiply(Dp),e.parent.getWorldQuaternion(kp),e.quaternion.copy(kp.invert().multiply(Op)),e.updateMatrixWorld(!0)}function Np(e,t,n,r,i,a=1){if(a<=0)return 0;e.updateMatrixWorld(!0),e.getWorldPosition(vp),t.getWorldPosition(yp),n.getWorldPosition(bp);let o=vp.distanceTo(yp),s=yp.distanceTo(bp);xp.copy(r);let c=Tp.subVectors(xp,vp),l=c.length(),u=l/(o+s),d=(o+s)*.999,f=Math.abs(o-s)*1.001+1e-4;if(l<1e-5)return u;c.multiplyScalar(1/l),l=Math.min(d,Math.max(f,l)),xp.copy(vp).addScaledVector(c,l),Sp.subVectors(i,vp).cross(c),Sp.lengthSq()<1e-8&&Sp.set(1,0,0).cross(c),Sp.normalize(),Cp.crossVectors(c,Sp).normalize(),Cp.dot(Ep.subVectors(i,vp))<0&&Cp.negate();let p=(o*o+l*l-s*s)/(2*o*l),m=Math.sqrt(Math.max(0,1-p*p));return wp.copy(vp).addScaledVector(c,p*o).addScaledVector(Cp,m*o),Ap.copy(e.quaternion),jp.copy(t.quaternion),Mp(e,Tp.subVectors(yp,vp).normalize(),Ep.subVectors(wp,vp).normalize()),t.getWorldPosition(yp),n.getWorldPosition(bp),Mp(t,Tp.subVectors(bp,yp).normalize(),Ep.subVectors(xp,yp).normalize()),a<1&&(Dp.copy(e.quaternion),e.quaternion.copy(Ap).slerp(Dp,a),Dp.copy(t.quaternion),t.quaternion.copy(jp).slerp(Dp,a),e.updateMatrixWorld(!0)),u}var Pp={chestRoll:28,headRoll:29},Fp=30,Ip=()=>new Float32Array(Fp),Lp=new V(0,1,0),Rp=Math.PI*2,zp=.43,Bp={Grounded:.24,Airborne:.32,Swinging:.26,WebZip:.16,PointLaunch:.14,Perching:.22,WallRunning:.2,WallCrawling:.28,Vaulting:.12,Mantling:.14,Landing:.12,Recovery:.12,Trick:.16},Vp=class{x0=new Float32Array(Fp);v0=new Float32Array(Fp);a0=new Float32Array(Fp);A=new Float32Array(Fp);B=new Float32Array(Fp);C=new Float32Array(Fp);t1=new Float32Array(Fp);t=1e9;start(e,t,n,r,i){for(let a=0;a<Fp;a++){let o=e[a]+t[a]*i-n[a],s=q(t[a],-40,40);if(Math.abs(o)<1e-5){this.t1[a]=0;continue}let c=o<0?-1:1;o*=c,s*=c,s>0&&(s=0);let l=r;s<0&&(l=Math.min(l,-5*o/s)),l=Math.max(l,.001);let u=Math.max(0,(-8*s*l-20*o)/(l*l)),d=l*l,f=d*l,p=f*l,m=p*l;this.A[a]=c*-(u*d+6*s*l+12*o)/(2*m),this.B[a]=c*(3*u*d+16*s*l+30*o)/(2*p),this.C[a]=c*-(3*u*d+12*s*l+20*o)/(2*f),this.a0[a]=c*u,this.v0[a]=c*s,this.x0[a]=c*o,this.t1[a]=l}this.t=0}apply(e,t,n){n&&(this.t+=t);let r=this.t;for(let t=0;t<Fp;t++){if(r>=this.t1[t])continue;let n=r*r,i=n*r;e[t]+=this.A[t]*i*n+this.B[t]*n*n+this.C[t]*i+.5*this.a0[t]*n+this.v0[t]*r+this.x0[t]}}},Hp=class{x=0;v=0;step(e,t,n,r){let i=Math.max(1,Math.ceil(r/(1/240))),a=r/i;for(let r=0;r<i;r++)this.v+=(t*t*(e-this.x)-2*n*t*this.v)*a,this.x+=this.v*a;return this.x}},Up=class e{rig;pose=Ip();target=Ip();inert=new Vp;inertOut=Ip();inertPrev=Ip();inertVel=Ip();lastState=null;pendingBlend=0;phase=0;locoSpeed=0;landDip=0;landDipV=0;breath=0;time=0;diveW=0;tuckW=0;swingSide=0;relT=10;relKind=`none`;relStrength=0;releases=0;legLag=new Hp;legLagR=new Hp;armLag=new Hp;bodyQuat=new mt;prevBodyQuat=new mt;targetQuat=new mt;spinQuat=new mt;rootOffset=new V;spin={active:!1,t:0,dur:.6,axis:0,sign:1,tuck:1,speed:1};queuedSpin=null;m4=new _n;_f=new V;_u=new V;_l=new V;_t=new V;_p=new V;_v=new V;_w=new V;_o=new V;_q=new mt;webHand=`R`;ikL=0;ikR=0;ikTargetL=new V;ikTargetR=new V;reachT=1;zipW=0;perchW=0;recoverW=0;crawlW=0;lookW=0;lookDir=new V(0,0,-1);limbs=Array.from({length:4},()=>({planted:new V,from:new V,to:new V,t:0,stepping:!1}));crawlNormal=new V;crawlPhase=0;steps=[];tmpPose=Ip();constructor(e){this.rig=e,_p(this.pose),_p(this.inertPrev)}update(e,t){this.steps.length=0,this.time+=e,this.breath+=e,this.relT+=e;let n=t.state;n!==this.lastState&&this.onEnter(n,this.lastState,t),this.diveW+=(+!!t.diving-this.diveW)*il(7,e),this.advanceSpin(e);let r=this.target;_p(r),r[Pp.chestRoll]=0,r[Pp.headRoll]=0,this.buildStatePose(e,t,r);let i=this.inertOut;i.set(r),this.pendingBlend>0?(this.inert.start(this.inertPrev,this.inertVel,r,this.pendingBlend,e),this.pendingBlend=0,this.inert.apply(i,e,!1)):this.inert.apply(i,e,!0);let a=1/Math.max(e,1e-4);for(let e=0;e<Fp;e++)this.inertVel[e]=(i[e]-this.inertPrev[e])*a,this.inertPrev[e]=i[e];let o=this.pose;o.set(i),this.landDipV+=(-120*this.landDip-16*this.landDipV)*e,this.landDip+=this.landDipV*e;let s=Math.min(0,this.landDip);o[$.hipY]+=s*.35,o[$.lKnee]-=s*1.4,o[$.rKnee]-=s*1.4,o[$.lThigh]-=s*.8,o[$.rThigh]-=s*.8,o[$.spinePitch]-=s*.5,o[$.lArmOut]-=s*.4,o[$.rArmOut]-=s*.4,this.orient(e,t),this.secondary(e,t,o),this.applyPose(),this.applyIK(e,t)}onEnter(e,t,n){if(this.lastState=e,t!==null&&(this.pendingBlend=Bp[e]??.2),e===`Swinging`){let e=this._f.set(-Math.sin(n.facing),0,-Math.cos(n.facing));sl(n.vel)>2&&e.set(n.vel.x,0,n.vel.z).normalize();let t=this._l.crossVectors(Lp,e),r=this._t.subVectors(n.anchor,n.pos),i=r.dot(t)/Math.max(1,r.length());this.webHand=i>.12?`L`:i<-.12?`R`:this.webHand===`R`?`L`:`R`,this.reachT=0,this.tuckW=0}if(e===`Airborne`&&t===`Swinging`&&this.onRelease(n),e===`Trick`){let e=n.trickKind;this.startSpin(e<=1?0:2,e===1||e===3?-1:1,K.air.trickDuration*.95,e<=1?1:.5)}e===`Landing`&&(this.spin.active&&(this.spin.speed=4),this.startSpin(0,1,K.landing.rollTime,1,!0)),e===`Grounded`&&t&&t!==`Vaulting`&&t!==`Mantling`&&t!==`Landing`&&t!==`Recovery`&&(this.landDipV-=Math.min(2.2,n.landingImpact*.09+.3)),e===`WallCrawling`&&this.initCrawl(n)}onRelease(e){let t=sl(e.vel),n=Math.atan2(e.vel.y,Math.max(t,.1)),r=e.vel.length();this.relT=0,this.relStrength=q(.55+e.releaseQuality*.45,0,1)*Y(8,20,r),this.releases++,r>10&&n>40*Math.PI/180&&!this.spin.active?(this.relKind=`flip`,this.releases%2==0?this.startSpin(0,1,.62,1):this.startSpin(1,this.webHand===`R`?1:-1,.7,.35)):this.relKind=r>8?`spread`:`none`}startSpin(e,t,n,r,i=!1){let a={active:!0,t:0,dur:n,axis:e,sign:t,tuck:r,speed:1};if(this.spin.active){i&&(this.queuedSpin=a);return}Object.assign(this.spin,a)}advanceSpin(e){let t=this.spin;if(!t.active&&this.queuedSpin&&(Object.assign(t,this.queuedSpin),this.queuedSpin=null),!t.active){this.spinQuat.identity();return}if(t.t+=e*t.speed,t.t>=t.dur){t.active=!1,this.spinQuat.identity(),this.queuedSpin&&=(Object.assign(t,this.queuedSpin),null);return}let n=t.t/t.dur,r=n<.5?2*n*n:1-(-2*n+2)**2/2,i=t.sign*Rp*r;this._l.set(+(t.axis===0),+(t.axis===1),+(t.axis===2)),this.spinQuat.setFromAxisAngle(this._l,i)}spinTuck(){let e=this.spin;return e.active?e.tuck*Math.sin(Math.PI*q(e.t/e.dur,0,1)):0}buildStatePose(e,t,n){let r=sl(t.vel),i=t.stateTime;switch(t.state){case`Grounded`:if(this.locomotion(e,r,n,!1,t),t.jumpCharge>0){let e=q(t.jumpCharge/K.ground.superJumpChargeTime,0,1);this.crouch(n,.4+e*.6),n[$.lArmOut]+=e*.5,n[$.rArmOut]+=e*.5,n[$.lShoulder]-=e*.4,n[$.rShoulder]-=e*.4}break;case`Landing`:this.airPose(e,t,n),this.tuck(n,Math.max(.85,this.spinTuck()));break;case`Recovery`:{let a=1-Y(.35,1,i/K.landing.recoveryTime);this.locomotion(e,r,n,!1,t);let o=1-a;for(let e=0;e<Fp;e++)n[e]*=o;Wp(n,o),n[$.hipY]+=-.52*a,n[$.spinePitch]+=.8*a,n[$.chestPitch]+=.15*a,n[$.lThigh]+=1.75*a,n[$.lKnee]+=2.2*a,n[$.lFoot]+=-.3*a,n[$.rThigh]+=.35*a,n[$.rKnee]+=2*a,n[$.rAbduct]+=.3*a,n[$.rFoot]+=.4*a,n[$.rShoulder]+=1*a,n[$.rElbow]+=.15*a,n[$.rArmOut]+=.25*a,n[$.lShoulder]+=-.5*a,n[$.lArmOut]+=1*a,n[$.lElbow]+=.5*a,n[$.headPitch]+=-.55*a;break}case`Airborne`:this.airPose(e,t,n),this.tuck(n,this.spinTuck());break;case`PointLaunch`:{this.airPose(e,t,n);let r=Y(0,.1,i)*(1-Y(.1,.3,i));this.tuck(n,r);let a=Y(.12,.35,i);n[$.lShoulder]=J(n[$.lShoulder],2.75,a),n[$.rShoulder]=J(n[$.rShoulder],2.55,a),n[$.lArmOut]=J(n[$.lArmOut],.25,a),n[$.rArmOut]=J(n[$.rArmOut],.35,a),n[$.lElbow]=J(n[$.lElbow],.15,a),n[$.rElbow]=J(n[$.rElbow],.35,a),n[$.lThigh]=J(n[$.lThigh],.1,a),n[$.rThigh]=J(n[$.rThigh],-.15,a),n[$.lKnee]=J(n[$.lKnee],.25,a),n[$.rKnee]=J(n[$.rKnee],.6,a),n[$.headPitch]=J(n[$.headPitch],-.3,a);break}case`Trick`:if(this.airPose(e,t,n),this.tuck(n,this.spinTuck()),t.trickKind>=2){let e=Math.sin(q(i/K.air.trickDuration,0,1)*Math.PI);n[$.lArmOut]=J(n[$.lArmOut],.05,e),n[$.rArmOut]=J(n[$.rArmOut],.05,e),n[$.lShoulder]=J(n[$.lShoulder],.3,e),n[$.rShoulder]=J(n[$.rShoulder],.3,e)}break;case`Swinging`:this.swingPose(e,t,n);break;case`WebZip`:{let e=1-Y(2.5,7,t.zipTarget.distanceTo(t.pos));n[$.lShoulder]=2.4,n[$.rShoulder]=2.2,n[$.lElbow]=.6,n[$.rElbow]=.8,n[$.lArmOut]=.25,n[$.rArmOut]=.25,n[$.spinePitch]=-.15,n[$.chestPitch]=-.1,n[$.lThigh]=-.35,n[$.rThigh]=.2,n[$.lKnee]=.6,n[$.rKnee]=1.2,n[$.lFoot]=.5,n[$.rFoot]=.4,this.tuck(n,e*.8),n[$.headPitch]=-.2;break}case`Perching`:this.crouch(n,1),n[$.lAbduct]=.42,n[$.rAbduct]=.36,n[$.lKnee]=2.45,n[$.rKnee]=2.3,n[$.spinePitch]=.62,n[$.rShoulder]=.9,n[$.rElbow]=.3,n[$.rArmOut]=.15,n[$.lShoulder]=.55,n[$.lArmOut]=.45,n[$.lElbow]=1.5,n[$.headPitch]=-.45+Math.sin(this.breath*1.3)*.03;break;case`WallRunning`:this.locomotion(e,Math.max(12,t.vel.length()),n,!0,t),t.wallMode===`vertical`?(n[$.headPitch]-=.25,n[$.spinePitch]+=.1):(this.wallSideLeft(t)?`l`:`r`)==`l`?(n[$.lArmOut]=1,n[$.lShoulder]=.6,n[$.lElbow]=.3):(n[$.rArmOut]=1,n[$.rShoulder]=.6,n[$.rElbow]=.3);break;case`WallCrawling`:{n[$.hipY]=-.05,n[$.lShoulder]=2,n[$.rShoulder]=2,n[$.lArmOut]=.9,n[$.rArmOut]=.9,n[$.lElbow]=1.3,n[$.rElbow]=1.3,n[$.lThigh]=.9,n[$.rThigh]=.9,n[$.lAbduct]=.75,n[$.rAbduct]=.75,n[$.lKnee]=1.8,n[$.rKnee]=1.8,n[$.headPitch]=-.65;let e=Math.sin(this.crawlPhase);n[$.spineRoll]=e*.12,n[$.hipYaw]=-e*.08,n[$.headYaw]=e*.1;break}case`Vaulting`:{let a=Math.sin(q(i/.35,0,1)*Math.PI);this.locomotion(e,r,n,!1,t),n[$.hipRoll]=.7*a,n[$.lThigh]=J(n[$.lThigh],1.3,a),n[$.rThigh]=J(n[$.rThigh],1.6,a),n[$.lKnee]=J(n[$.lKnee],1.7,a),n[$.rKnee]=J(n[$.rKnee],.8,a),n[$.rShoulder]=J(n[$.rShoulder],.7,a),n[$.rElbow]=J(n[$.rElbow],.1,a),n[$.lArmOut]=J(n[$.lArmOut],1.3,a);break}case`Mantling`:{let e=q(i/.35,0,1),t=Math.sin(e*Math.PI);n[$.lShoulder]=J(2.6,.3,e),n[$.rShoulder]=J(2.6,.3,e),n[$.lElbow]=J(.3,1.6,t),n[$.rElbow]=n[$.lElbow],n[$.lThigh]=1.6*t,n[$.rThigh]=.8*t,n[$.lKnee]=2*t,n[$.rKnee]=1.4*t,n[$.spinePitch]=.4*t;break}}}locomotion(e,t,n,r,i){this.locoSpeed+=(t-this.locoSpeed)*il(8,e);let a=this.locoSpeed,o=r?1:Y(.12,.9,a),s=Math.sin(this.breath*1.7),c=1-o;if(c>0&&(n[$.chestPitch]+=s*.02*c,n[$.lArmOut]+=(.04+s*.01)*c,n[$.rArmOut]+=(.04+s*.01)*c,n[$.headYaw]+=Math.sin(this.breath*.3)*.25*c,n[$.hipRoll]+=Math.sin(this.breath*.23)*.03*c,n[$.lKnee]+=.06*c),o<=0)return;let l=Y(2.5,7,a),u=Y(8,15,a),d=J(1.45,J(2.9,5.2,u),l),f=this.phase;this.phase+=e*Math.max(a,.6)*Rp/d,o>.5&&Math.floor(f/Math.PI)!==Math.floor(this.phase/Math.PI)&&this.maybeStep(r,a);let p=this.phase,m=Math.sin(p),h=J(.38,J(.85,1.1,u),l)*o,g=J(.55,J(1.55,2.05,u),l)*o;n[$.lThigh]+=h*m+.12*l*o,n[$.rThigh]+=-h*m+.12*l*o,n[$.lKnee]+=.1*o+g*Math.max(0,Math.sin(p-1.3))+.22*l*o,n[$.rKnee]+=.1*o+g*Math.max(0,Math.sin(p+Math.PI-1.3))+.22*l*o,n[$.lFoot]+=(.35*Math.sin(p-.4)*l-.1*l)*o,n[$.rFoot]+=(-.35*Math.sin(p-.4)*l-.1*l)*o;let _=J(.3,J(.8,1.15,u),l)*o;if(n[$.lShoulder]+=-_*m*.9+.12*o,n[$.rShoulder]+=_*m*.9+.12*o,n[$.lElbow]+=J(.15,1.45,l)*o,n[$.rElbow]+=J(.15,1.45,l)*o,n[$.lArmOut]+=-.02*o,n[$.rArmOut]+=-.02*o,n[$.spinePitch]+=J(.04,J(.2,.38,u),l)*o,n[$.hipYaw]+=m*.12*(.4+l)*o,n[$.chestYaw]+=-m*.18*(.4+l)*o,n[$.hipY]+=(-Math.abs(Math.cos(p))*J(.02,.08,l)+.02*l-.04*u)*o,n[$.headPitch]+=-n[$.spinePitch]*.6,!r){let e=this._f.set(-Math.sin(i.facing),0,-Math.cos(i.facing)),t=this._l.crossVectors(Lp,e),r=q(i.acc.x*t.x+i.acc.z*t.z,-30,30);n[$.headYaw]+=r*.012*o,n[$.chestYaw]+=r*.006*o,n[Pp.chestRoll]+=r*.004*o}}maybeStep(e,t){this.steps.push({wall:e,speed:t})}airPose(e,t,n){let r=t.vel.y,i=Y(-1,8,r),a=Y(0,-18,r),o=Y(-18,-42,r),s=q(1-i-a,0,1),c=this.breath,l=(e,t,r)=>{n[e]+=t*r};l($.lThigh,1.05,i),l($.rThigh,.55,i),l($.lKnee,1.55,i),l($.rKnee,1.05,i),l($.lShoulder,1.35,i),l($.rShoulder,.95,i),l($.lArmOut,.35,i),l($.rArmOut,.45,i),l($.lElbow,.45,i),l($.rElbow,.6,i),l($.spinePitch,.12,i),l($.lThigh,.45,s),l($.rThigh,.05,s),l($.lKnee,.9,s),l($.rKnee,.5,s),l($.lAbduct,.12,s),l($.rAbduct,.12,s),l($.lShoulder,.55,s),l($.rShoulder,.4,s),l($.lArmOut,.95,s),l($.rArmOut,1.05,s),l($.lElbow,.45,s),l($.rElbow,.4,s),l($.spinePitch,-.05,s);let u=Math.sin(c*6.5),d=a*(1-o);if(l($.lThigh,.35+u*.18,d),l($.rThigh,.05-u*.18,d),l($.lKnee,1+u*.2,d),l($.rKnee,.55-u*.15,d),l($.lShoulder,1.7,d),l($.rShoulder,1.5,d),l($.lArmOut,1.05,d),l($.rArmOut,1.15,d),l($.lElbow,.45,d),l($.rElbow,.5,d),l($.spinePitch,-.15,d),l($.headPitch,.2,d),l($.lThigh,-.1,o),l($.rThigh,.05,o),l($.lKnee,.7,o),l($.rKnee,.9,o),l($.lAbduct,.3,o),l($.rAbduct,.3,o),l($.lShoulder,1,o),l($.rShoulder,1,o),l($.lArmOut,1.4,o),l($.rArmOut,1.4,o),l($.lElbow,.5,o),l($.rElbow,.5,o),l($.spinePitch,-.35,o),l($.headPitch,-.3,o),this.relKind===`spread`&&(t.state===`Airborne`||t.state===`Trick`)){let e=this.relT,t=Y(0,.1,e)*(1-Y(.45,.95,e))*this.relStrength*(1-this.diveW);if(t>0){for(let e=0;e<Fp;e++)n[e]*=1-t;Wp(n,1-t),l($.lArmOut,1.45,t),l($.rArmOut,1.5,t),l($.lShoulder,.35,t),l($.rShoulder,.15,t),l($.lElbow,.3,t),l($.rElbow,.2,t),l($.lThigh,-.35,t),l($.rThigh,.45,t),l($.lKnee,.35,t),l($.rKnee,1.25,t),l($.lAbduct,.22,t),l($.rAbduct,.18,t),l($.lFoot,.5,t),l($.rFoot,.3,t),l($.spinePitch,-.35,t),l($.chestPitch,-.18,t),l($.headPitch,-.3,t)}}let f=this.diveW;if(f>.001){for(let e=0;e<Fp;e++)n[e]*=1-f;Wp(n,1-f),l($.lShoulder,-.4,f),l($.rShoulder,-.35,f),l($.lArmOut,.28,f),l($.rArmOut,.28,f),l($.lElbow,.12,f),l($.rElbow,.18,f),l($.lThigh,-.05,f),l($.rThigh,.08,f),l($.lKnee,.12,f),l($.rKnee,.35,f),l($.lFoot,.6,f),l($.rFoot,.6,f),l($.spinePitch,-.12,f),l($.headPitch,-.45,f)}}swingPose(e,t,n){let r=t.swingAngle,i=t.stateTime,a=Y(1.2,4,q(t.tension/(K.physics.mass*K.physics.gravity),0,6)),o=Y(-4,-35,r),s=Y(2,14,r),c=Y(.7,.95,t.swingPhase)*+(t.vel.y>-1),l=t.swingTuck;this.tuckW+=(l-this.tuckW)*il(16,e);let u=this.tuckW,d=1-Y(.05,.3,i),f=this.webHand===`R`?`l`:`r`,p=-.18,m=.05,h=.3,g=.55;p=J(p,-.55,o),m=J(m,-.2,o),h=J(h,.75,o),g=J(g,1.05,o),p=J(p,.45,s*(1-u)),m=J(m,.25,s*(1-u)),p=J(p,1.6,u),m=J(m,1.45,u),h=J(h,2,u),g=J(g,1.85,u),p=J(p,1.15,c*(1-u)),m=J(m,.95,c*(1-u)),h=J(h,.35,c*(1-u)),g=J(g,.5,c*(1-u)),p=J(p,.8,d*.7),m=J(m,.4,d*.7),h=J(h,1.3,d*.7),g=J(g,1,d*.7),h+=a*.12*(1-u),g+=a*.1*(1-u),n[$.lThigh]=p,n[$.rThigh]=m,n[$.lKnee]=h,n[$.rKnee]=g,n[$.lAbduct]=.08+.1*o,n[$.rAbduct]=.06+.05*u,n[$.lFoot]=.45+.2*o,n[$.rFoot]=.35,n[$.spinePitch]=-.22*o+.4*u-.08*c+.1*a*(1-o),n[$.chestPitch]=-.12*o+.15*u+.08*a;let _=this.webHand===`R`?-1:1;n[$.chestYaw]=.14*_,n[Pp.chestRoll]=-.1*_;let v=q(this.swingSide*.012,-.35,.35);n[$.spineRoll]=v,n[$.hipRoll]=v*.6,n[$.headPitch]=-.1+.15*a+.1*u-.2*c;let y=2.7,b=.25,x=.12,S=J(.25,-.35,o),C=J(.95,1.2,o),w=J(.55,.35,o);S=J(S,.95,u),C=J(C,.45,u),w=J(w,1.55,u),S=J(S,2.3,c),C=J(C,.4,c),w=J(w,.35,c),C-=a*.2,f===`l`?(n[$.lShoulder]=S,n[$.lArmOut]=C,n[$.lElbow]=w,n[$.rShoulder]=y,n[$.rArmOut]=b,n[$.rElbow]=x):(n[$.rShoulder]=S,n[$.rArmOut]=C,n[$.rElbow]=w,n[$.lShoulder]=y,n[$.lArmOut]=b,n[$.lElbow]=x)}tuck(e,t){t<=0||(e[$.lThigh]=J(e[$.lThigh],1.95,t),e[$.rThigh]=J(e[$.rThigh],1.85,t),e[$.lKnee]=J(e[$.lKnee],2.4,t),e[$.rKnee]=J(e[$.rKnee],2.35,t),e[$.lAbduct]=J(e[$.lAbduct],.12,t),e[$.rAbduct]=J(e[$.rAbduct],.12,t),e[$.lShoulder]=J(e[$.lShoulder],.95,t),e[$.rShoulder]=J(e[$.rShoulder],.9,t),e[$.lArmOut]=J(e[$.lArmOut],.3,t),e[$.rArmOut]=J(e[$.rArmOut],.3,t),e[$.lElbow]=J(e[$.lElbow],1.9,t),e[$.rElbow]=J(e[$.rElbow],1.9,t),e[$.spinePitch]=J(e[$.spinePitch],.75,t),e[$.headPitch]=J(e[$.headPitch],.35,t))}crouch(e,t){e[$.hipY]=J(e[$.hipY],-.42,t),e[$.lThigh]=J(e[$.lThigh],1.7,t),e[$.rThigh]=J(e[$.rThigh],1.7,t),e[$.lKnee]=J(e[$.lKnee],2.3,t),e[$.rKnee]=J(e[$.rKnee],2.3,t),e[$.lAbduct]=J(e[$.lAbduct],.25,t),e[$.rAbduct]=J(e[$.rAbduct],.25,t),e[$.lFoot]=J(e[$.lFoot],-.6,t),e[$.rFoot]=J(e[$.rFoot],-.6,t),e[$.spinePitch]=J(e[$.spinePitch],.55,t),e[$.headPitch]=J(e[$.headPitch],-.35,t)}wallSideLeft(e){let t=sl(e.vel);if(t<.5)return!0;let n=-e.vel.z/t,r=e.vel.x/t;return e.wallNormal.x*n+e.wallNormal.z*r<0}orient(e,t){let n=this._f.set(-Math.sin(t.facing),0,-Math.cos(t.facing)),r=this._u.copy(Lp),i=sl(t.vel),a=t.vel.length(),o=this._o.set(0,0,0),s=12;switch(t.state){case`Grounded`:case`Vaulting`:case`Recovery`:{let e=this._t.set(t.acc.x,0,t.acc.z),n=e.length();n>22&&e.multiplyScalar(22/n),e.multiplyScalar(.017*Y(.5,4,i)),r.add(e).normalize(),s=10;break}case`Swinging`:{let i=this._t.subVectors(t.anchor,t.pos).normalize(),o=this._v.copy(t.acc).addScaledVector(Lp,K.physics.gravity);o.lengthSq()>1?r.copy(i).lerp(o.normalize(),.2).normalize():r.copy(i),a>1&&n.copy(t.vel).normalize();let c=this._l.crossVectors(r,n).normalize();this.swingSide+=(q(t.acc.dot(c),-40,40)-this.swingSide)*il(6,e),s=9;break}case`WebZip`:{let e=this._t.subVectors(t.zipTarget,t.pos).normalize();r.lerp(e,.7).normalize(),a>1&&n.copy(t.vel).normalize(),s=12;break}case`Airborne`:case`Trick`:case`PointLaunch`:case`Landing`:if(a>2){let e=this._t.copy(t.vel).normalize(),a=Math.max(this.diveW*.92,Y(-10,-35,t.vel.y)*.5),o=t.state===`PointLaunch`?.6:Y(4,16,t.vel.y)*.3,s=this.relT,c=this.relKind===`spread`?Y(0,.12,s)*(1-Y(.45,.95,s))*.45*this.relStrength:0,l=t.state===`Landing`?0:Math.max(a,o,c);r.lerp(e,l).normalize(),i>1&&n.set(t.vel.x/i,0,t.vel.z/i)}s=t.state===`Landing`?14:7;break;case`WallRunning`:{let e=t.wallNormal,a=(t.wallMode===`vertical`?62:52)*(Math.PI/180),c=Math.cos(a),l=Math.sin(a);r.set(e.x*l,c,e.z*l),t.wallMode===`vertical`?n.set(-e.x*c,l,-e.z*c):i>1&&n.set(t.vel.x/i,0,t.vel.z/i),o.set(e.x,0,e.z).multiplyScalar(.84*l-zp+.02),s=13;break}case`WallCrawling`:{let e=t.wallNormal;n.set(-e.x,0,-e.z),r.set(e.x*.12,1,e.z*.12).normalize(),o.set(-e.x,0,-e.z).multiplyScalar(.12),s=12;break}}let c=this._p.copy(n).addScaledVector(r,-n.dot(r));c.lengthSq()<1e-6&&c.set(0,0,1).addScaledVector(r,-r.z),c.normalize();let l=this._l.crossVectors(r,c).normalize();this.m4.makeBasis(l,r,c),this.targetQuat.setFromRotationMatrix(this.m4),this.bodyQuat.dot(this.targetQuat)<0&&this.targetQuat.set(-this.targetQuat.x,-this.targetQuat.y,-this.targetQuat.z,-this.targetQuat.w),this.prevBodyQuat.copy(this.bodyQuat),this.bodyQuat.slerp(this.targetQuat,il(s,e)),this.rootOffset.lerp(o,il(10,e));let u=this.rig.root;u.position.copy(t.pos).add(this.rootOffset),this.spin.active&&this.lastState===`Landing`&&(u.position.y-=.42*Math.sin(Math.PI*q(this.spin.t/this.spin.dur,0,1))),u.quaternion.copy(this.bodyQuat).multiply(this.spinQuat)}secondary(e,t,n){let r=this._q.copy(this.prevBodyQuat).invert().multiply(this.bodyQuat),i=r.w<0?-1:1,a=1/Math.max(e,1e-4),o=q(2*r.x*i*a,-12,12),s=q(2*r.z*i*a,-12,12),c=this._q.copy(this.bodyQuat).invert(),l=this._v.copy(t.acc).applyQuaternion(c),u=q(l.z,-60,60),d=q(l.x,-60,60),f=t.state!==`Grounded`&&t.state!==`WallRunning`&&t.state!==`WallCrawling`&&t.state!==`Perching`&&t.state!==`Recovery`?1:.25,p=q((o*.1-u*.004)*f,-.55,.55);this.legLag.step(p,11,.42,e),this.legLagR.step(p*.8,9,.38,e),this.armLag.step(q((s*.08+d*.004)*f,-.4,.4),10,.45,e),n[$.lThigh]+=this.legLag.x,n[$.rThigh]+=this.legLagR.x,n[$.lKnee]+=Math.max(0,-this.legLag.x)*.5,n[$.rKnee]+=Math.max(0,-this.legLagR.x)*.5,n[$.lArmOut]+=this.armLag.x,n[$.rArmOut]-=this.armLag.x}applyPose(){let e=this.pose,t=this.rig;t.hips.position.y=.02+e[$.hipY],t.hips.rotation.set(e[$.hipPitch],e[$.hipYaw],e[$.hipRoll],`YXZ`),t.spine.rotation.set(e[$.spinePitch],e[$.spineYaw],e[$.spineRoll],`YXZ`),t.chest.rotation.set(e[$.chestPitch],e[$.chestYaw],e[Pp.chestRoll],`YXZ`),t.neck.rotation.set(e[$.neckPitch],0,0),t.head.rotation.set(e[$.headPitch],e[$.headYaw],e[Pp.headRoll],`YXZ`),t.thighL.rotation.set(-e[$.lThigh],0,e[$.lAbduct],`ZXY`),t.thighR.rotation.set(-e[$.rThigh],0,-e[$.rAbduct],`ZXY`),t.shinL.rotation.set(e[$.lKnee],0,0),t.shinR.rotation.set(e[$.rKnee],0,0),t.footL.rotation.set(e[$.lFoot],0,0),t.footR.rotation.set(e[$.rFoot],0,0),t.upperArmL.rotation.set(-e[$.lShoulder],e[$.lArmTwist],e[$.lArmOut],`ZXY`),t.upperArmR.rotation.set(-e[$.rShoulder],-e[$.rArmTwist],-e[$.rArmOut],`ZXY`),t.foreArmL.rotation.set(-e[$.lElbow],0,0),t.foreArmR.rotation.set(-e[$.rElbow],0,0),t.root.updateMatrixWorld(!0)}applyIK(e,t){let n=this.rig,r=t.state,i=r===`Swinging`&&t.ropeActive;i&&(this.reachT+=e,(this.webHand===`L`?this.ikTargetL:this.ikTargetR).copy(t.anchor));let a=Y(0,.1,this.reachT),o=i&&this.webHand===`L`?a:0,s=i&&this.webHand===`R`?a:0;this.ikL=o>=this.ikL?o:Math.max(o,this.ikL-e/.22),this.ikR=s>=this.ikR?s:Math.max(s,this.ikR-e/.22),this.ikL>0&&this.aimArm(n.upperArmL,n.foreArmL,n.handL,this.ikTargetL,1,Kp(this.ikL)),this.ikR>0&&this.aimArm(n.upperArmR,n.foreArmR,n.handR,this.ikTargetR,-1,Kp(this.ikR)),this.zipW=Gp(this.zipW,+(r===`WebZip`),e/(r===`WebZip`?.08:.2)),this.zipW>0&&(this.aimArm(n.upperArmR,n.foreArmR,n.handR,t.zipTarget,-1,Kp(this.zipW)*.95),this.aimArm(n.upperArmL,n.foreArmL,n.handL,t.zipTarget,1,Kp(this.zipW)*.75,.55));let c=this._f.set(-Math.sin(t.facing),0,-Math.cos(t.facing)),l=this._l.crossVectors(c,Lp).normalize();if(this.perchW=Gp(this.perchW,+(r===`Perching`),e/.2),this.perchW>0){let e=this._w.copy(t.pos).addScaledVector(Lp,-.86).addScaledVector(c,.36).addScaledVector(l,.14);this.reachPoint(n.upperArmR,n.foreArmR,n.handR,e,-1,Kp(this.perchW))}let u=r===`Recovery`?1-Y(.35,1,t.stateTime/K.landing.recoveryTime):0;if(this.recoverW=Gp(this.recoverW,u,e/.06),this.recoverW>0){let e=this._w.copy(t.pos).addScaledVector(Lp,-.86).addScaledVector(c,.5).addScaledVector(l,.2);this.reachPoint(n.upperArmR,n.foreArmR,n.handR,e,-1,Kp(this.recoverW))}this.crawlW=Gp(this.crawlW,+(r===`WallCrawling`),e/.22),this.crawlW>0&&this.crawlIK(e,t);let d=0;if(r===`Grounded`||r===`Perching`||r===`Airborne`&&this.diveW<.5&&!this.spin.active?(d=1,this.lookDir.copy(t.camForward)):r===`Swinging`&&t.vel.lengthSq()>4&&(d=.5,this.lookDir.copy(t.vel).normalize()),this.lookW+=(d-this.lookW)*il(6,e),this.lookW>.01){n.chest.getWorldQuaternion(this._q).invert();let e=this._t.copy(this.lookDir).applyQuaternion(this._q),t=q(Math.atan2(e.x,e.z),-.9,.9),r=q(-Math.asin(q(e.y,-1,1)),-.5,.6);n.head.rotation.y+=t*.6*this.lookW,n.head.rotation.x+=r*.5*this.lookW,n.head.updateMatrixWorld(!0)}}aimArm(e,t,n,r,i,a,o=.97){e.getWorldPosition(this._p);let s=this._t.subVectors(r,this._p),c=s.length();if(c<.001)return;s.multiplyScalar(1/c);let l=cp.UPPER_ARM+cp.FORE_ARM,u=this._v.copy(this._p).addScaledVector(s,Math.min(c,l*o));this.poleFor(i,.35,-.35,.3),Np(e,t,n,u,this._w,a)}reachPoint(e,t,n,r,i,a){e.getWorldPosition(this._p),this.poleFor(i,.5,-.2,.25),this._v.copy(r),Np(e,t,n,this._v,this._w,a)}poleFor(e,t,n,r){let i=this.rig.chest.getWorldQuaternion(this._q),a=this._l.set(1,0,0).applyQuaternion(i);this._w.copy(this._p).addScaledVector(a,e*t),this._w.addScaledVector(this._o.set(0,0,1).applyQuaternion(i),n),this._w.addScaledVector(this._o.set(0,1,0).applyQuaternion(i),-r)}static CRAWL_REST=[[-.3,.52],[.3,.52],[-.26,-.7],[.26,-.7]];crawlIdeal(t,n,r,i){let a=n.wallNormal,[o,s]=e.CRAWL_REST[t];return i.copy(n.pos).addScaledVector(a,-.43+(t<2?.06:.1)),i.x+=a.z*o,i.z+=-a.x*o,i.y+=s,i.addScaledVector(n.vel,r),i}initCrawl(e){this.crawlNormal.copy(e.wallNormal);for(let t=0;t<4;t++){let n=this.limbs[t];this.crawlIdeal(t,e,0,n.planted),n.stepping=!1,n.t=0}}crawlIK(e,t){let n=this.rig;if(t.state===`WallCrawling`){this.crawlNormal.dot(t.wallNormal)<.9&&this.initCrawl(t);let n=t.vel.length();this.crawlPhase+=e*n*4;let r=q(.26-n*.02,.13,.26),i=this._t;for(let e=0;e<2;e++){let n=e===0?0:1,r=e===0?3:2,a=e===0?[1,2]:[0,3];if(this.limbs[a[0]].stepping||this.limbs[a[1]].stepping||this.limbs[n].stepping||this.limbs[r].stepping)continue;let o=this.crawlIdeal(n,t,0,i).distanceTo(this.limbs[n].planted),s=this.crawlIdeal(r,t,0,i).distanceTo(this.limbs[r].planted);if(Math.max(o,s)>.2)for(let e of[n,r]){let n=this.limbs[e];n.from.copy(n.planted),this.crawlIdeal(e,t,.16,n.to),n.stepping=!0,n.t=0}}for(let i=0;i<4;i++){let a=this.limbs[i];if(!a.stepping)continue;a.t+=e/r,this.crawlIdeal(i,t,.16,a.to);let o=Y(0,1,a.t);a.planted.copy(a.from).lerp(a.to,o).addScaledVector(t.wallNormal,.12*Math.sin(Math.PI*q(a.t,0,1))),a.t>=1&&(a.stepping=!1,this.crawlIdeal(i,t,.16,a.planted),i===0&&this.maybeStep(!0,n))}}let r=Kp(this.crawlW),i=this.crawlNormal,a=n.chest.getWorldQuaternion(this._q),o=this._l.set(1,0,0).applyQuaternion(a);for(let[e,t,a,s,c]of[[0,n.upperArmL,n.foreArmL,n.handL,1],[1,n.upperArmR,n.foreArmR,n.handR,-1]])t.getWorldPosition(this._p),this._w.copy(this._p).addScaledVector(o,c*.6).addScaledVector(i,.35).addScaledVector(Lp,-.15),this._v.copy(this.limbs[e].planted),Np(t,a,s,this._v,this._w,r);let s=n.hips.getWorldQuaternion(this._q),c=this._l.set(1,0,0).applyQuaternion(s);for(let[e,t,a,o,s]of[[2,n.thighL,n.shinL,n.footL,1],[3,n.thighR,n.shinR,n.footR,-1]])t.getWorldPosition(this._p),this._w.copy(this._p).addScaledVector(c,s*.7).addScaledVector(i,.3).addScaledVector(Lp,.25),this._v.copy(this.limbs[e].planted),Np(t,a,o,this._v,this._w,r)}webHandPosition(e){return(this.webHand===`R`?this.rig.handR:this.rig.handL).getWorldPosition(e)}get POSE_SIZE(){return 28}debugPose(){return this.tmpPose.set(this.pose),this.tmpPose}get spinning(){return this.spin.active}};function Wp(e,t){e[$.lArmOut]+=.12*t,e[$.rArmOut]+=.12*t,e[$.lElbow]+=.15*t,e[$.rElbow]+=.15*t,e[$.lKnee]+=.05*t,e[$.rKnee]+=.05*t}function Gp(e,t,n){return e<t?Math.min(t,e+n):Math.max(t,e-n)}function Kp(e){return e*e*(3-2*e)}var qp=e=>e<0?0:e>1?1:e,Jp=(e,t,n)=>{let r=qp((n-e)/(t-e));return r*r*(3-2*r)};function Yp(e){let t=qp((e-3)/82);return .5*t**.9+.5*t*t*(3-2*t)}function Xp(e){return 220*(1+30*qp((e-3)/82)**1.3)}function Zp(e,t){return qp(.8*Jp(30,80,e)+(t?.45*Jp(10,50,e):0))}function Qp(e){return qp((e-150)/16e3)**.6}function $p(e){return 38+70*Math.sqrt(qp(e/16e3))}function em(e){return Jp(2,45,e)}function tm(e){return 1-.85*Jp(15,220,e)}function nm(e){return .5-.5*Math.cos(2*Math.PI*e)}var rm=24,im=3,am=(e,t)=>e*(1+(Math.random()*2-1)*t),om=(e,t)=>e+Math.random()*(t-e);function sm(){let e=globalThis;return e.AudioContext??e.webkitAudioContext??null}var cm=class{masterVolume=.8;muted=!1;ctx=null;master=null;sfx=null;amb=null;white=null;pink=null;brown=null;L=null;loops=[];voices=[];gust=0;gustTarget=0;gustTimer=0;hornTimer=om(8,20);sirenTimer=om(30,70);droneTimer=0;sWind=0;sWhistle=0;sTension=0;sCloth=0;sCity=0;sTraffic=0;sCrowd=0;sDropped=0;constructor(){}start(){try{if(this.ctx){this.ctx.state===`suspended`&&this.ctx.resume().catch(()=>{});return}let e=sm();if(!e)return;this.ctx=new e,this.build(this.ctx),this.ctx.state===`suspended`&&this.ctx.resume().catch(()=>{})}catch{this.teardown()}}get running(){return!!this.ctx&&this.ctx.state===`running`}update(e,t){let n=this.ctx,r=this.L;if(n&&r&&this.master)try{this.tick(n,r,Math.min(Math.max(e,0),.1),t)}catch{}}onEvent(e,t){if(this.ctx&&this.sfx)try{this.play(e,t)}catch{}}honk(e){if(this.ctx&&this.amb)try{this.horn(Math.max(0,1-e/120)*1.6)}catch{}}stats(){return{voices:this.voices.length,dropped:this.sDropped,wind:this.sWind,whistle:this.sWhistle,tension:this.sTension,cloth:this.sCloth,city:this.sCity,traffic:this.sTraffic,crowd:this.sCrowd,running:+!!this.running}}dispose(){try{for(let e of this.voices)this.kill(e);this.voices.length=0;for(let e of this.loops)try{e.stop()}catch{}this.loops.length=0,this.ctx&&this.ctx.close().catch(()=>{})}catch{}this.teardown()}teardown(){this.ctx=null,this.master=this.sfx=this.amb=null,this.white=this.pink=this.brown=null,this.L=null}build(e){this.makeNoise(e);let t=e.createDynamicsCompressor();t.threshold.value=-18,t.knee.value=12,t.ratio.value=4,t.attack.value=.004,t.release.value=.2,this.master=e.createGain(),this.master.gain.value=this.muted?0:this.masterVolume,t.connect(this.master).connect(e.destination),this.sfx=e.createGain(),this.amb=e.createGain(),this.sfx.connect(t),this.amb.connect(t),this.L=this.buildLayers(e,this.amb,this.sfx)}makeNoise(e){let t=Math.floor(e.sampleRate*im);this.white=e.createBuffer(1,t,e.sampleRate),this.pink=e.createBuffer(1,t,e.sampleRate),this.brown=e.createBuffer(1,t,e.sampleRate);let n=this.white.getChannelData(0),r=this.pink.getChannelData(0),i=this.brown.getChannelData(0),a=0,o=0,s=0,c=0,l=0,u=0,d=0,f=0;for(let e=0;e<t;e++){let t=Math.random()*2-1;n[e]=t,a=.99886*a+t*.0555179,o=.99332*o+t*.0750759,s=.969*s+t*.153852,c=.8665*c+t*.3104856,l=.55*l+t*.5329522,u=-.7616*u-t*.016898,r[e]=(a+o+s+c+l+u+d+t*.5362)*.11,d=t*.115926,f=(f+.02*t)/1.02,i[e]=f*3.5}let p=Math.min(2048,t>>2);for(let e of[n,r,i])for(let n=0;n<p;n++){let r=n/p;e[t-p+n]=e[t-p+n]*(1-r)+e[n]*r}}loop(e,t=1){let n=this.ctx.createBufferSource();return n.buffer=e,n.loop=!0,n.playbackRate.value=t,n.start(0,Math.random()*e.duration),this.loops.push(n),n}lfo(e,t,n,r){let i=this.ctx,a=i.createOscillator();a.type=e,a.frequency.value=t;let o=i.createGain();return o.gain.value=n,a.connect(o).connect(r),a.start(),this.loops.push(a),a}filter(e,t,n){let r=this.ctx.createBiquadFilter();return r.type=e,r.frequency.value=t,r.Q.value=n,r}gain(e){let t=this.ctx.createGain();return t.gain.value=e,t}buildLayers(e,t,n){let r=this.white,i=this.pink,a=this.brown,o=this.gain(0);o.connect(n);let s=this.filter(`lowpass`,300,.5),c=this.filter(`lowpass`,320,.5),l=this.gain(.8),u=this.gain(.8),d=e.createStereoPanner(),f=e.createStereoPanner();d.pan.value=-.55,f.pan.value=.55,this.loop(i,.97).connect(s).connect(l).connect(d).connect(o),this.loop(i,1.03).connect(c).connect(u).connect(f).connect(o),this.lfo(`sine`,.13,.2,l.gain),this.lfo(`sine`,.21,.2,u.gain),this.lfo(`sine`,.07,.25,d.pan);let p=this.filter(`bandpass`,1800,9),m=this.gain(0);this.loop(r).connect(p).connect(m).connect(n),this.lfo(`sine`,.31,260,p.detune),this.lfo(`triangle`,.09,120,p.detune);let h=this.filter(`bandpass`,650,5),g=this.gain(.5),_=this.gain(0);this.loop(a,1.4).connect(h).connect(g).connect(_).connect(n);let v=this.lfo(`square`,8,.5,g.gain),y=this.filter(`lowpass`,260,2),b=this.gain(0),x=e.createOscillator(),S=e.createOscillator();x.type=`sawtooth`,S.type=`sawtooth`,x.frequency.value=45,S.frequency.value=45.6,x.connect(y),S.connect(y),y.connect(b).connect(n),x.start(),S.start(),this.loops.push(x,S);let C=this.gain(.5),w=this.gain(0);this.loop(r,.9).connect(this.filter(`bandpass`,1100,.9)).connect(C).connect(w).connect(n);let T=this.lfo(`sine`,7,.3,C.gain),E=this.lfo(`triangle`,11.3,.22,C.gain),D=this.filter(`lowpass`,500,.3),O=this.gain(0);this.loop(a).connect(D).connect(O).connect(t);let k=this.gain(0);this.loop(i,.8).connect(this.filter(`highpass`,2500,.4)).connect(k).connect(t);let A=this.gain(0);A.connect(t),this.loop(a,.7).connect(this.filter(`lowpass`,170,.6)).connect(A);let j=e.createOscillator();j.type=`sawtooth`,j.frequency.value=41,j.connect(this.filter(`lowpass`,110,1)).connect(this.gain(.12)).connect(A),j.start(),this.loops.push(j),this.lfo(`sine`,.05,3,j.frequency);let M=this.gain(0);this.loop(r,.85).connect(this.filter(`bandpass`,2300,.7)).connect(M).connect(t);let N=this.gain(0);N.connect(t);let ee=this.loop(i,1.1),P=[],F=[];for(let[e,t]of[[330,4],[520,5],[780,4],[1250,3],[2100,3]]){let n=this.gain(.3),r=this.filter(`bandpass`,e,t);this.lfo(`sine`,om(.1,.3),e*.06,r.frequency),ee.connect(r).connect(n).connect(N),P.push(n),F.push(Math.random()*.3)}return{windGain:o,windLpL:s,windLpR:c,whistleGain:m,whistleBp:p,creakGain:_,creakBp:h,creakLfo:v,strainGain:b,strainA:x,strainB:S,clothGain:w,clothLfoA:T,clothLfoB:E,cityGain:O,cityLp:D,airGain:k,trafficGain:A,hissGain:M,drone:j,crowdGain:N,crowdVoices:P,crowdTimers:F}}tick(e,t,n,r){let i=e.currentTime,a=r.speed>0?r.speed:0,o=tm(r.altitude),s=1-o,c=nm(r.timeOfDay);this.master.gain.setTargetAtTime(this.muted?0:qp(this.masterVolume),i,.05),this.gustTimer-=n,this.gustTimer<=0&&(this.gustTimer=om(.8,2.5),this.gustTarget=Math.random()*2-1),this.gust+=(this.gustTarget-this.gust)*(1-Math.exp(-1.2*n));let l=Math.max(Yp(a),.05+.12*s)*(1+.12*this.gust);t.windGain.gain.setTargetAtTime(l*.7,i,.12);let u=Xp(a)*(r.diving?1.25:1)*(1+.1*this.gust);t.windLpL.frequency.setTargetAtTime(u,i,.15),t.windLpR.frequency.setTargetAtTime(u*1.07,i,.15);let d=Zp(a,r.diving);t.whistleGain.gain.setTargetAtTime(d*.12,i,.25),t.whistleBp.frequency.setTargetAtTime(1400+20*a+(r.diving?700:0),i,.3),this.sWind=l,this.sWhistle=d;let f=r.ropeActive?Qp(r.ropeTension):0,p=qp(r.ropeTension/16e3);if(t.creakGain.gain.setTargetAtTime(f*.2,i,f>this.sTension?.03:.1),t.strainGain.gain.setTargetAtTime(f*.1,i,.06),f>0){let e=$p(r.ropeTension);t.strainA.frequency.setTargetAtTime(e,i,.05),t.strainB.frequency.setTargetAtTime(e*1.013,i,.05),t.creakLfo.frequency.setTargetAtTime(5+20*p,i,.1),t.creakBp.frequency.setTargetAtTime(450+900*p,i,.1)}this.sTension=f;let m=em(a)*(r.state===`Grounded`?.3:1);t.clothGain.gain.setTargetAtTime(m*.12,i,.15),t.clothLfoA.frequency.setTargetAtTime(5+.35*a,i,.2),t.clothLfoB.frequency.setTargetAtTime(8.3+.5*a,i,.2),this.sCloth=m;let h=.16*(.3+.7*o)*(.6+.4*c);t.cityGain.gain.setTargetAtTime(h,i,.5),t.cityLp.frequency.setTargetAtTime(160+440*o*(.6+.4*c),i,.5),t.airGain.gain.setTargetAtTime(.025*s,i,.8),this.sCity=h;let g=qp(r.nearbyTraffic)*o*o;t.trafficGain.gain.setTargetAtTime(g*.25,i,.4),t.hissGain.gain.setTargetAtTime(g*.04,i,.4),this.droneTimer-=n,this.droneTimer<=0&&(this.droneTimer=om(1.5,4),t.drone.frequency.setTargetAtTime(om(36,52),i,1.2)),this.sTraffic=g;let _=qp(r.nearbyCrowd)*o*o*(.4+.6*c);t.crowdGain.gain.setTargetAtTime(_*.35,i,.5);for(let e=0;e<t.crowdVoices.length;e++)t.crowdTimers[e]-=n,t.crowdTimers[e]<=0&&(t.crowdTimers[e]=om(.12,.45),t.crowdVoices[e].gain.setTargetAtTime(Math.random()<.25?.05:om(.2,.6),i,.06));this.sCrowd=_,this.hornTimer-=n,this.hornTimer<=0&&(this.hornTimer=om(7,22)/(.3+.7*c),Math.random()<.3+.6*o*(.3+.7*qp(r.nearbyTraffic+.3))&&this.horn(o)),this.sirenTimer-=n,this.sirenTimer<=0&&(this.sirenTimer=om(35,90)*(.6+.4*c),Math.random()<.6&&this.siren(o));for(let e=this.voices.length-1;e>=0;e--){let t=this.voices[e];t.end<i&&(this.kill(t),this.voices.splice(e,1))}}horn(e){let t=this.voice(om(-.9,.9),.03*(.35+.65*e),this.amb);if(!t)return;let n=this.ctx,r=n.currentTime+.02,i=om(300,460),a=this.filter(`lowpass`,700+900*e,.7);a.connect(t.out);let o=Math.random()<.4?2:1;for(let e=0;e<o;e++){let s=r+e*om(.25,.4),c=e===0&&o===1?om(.3,.8):om(.15,.25);for(let e of[1,1.26]){let r=n.createOscillator();r.type=`square`,r.frequency.value=i*e;let o=n.createGain();o.gain.setValueAtTime(0,s),o.gain.linearRampToValueAtTime(.5,s+.02),o.gain.setValueAtTime(.5,s+c),o.gain.linearRampToValueAtTime(0,s+c+.05),r.connect(o).connect(a),r.start(s),r.stop(s+c+.07),t.srcs.push(r),t.end=Math.max(t.end,s+c+.1)}}}siren(e){let t=this.voice(om(-1,1),.02*(.4+.6*e),this.amb);if(!t)return;let n=this.ctx,r=n.currentTime+.02,i=om(6,10),a=n.createOscillator();a.type=`triangle`,a.frequency.value=om(850,1e3);let o=Math.random()<.7,s=n.createOscillator();s.type=o?`sine`:`triangle`,s.frequency.value=o?om(.2,.35):om(2.5,3.5);let c=n.createGain();c.gain.value=o?320:220,s.connect(c).connect(a.frequency);let l=n.createGain();l.gain.setValueAtTime(0,r),l.gain.linearRampToValueAtTime(1,r+i*.35),l.gain.linearRampToValueAtTime(0,r+i),a.connect(this.filter(`lowpass`,1400,.5)).connect(l).connect(t.out);for(let e of[a,s])e.start(r),e.stop(r+i+.05),t.srcs.push(e);t.end=r+i+.1}voice(e,t,n=this.sfx){let r=this.ctx;if(!r||!n)return null;this.voices.length>=rm&&(this.kill(this.voices.shift()),this.sDropped++);let i=r.createGain();i.gain.value=t;let a=r.createStereoPanner();a.pan.value=e<-1?-1:e>1?1:e,i.connect(a).connect(n);let o={srcs:[],out:i,pan:a,end:r.currentTime+.05};return this.voices.push(o),o}kill(e){for(let t of e.srcs)try{t.stop()}catch{}e.out.disconnect(),e.pan.disconnect()}env(e,t,n,r){let i=this.ctx.createGain();return i.gain.setValueAtTime(0,e),i.gain.linearRampToValueAtTime(Math.max(r,2e-4),e+t),i.gain.exponentialRampToValueAtTime(1e-4,e+n),i}noise(e,t,n,r,i,a,o,s,c,l=.004){let u=this.ctx,d=u.createBufferSource();d.buffer=t,d.playbackRate.value=om(.9,1.1);let f=u.createBiquadFilter();f.type=i,f.Q.value=s,f.frequency.setValueAtTime(Math.max(20,a),n),f.frequency.exponentialRampToValueAtTime(Math.max(20,o),n+r),d.connect(f).connect(this.env(n,l,r,c)).connect(e.out),d.start(n,Math.random()*Math.max(0,t.duration-r-.1)),d.stop(n+r+.02),e.srcs.push(d),e.end=Math.max(e.end,n+r+.05)}tone(e,t,n,r,i,a,o,s=.002){let c=this.ctx.createOscillator();c.type=t,c.frequency.setValueAtTime(Math.max(1,i),n),c.frequency.exponentialRampToValueAtTime(Math.max(1,a),n+r),c.connect(this.env(n,s,r,o)).connect(e.out),c.start(n),c.stop(n+r+.02),e.srcs.push(c),e.end=Math.max(e.end,n+r+.05)}place(e,t){let n=e.pos.x-t.camPos.x,r=e.pos.z-t.camPos.z,i=Math.hypot(n,r,e.pos.y-t.camPos.y),a=Math.hypot(t.camForward.x,t.camForward.z)||1,o=-t.camForward.z/a,s=t.camForward.x/a,c=(n*o+r*s)/Math.max(i,1)*.6*Jp(.5,4,i);return[Number.isFinite(c)?c:0,1/(1+Math.max(0,i-6)/40)]}play(e,t){let n=this.white,r=this.pink,i=this.brown,[a,o]=this.place(e,t),s=this.ctx.currentTime+.005,c=Number.isFinite(e.a)?e.a:0,l;switch(e.type){case`webFire`:case`zip`:{let t=e.type===`zip`;if(!(l=this.voice(a,o)))return;let i=am(1,.08),c=t?.16:am(.09,.15);this.noise(l,n,s,c,`bandpass`,4600*i,850*i,am(6,.2),.55,.002),this.tone(l,`sine`,s,.018,2800*i,1300*i,.12,.001),this.tone(l,`sine`,s,.06,190*i,90,.18),t&&this.noise(l,r,s+.08,.35,`bandpass`,500,2600,2,.22,.05);return}case`webAttach`:if(!(l=this.voice(a,o*.7)))return;this.noise(l,n,s,.03,`highpass`,3e3,1800,.7,.18),this.tone(l,`triangle`,s,.08,am(420,.1),300,.08);return;case`webRelease`:{let e=qp(c);if(!(l=this.voice(a,o)))return;this.noise(l,r,s,.3+.2*e,`bandpass`,380,1e3+2200*e,1.2,.14+.3*e,.06);return}case`webFail`:if(!(l=this.voice(a,o)))return;this.tone(l,`sine`,s,.05,300,170,.2),this.noise(l,i,s,.04,`lowpass`,500,300,.7,.18);return;case`footstep`:{let e=qp(c/12);if(!(l=this.voice(a,o*am(1,.15))))return;this.noise(l,i,s,am(.08,.2),`lowpass`,am(320,.2),110,.8,.25+.2*e),this.tone(l,`sine`,s,.07,am(95,.12),50,.14+.1*e),this.noise(l,n,s,.025,`highpass`,3500,2500,.7,.04+.04*e);return}case`wallStep`:case`wallRun`:if(!(l=this.voice(a,o*(e.type===`wallRun`?1.2:am(.9,.15)))))return;this.noise(l,n,s,am(.05,.2),`bandpass`,am(1900,.15),1100,2,.16),this.tone(l,`sine`,s,.015,am(1400,.1),900,.05);return;case`land`:{let e=qp(c/20);if(!(l=this.voice(a,o)))return;this.noise(l,i,s,.18+.1*e,`lowpass`,400+300*e,100,.8,.3+.4*e),this.tone(l,`sine`,s,.2,110,45,.1+.3*e),this.noise(l,r,s+.02,.15,`bandpass`,1500,900,1,.1);return}case`roll`:if(!(l=this.voice(a,o)))return;this.noise(l,i,s,.16,`lowpass`,500,110,.8,.35),this.noise(l,r,s+.03,.4,`bandpass`,900,1500,1.4,.22,.05),this.noise(l,r,s+.22,.35,`bandpass`,1400,700,1.4,.16,.04),this.tone(l,`sine`,s+.25,.1,80,50,.1);return;case`hardLand`:{if(!(l=this.voice(a,o)))return;let e=qp(c/35);this.tone(l,`sine`,s,.75,72,26,.7+.3*e,.003),this.noise(l,i,s,.5,`lowpass`,900,80,.9,.6+.2*e),this.noise(l,n,s,.12,`bandpass`,2600,700,1.5,.35),this.noise(l,n,s+.03,.28,`highpass`,4e3,1800,.6,.12,.01),this.duck(.35,.18);return}case`jump`:if(!(l=this.voice(a,o)))return;this.noise(l,n,s,.05,`bandpass`,1500,700,1.5,.12),this.noise(l,r,s,.22,`bandpass`,500,1400,1.2,.14,.03);return;case`superJump`:if(!(l=this.voice(a,o)))return;this.tone(l,`sine`,s,.3,55,130,.35,.005),this.noise(l,i,s,.15,`lowpass`,600,120,.8,.35),this.noise(l,r,s,.6,`bandpass`,300,2800,1.3,.4,.05);return;case`pointLaunch`:if(!(l=this.voice(a,o)))return;this.tone(l,`triangle`,s,.3,am(230,.05),170,.08),this.tone(l,`sine`,s,.5,80,220,.2,.05),this.noise(l,r,s,.95,`bandpass`,250,3600,1.5,.45,.15),this.noise(l,n,s+.25,.6,`highpass`,1500,5e3,.5,.08,.2);return;case`wallJump`:if(!(l=this.voice(a,o)))return;this.noise(l,n,s,.07,`bandpass`,1400,600,1.8,.2),this.noise(l,r,s+.02,.26,`bandpass`,600,1700,1.2,.16,.04);return;case`vault`:case`mantle`:if(!(l=this.voice(a,o)))return;this.noise(l,n,s,am(.09,.2),`bandpass`,2200,1400,1.5,.18),this.noise(l,r,s,.12,`lowpass`,600,250,.7,.12),e.type===`mantle`&&this.noise(l,n,s+.13,.1,`bandpass`,1800,1200,1.5,.12);return;case`trick`:if(!(l=this.voice(a,o)))return;this.noise(l,r,s,.28,`bandpass`,550,1900,2,.24,.08),this.noise(l,r,s+.22,.3,`bandpass`,1900,600,2,.2,.03);return;case`perch`:if(!(l=this.voice(a,o)))return;this.tone(l,`sine`,s,.035,520,300,.12),this.noise(l,n,s,.02,`bandpass`,3e3,2400,2,.06);return;case`cornerWrap`:if(!(l=this.voice(a,o*.6)))return;this.tone(l,`triangle`,s,.22,am(150,.08),110,.05,.02);return;case`state`:return}}duck(e,t){let n=this.amb,r=this.ctx;if(!n||!r)return;let i=r.currentTime;n.gain.cancelScheduledValues(i),n.gain.setTargetAtTime(e,i,.02),n.gain.setTargetAtTime(1,i+t,.5)}},lm=[0,1,0,-1],um=[-1,0,1,0],dm={nsGreen:22,ewGreen:16,amber:3,allRed:2,waveSpeed:11},fm=class{city;nx;nz;nodeCount;nodeX;nodeZ;nodeOffset;timing;cycle;laneWidth;laneCount=0;roadLaneCount=0;p0x;p0z;p1x;p1z;p2x;p2z;len;kind;axis;node;dir;laneNo;turn;connIn;connOut;succStart;succCount;succ;constructor(e,t={}){this.city=e;let n=e.params;this.timing={...dm,...t};let r=this.timing;this.cycle=r.nsGreen+r.ewGreen+2*(r.amber+r.allRed),this.nx=e.avenueX.length,this.nz=e.streetZ.length,this.nodeCount=this.nx*this.nz,this.nodeX=new Float64Array(this.nodeCount),this.nodeZ=new Float64Array(this.nodeCount),this.nodeOffset=new Float64Array(this.nodeCount);let{x0:i,z0:a}=e.bounds;for(let t=0;t<this.nx;t++)for(let n=0;n<this.nz;n++){let o=t*this.nz+n;this.nodeX[o]=e.avenueX[t],this.nodeZ[o]=e.streetZ[n];let s=-(e.streetZ[n]-a)/r.waveSpeed-(e.avenueX[t]-i)/(r.waveSpeed*3);this.nodeOffset[o]=(s%this.cycle+this.cycle)%this.cycle}let o=.6;this.laneWidth=Math.min(3.4,(n.streetWidth/2-o)/1,(n.avenueWidth/2-o)/2);let s=[],c=new Int32Array(this.nodeCount*4*2).fill(-1),l=e=>e===0||e===2?2:1,u=e=>e===0||e===2?n.streetWidth/2:n.avenueWidth/2,d=(e,t)=>{let n=Math.floor(e/this.nz)+lm[t],r=e%this.nz+um[t];return n<0||r<0||n>=this.nx||r>=this.nz?-1:n*this.nz+r};for(let e=0;e<this.nodeCount;e++)for(let t=0;t<4;t++){let n=d(e,t);if(n<0)continue;let r=u(t),i=-um[t],a=lm[t];for(let u=0;u<l(t);u++){let l=o+(u+.5)*this.laneWidth,d=this.nodeX[e]+lm[t]*r+i*l,f=this.nodeZ[e]+um[t]*r+a*l,p=this.nodeX[n]-lm[t]*r+i*l,m=this.nodeZ[n]-um[t]*r+a*l;c[(e*4+t)*2+u]=s.length,s.push({ax:d,az:f,bx:p,bz:m,px:(d+p)/2,pz:(f+m)/2,qx:0,qz:0,kind:0,axis:t===0||t===2?0:1,node:n,dir:t,no:u,turn:0,cin:-1,cout:-1,succ:[]})}}this.roadLaneCount=s.length;for(let e=0;e<this.roadLaneCount;e++){let t=s[e],n=t.node,r=t.dir,i=t.no,a=l(r),o=d(n,r)>=0,f=(i,a,o)=>{let l=c[(n*4+i)*2+o];if(l<0)return;let d=s[l],f,p;a===0?(f=(t.bx+d.ax)/2,p=(t.bz+d.az)/2):a===3?(f=(t.bx+d.ax)/2+lm[r]*u(r),p=(t.bz+d.az)/2+um[r]*u(r)):lm[r]===0?(f=t.bx,p=d.az):(f=d.ax,p=t.bz),t.succ.push(s.length),s.push({ax:t.bx,az:t.bz,bx:d.ax,bz:d.az,px:f,pz:p,qx:0,qz:0,kind:1,axis:t.axis,node:n,dir:r,no:o,turn:a,cin:e,cout:l,succ:[l]})};o&&f(r,0,i),(i===a-1||!o)&&f(r+1&3,2,l(r+1&3)-1),(i===0||!o)&&f(r+3&3,1,0),t.succ.length===0&&f(r+2&3,3,0)}let f=this.laneCount=s.length;this.p0x=new Float64Array(f),this.p0z=new Float64Array(f),this.p1x=new Float64Array(f),this.p1z=new Float64Array(f),this.p2x=new Float64Array(f),this.p2z=new Float64Array(f),this.len=new Float64Array(f),this.kind=new Uint8Array(f),this.axis=new Uint8Array(f),this.dir=new Uint8Array(f),this.laneNo=new Uint8Array(f),this.turn=new Uint8Array(f),this.node=new Int32Array(f),this.connIn=new Int32Array(f),this.connOut=new Int32Array(f),this.succStart=new Int32Array(f),this.succCount=new Int32Array(f);let p=0;for(let e of s)p+=e.succ.length;this.succ=new Int32Array(p),p=0;for(let e=0;e<f;e++){let t=s[e];this.p0x[e]=t.ax,this.p0z[e]=t.az,this.p1x[e]=t.px,this.p1z[e]=t.pz,this.p2x[e]=t.bx,this.p2z[e]=t.bz,this.kind[e]=t.kind,this.axis[e]=t.axis,this.dir[e]=t.dir,this.laneNo[e]=t.no,this.turn[e]=t.turn,this.node[e]=t.node,this.connIn[e]=t.cin,this.connOut[e]=t.cout,this.succStart[e]=p,this.succCount[e]=t.succ.length;for(let e of t.succ)this.succ[p++]=e;let n=0,r=t.ax,i=t.az,a=t.kind===0?1:12;for(let e=1;e<=a;e++){let o=e/a,s=1-o,c=s*s*t.ax+2*s*o*t.px+o*o*t.bx,l=s*s*t.az+2*s*o*t.pz+o*o*t.bz;n+=Math.hypot(c-r,l-i),r=c,i=l}this.len[e]=n}}phase(e,t,n){let r=this.timing,i=(n+this.nodeOffset[e])%this.cycle;i<0&&(i+=this.cycle),t===1&&(i-=r.nsGreen+r.amber+r.allRed);let a=t===0?r.nsGreen:r.ewGreen;return i<0?2:i<a?0:i<a+r.amber?1:2}greenRemaining(e,t,n){let r=this.timing,i=(n+this.nodeOffset[e])%this.cycle;i<0&&(i+=this.cycle),t===1&&(i-=r.nsGreen+r.amber+r.allRed);let a=t===0?r.nsGreen:r.ewGreen;return i>=0&&i<a?a-i:0}signalCode(e,t){return this.kind[e]===1?0:this.phase(this.node[e],this.axis[e],t)}signalStateFor(e,t){let n=this.signalCode(e,t);return n===0?`green`:n===1?`amber`:`red`}sample(e,t,n,r){let i=t/this.len[e];i=i<0?0:i>1?1:i;let a=1-i,o=this.p0x[e],s=this.p0z[e],c=this.p1x[e],l=this.p1z[e],u=this.p2x[e],d=this.p2z[e];n[r]=a*a*o+2*a*i*c+i*i*u,n[r+1]=a*a*s+2*a*i*l+i*i*d;let f=a*(c-o)+i*(u-c),p=a*(l-s)+i*(d-l);n[r+2]=Math.atan2(f,p)}roadLane(e,t,n){for(let r=0;r<this.roadLaneCount;r++)if(this.dir[r]===t&&this.laneNo[r]===n&&this.nodeOfStart(r)===e)return r;return-1}nodeOfStart(e){let t=this.dir[e],n=Math.floor(this.node[e]/this.nz)-lm[t],r=this.node[e]%this.nz-um[t];return n*this.nz+r}},pm=1.6,mm=2.6,hm=1.25,gm=2.2,_m=.6,vm=6.5,ym=.4,bm=90,xm=32,Sm=class{graph;count;lane;s;v;v0;length;color;next;go;lod;yielding;transforms;activeCount=0;tick=0;rng;acc;honkCd;vNew;adv;upd;laneStart;laneCnt;order;rank;claimConn;claimCnt;gx0;gz0;gw;gh;cellHead;cellNext;honkBuf=new Float32Array(64);honkN=0;nearR2;midR2;constructor(e,t={}){this.graph=e;let n=this.count=t.cars??220;this.rng=new ll((t.seed??4242)^31295),this.nearR2=(t.nearRadius??250)**2,this.midR2=(t.midRadius??500)**2,this.lane=new Int32Array(n),this.s=new Float64Array(n),this.v=new Float32Array(n),this.v0=new Float32Array(n),this.length=new Float32Array(n),this.color=new Uint8Array(n),this.next=new Int32Array(n),this.go=new Uint8Array(n),this.lod=new Uint8Array(n),this.yielding=new Uint8Array(n),this.transforms=new Float32Array(n*3),this.acc=new Float32Array(n),this.honkCd=new Float32Array(n),this.vNew=new Float32Array(n),this.adv=new Float32Array(n),this.upd=new Uint8Array(n);let r=e.laneCount;this.laneStart=new Int32Array(r),this.laneCnt=new Int32Array(r),this.order=new Int32Array(n),this.rank=new Int32Array(n),this.claimConn=new Int32Array(r).fill(-1),this.claimCnt=new Int32Array(r);let i=e.city.bounds;this.gx0=i.x0,this.gz0=i.z0,this.gw=Math.ceil((i.x1-i.x0)/xm)+1,this.gh=Math.ceil((i.z1-i.z0)/xm)+1,this.cellHead=new Int32Array(this.gw*this.gh),this.cellNext=new Int32Array(n),this.spawn()}spawn(){let e=this.graph,t=this.rng,n=0;for(let r=0;n<this.count&&r<this.count*50;r++){let r=t.int(0,e.roadLaneCount-1),i=t.range(4.2,5.3),a=t.range(i,e.len[r]-i-6),o=!0;for(let e=0;e<n;e++)if(this.lane[e]===r&&Math.abs(this.s[e]-a)<(i+this.length[e])/2+6){o=!1;break}o&&(this.setCar(n,r,a,0),this.length[n]=i,this.v0[n]=t.range(10.5,15),this.v[n]=this.v0[n]*t.range(.3,.9),this.color[n]=t.int(0,255),this.honkCd[n]=t.range(0,3),n++)}if(n<this.count)throw Error(`TrafficSim: could only place ${n}/${this.count} cars`);this.buildIndex()}setCar(e,t,n,r){this.lane[e]=t,this.s[e]=n,this.v[e]=r,this.go[e]=0,this.acc[e]=0,this.next[e]=this.graph.kind[t]===0?this.chooseNext(t):-1,this.graph.sample(t,n,this.transforms,e*3)}chooseNext(e){let t=this.graph,n=t.succStart[e],r=t.succCount[e];if(r===1)return t.succ[n];let i=0;for(let e=0;e<r;e++)i+=Cm(t.turn[t.succ[n+e]]);let a=this.rng.next()*i;for(let e=0;e<r;e++)if(a-=Cm(t.turn[t.succ[n+e]]),a<=0)return t.succ[n+e];return t.succ[n+r-1]}buildIndex(){let e=this.count,t=this.laneCnt,n=this.laneStart,r=this.order;t.fill(0);for(let n=0;n<e;n++)t[this.lane[n]]++;let i=0;for(let e=0;e<t.length;e++)n[e]=i,i+=t[e],t[e]=0;for(let i=0;i<e;i++){let e=this.lane[i];r[n[e]+t[e]++]=i}for(let e=0;e<t.length;e++){let i=t[e];if(i<2)continue;let a=n[e];for(let e=a+1;e<a+i;e++){let t=r[e],n=this.s[t],i=e-1;for(;i>=a&&this.s[r[i]]>n;)r[i+1]=r[i],i--;r[i+1]=t}}for(let t=0;t<e;t++)this.rank[r[t]]=t;this.cellHead.fill(-1);let a=this.transforms;for(let t=0;t<e;t++){let e=this.cellOf(a[t*3],a[t*3+1]);this.cellNext[t]=this.cellHead[e],this.cellHead[e]=t}}cellOf(e,t){let n=Math.floor((e-this.gx0)/xm),r=Math.floor((t-this.gz0)/xm);return n=n<0?0:n>=this.gw?this.gw-1:n,r=r<0?0:r>=this.gh?this.gh-1:r,r*this.gw+n}rearRoom(e){if(this.laneCnt[e]===0)return this.graph.len[e];let t=this.order[this.laneStart[e]];return this.s[t]-this.length[t]/2}exitClear(e,t){let n=this.graph.connOut[e];return this.claimCnt[n]>0&&this.claimConn[n]!==e?!1:this.rearRoom(n)-this.claimCnt[n]*7>t+gm+1}update(e,t,n,r,i){let a=this.graph,o=this.count;this.tick++,this.buildIndex();let s=i!==null&&i.y<2.5,c=0;for(let l=0;l<o;l++){this.acc[l]+=e,this.upd[l]=0;let o=l*3,u=this.transforms[o]-n,d=this.transforms[o+1]-r,f=u*u+d*d,p=f<this.nearR2?0:f<this.midR2?1:2;this.lod[l]=p,p===0&&c++;let m=p===0?1:p===1?4:16;if((this.tick+l)%m!==0)continue;let h=this.acc[l];this.acc[l]=0,this.upd[l]=1,this.honkCd[l]-=h;let g=this.lane[l],_=this.s[l],v=this.v[l],y=this.length[l],b=a.kind[g]===0,x=this.v0[l],S=1e9,C=0,w=this.rank[l];if(w+1<this.laneStart[g]+this.laneCnt[g]){let e=this.order[w+1];S=this.s[e]-_-(this.length[e]+y)/2,C=this.v[e]}else{let e=a.len[g]-_,n=b?this.next[l]:a.succ[a.succStart[g]];for(let t=0;t<2&&e<bm;t++){if(this.laneCnt[n]>0){let t=this.order[this.laneStart[n]];S=e+this.s[t]-(this.length[t]+y)/2,C=this.v[t];break}if(e+=a.len[n],a.kind[n]!==0)n=a.succ[a.succStart[n]];else break}if(b){let e=a.len[g]-_-y/2-ym,n=a.signalCode(g,t),r=this.exitClear(this.next[l],y);n===0?this.go[l]=r||this.go[l]===1&&e<v*v/8?1:0:n===1?this.go[l]=+(this.go[l]===1&&e<v*v/7):this.go[l]=+(this.go[l]===1&&e<v*v/18+.3),this.go[l]===0&&e<S&&(S=e,C=0)}}if(b){if(a.turn[this.next[l]]!==0){let e=Math.max(0,a.len[g]-_);x=Math.min(x,Math.sqrt(vm*vm+3*e))}}else a.turn[g]!==0&&(x=Math.min(x,vm));if(this.yielding[l]=0,s){let e=this.transforms[o+2],t=Math.sin(e),n=Math.cos(e);for(let e=0;e<2;e++){let r=i.x+(e===1?i.vx*.4:0),a=i.z+(e===1?i.vz*.4:0),s=r-this.transforms[o],c=a-this.transforms[o+1],u=s*t+c*n,d=s*n-c*t;if(u>0&&u<15+y/2&&d<2.4&&d>-2.4){let e=u-y/2-1.2;e<S&&(S=e,C=0),this.yielding[l]=1}}this.yielding[l]===1&&this.honkCd[l]<=0&&(this.honkCd[l]=4+this.rng.next()*5,this.honkN<this.honkBuf.length&&(this.honkBuf[this.honkN++]=this.transforms[o],this.honkBuf[this.honkN++]=this.transforms[o+1]))}let T;if(p===0){let e=pm*(x>.1?1-(v/x)**4:-1);if(S<1e8){let t=S>.1?S:.1,n=gm+Math.max(0,v*hm+v*(v-C)/(2*Math.sqrt(pm*mm)));e-=n/t*pm*(n/t)}e<-9&&(e=-9),T=v+e*h}else T=Math.min(x,Math.max(0,(S-gm)/1.2));T<0&&(T=0);let E=T*h,D=S-_m;E>D&&(E=D>0?D:0),h>0&&T*h>E&&(T=E/h),this.vNew[l]=T,this.adv[l]=E}this.activeCount=c;for(let e=0;e<o;e++){if(!this.upd[e])continue;this.v[e]=this.vNew[e];let t=this.s[e]+this.adv[e],n=this.lane[e];for(let r=0;r<4&&t>a.len[n];r++)if(a.kind[n]===0){let r=this.next[e],i=a.connOut[r];if(!this.go[e]||this.claimCnt[i]>0&&this.claimConn[i]!==r){t=a.len[n],this.v[e]=0;break}this.claimConn[i]=r,this.claimCnt[i]++,t-=a.len[n],n=r,this.next[e]=-1}else{let r=a.connOut[n];--this.claimCnt[r]<=0&&(this.claimCnt[r]=0,this.claimConn[r]=-1),t-=a.len[n],n=r,this.next[e]=this.chooseNext(r),this.go[e]=0}this.s[e]=t,this.lane[e]=n,a.sample(n,t,this.transforms,e*3)}}queryNear(e,t,n,r){let i=0,a=n*n,o=this.transforms,s=Math.max(0,Math.floor((e-n-this.gx0)/xm)),c=Math.min(this.gw-1,Math.floor((e+n-this.gx0)/xm)),l=Math.max(0,Math.floor((t-n-this.gz0)/xm)),u=Math.min(this.gh-1,Math.floor((t+n-this.gz0)/xm));for(let n=l;n<=u;n++)for(let l=s;l<=c;l++)for(let s=this.cellHead[n*this.gw+l];s>=0;s=this.cellNext[s]){let n=o[s*3]-e,c=o[s*3+1]-t;n*n+c*c<=a&&i<r.length&&(r[i++]=s)}return i}densityNear(e,t){let n=this.transforms,r=0,i=Math.max(0,Math.floor((e-60-this.gx0)/xm)),a=Math.min(this.gw-1,Math.floor((e+60-this.gx0)/xm)),o=Math.max(0,Math.floor((t-60-this.gz0)/xm)),s=Math.min(this.gh-1,Math.floor((t+60-this.gz0)/xm));for(let c=o;c<=s;c++)for(let o=i;o<=a;o++)for(let i=this.cellHead[c*this.gw+o];i>=0;i=this.cellNext[i]){let a=Math.hypot(n[i*3]-e,n[i*3+1]-t);a<60&&(r+=(1-a/60)*(.4+.6*Math.min(1,this.v[i]/8)))}return Math.min(1,r/5)}drainHonks(e){let t=Math.min(this.honkN,e.length)>>1;for(let n=0;n<t*2;n++)e[n]=this.honkBuf[n];return this.honkN=0,t}claimsOn(e){return this.claimCnt[e]}};function Cm(e){return e===0?.6:e===1?.18:e===2?.22:.05}var wm=2.5,Tm=1.1,Em=[[[0,-1,3,0],[-1,0,1,1]],[[0,-1,2,0],[1,0,0,1]],[[0,1,1,0],[1,0,3,1]],[[0,1,0,0],[-1,0,2,1]]],Dm=[[0,0],[1,0],[1,1],[0,1]],Om=[1,0,-1,0],km=[0,1,0,-1],Am=class{city;graph;count;block;u;d;dir;speed;state;crossing;x;z;heading;phase;curSpeed;lod;activeCount=0;tick=0;rng;homeD;timer;accDt;lookX;lookZ;runSpeed;cTarget;cCorner;cAxis;cNode;cx0;cz0;cx1;cz1;cProg;sepU;sepSlow;bx0;bz0;bx1;bz1;blockAt;blockI;blockJ;nbx;nbz;sw;gx0;gz0;gw;gh;cellHead;cellNext;nearR2;farR2;constructor(e,t,n={}){this.city=e,this.graph=t;let r=this.count=n.pedestrians??600;this.rng=new ll((n.seed??4242)^20973),this.nearR2=(n.nearRadius??120)**2,this.farR2=(n.farRadius??300)**2,this.sw=e.params.sidewalkWidth;let i=()=>new Float32Array(r);this.block=new Int32Array(r),this.u=new Float64Array(r),this.d=i(),this.dir=new Int8Array(r),this.speed=i(),this.state=new Uint8Array(r),this.crossing=new Uint8Array(r),this.x=i(),this.z=i(),this.heading=i(),this.phase=i(),this.curSpeed=i(),this.lod=new Uint8Array(r),this.homeD=i(),this.timer=i(),this.accDt=i(),this.lookX=i(),this.lookZ=i(),this.runSpeed=i(),this.cTarget=new Int32Array(r),this.cCorner=new Int8Array(r),this.cAxis=new Int8Array(r).fill(-1),this.cNode=new Int32Array(r),this.cx0=i(),this.cz0=i(),this.cx1=i(),this.cz1=i(),this.cProg=i(),this.sepU=i(),this.sepSlow=i();let a=e.blocks.length;this.bx0=new Float64Array(a),this.bz0=new Float64Array(a),this.bx1=new Float64Array(a),this.bz1=new Float64Array(a),this.nbx=e.params.blocksX,this.nbz=e.params.blocksZ,this.blockAt=new Int32Array(this.nbx*this.nbz).fill(-1),this.blockI=new Int32Array(a),this.blockJ=new Int32Array(a);let o=new Float64Array(a),s=0;for(let t=0;t<a;t++){let n=e.blocks[t];this.bx0[t]=n.x0,this.bz0[t]=n.z0,this.bx1[t]=n.x1,this.bz1[t]=n.z1;let r=(n.x0+n.x1)/2,i=(n.z0+n.z1)/2,a=0,c=0;for(;a+1<e.avenueX.length&&e.avenueX[a+1]<r;)a++;for(;c+1<e.streetZ.length&&e.streetZ[c+1]<i;)c++;this.blockI[t]=a,this.blockJ[t]=c,a<this.nbx&&c<this.nbz&&(this.blockAt[a*this.nbz+c]=t),s+=o[t]=2*(n.x1-n.x0+n.z1-n.z0)*(n.park?.6:1)}let c=e.bounds;this.gx0=c.x0,this.gz0=c.z0,this.gw=Math.ceil((c.x1-c.x0)/wm)+1,this.gh=Math.ceil((c.z1-c.z0)/wm)+1,this.cellHead=new Int32Array(this.gw*this.gh),this.cellNext=new Int32Array(r);let l=this.rng;for(let e=0;e<r;e++){let t=l.next()*s,n=0;for(;n<a-1&&(t-=o[n])>0;)n++;this.block[e]=n,this.u[e]=l.next()*4,this.homeD[e]=this.d[e]=l.range(1.5,Math.min(3,this.sw-.8)),this.dir[e]=l.chance(.5)?1:-1,this.speed[e]=l.range(1.1,1.7),this.runSpeed[e]=l.range(3.4,5),this.phase[e]=l.range(0,6.28),this.timer[e]=l.range(5,60),this.place(e)}}edgeLen(e,t,n){return t&1?this.bz1[e]-this.bz0[e]-2*n:this.bx1[e]-this.bx0[e]-2*n}cornerX(e,t,n){return t===0||t===3?this.bx0[e]+n:this.bx1[e]-n}cornerZ(e,t,n){return t<2?this.bz0[e]+n:this.bz1[e]-n}place(e){let t=this.block[e],n=this.d[e],r=this.u[e],i=Math.floor(r)&3,a=r-Math.floor(r),o=this.edgeLen(t,i,n);this.x[e]=this.cornerX(t,i,n)+Om[i]*a*o,this.z[e]=this.cornerZ(t,i,n)+km[i]*a*o}cellOf(e,t){let n=Math.floor((e-this.gx0)/wm),r=Math.floor((t-this.gz0)/wm);return n=n<0?0:n>=this.gw?this.gw-1:n,r=r<0?0:r>=this.gh?this.gh-1:r,r*this.gw+n}notifyImpact(e,t,n){let r=6+14*Math.min(1,Math.max(0,n));for(let i=0;i<this.count;i++){let a=this.x[i]-e,o=this.z[i]-t;a*a+o*o<r*r&&this.startle(i,e,t,n)}}startle(e,t,n,r){if(this.lookX[e]=t,this.lookZ[e]=n,this.state[e]!==2&&(this.state[e]=2,this.timer[e]=1.2+1.8*r+this.rng.next(),!this.crossing[e])){this.cAxis[e]=-1;let r=Math.floor(this.u[e])&3,i=(this.x[e]-t)*Om[r]+(this.z[e]-n)*km[r];this.dir[e]=i>=0?1:-1}}update(e,t,n,r,i){let a=this.count;this.tick++,this.cellHead.fill(-1);let o=0;for(let e=0;e<a;e++){let t=this.x[e]-n,i=this.z[e]-r,a=t*t+i*i,s=a<this.nearR2?0:a<this.farR2?1:2;if(this.lod[e]=s,s===2)continue;o++;let c=this.cellOf(this.x[e],this.z[e]);this.cellNext[e]=this.cellHead[c],this.cellHead[c]=e}if(this.activeCount=o,i){let e=Math.hypot(i.vx,i.vy,i.vz);if(e>12&&i.y<10){let t=Math.max(0,Math.floor((i.x-7-this.gx0)/wm)),n=Math.min(this.gw-1,Math.floor((i.x+7-this.gx0)/wm)),r=Math.max(0,Math.floor((i.z-7-this.gz0)/wm)),a=Math.min(this.gh-1,Math.floor((i.z+7-this.gz0)/wm));for(let o=r;o<=a;o++)for(let r=t;r<=n;r++)for(let t=this.cellHead[o*this.gw+r];t>=0;t=this.cellNext[t]){let n=this.x[t]-i.x,r=this.z[t]-i.z;n*n+r*r<49&&this.state[t]!==2&&this.startle(t,i.x,i.z,Math.min(1,e/40))}}}for(let e=0;e<a;e++){if(this.sepU[e]=0,this.sepSlow[e]=1,this.lod[e]!==0||this.crossing[e])continue;let t=this.x[e],n=this.z[e],r=Math.floor(this.u[e])&3,i=Om[r]*this.dir[e],a=km[r]*this.dir[e],o=-km[r],s=Om[r],c=Math.floor((t-this.gx0)/wm),l=Math.floor((n-this.gz0)/wm);for(let r=-1;r<=1;r++)for(let u=-1;u<=1;u++){let d=c+u,f=l+r;if(!(d<0||f<0||d>=this.gw||f>=this.gh))for(let r=this.cellHead[f*this.gw+d];r>=0;r=this.cellNext[r]){if(r===e)continue;let c=this.x[r]-t,l=this.z[r]-n,u=c*c+l*l;if(u>Tm*Tm||u<1e-8)continue;let d=Math.sqrt(u),f=1-d/Tm;if(this.sepU[e]-=(c*o+l*s)/d*f,c*i+l*a>0&&this.state[r]!==2){let t=.35+d/Tm*.65;t<this.sepSlow[e]&&(this.sepSlow[e]=t)}}}}for(let n=0;n<a;n++){let r=this.lod[n];if(this.accDt[n]+=e,r===2&&(this.curSpeed[n]=0),r===1&&(this.tick+n)%4!=0||r===2&&(this.tick+n)%32!=0)continue;let i=this.accDt[n];this.accDt[n]=0,this.step(n,i,t)}}step(e,t,n){let r=this.state[e];this.timer[e]-=t;let i=0;if(r===0?(i=this.speed[e]*this.sepSlow[e],this.timer[e]<=0&&(this.state[e]=1,this.timer[e]=this.rng.range(1.5,6))):r===1?(this.cAxis[e]>=0&&!this.crossing[e]&&(this.graph.greenRemaining(this.cNode[e],this.cAxis[e],n)>Math.hypot(this.cx1[e]-this.cx0[e],this.cz1[e]-this.cz0[e])/(this.speed[e]*1.3)+1?(this.crossing[e]=1,this.cProg[e]=0,this.state[e]=0,this.timer[e]=this.rng.range(20,60)):this.timer[e]<=0&&(this.cAxis[e]=-1)),this.timer[e]<=0&&this.cAxis[e]<0&&(this.state[e]=0,this.timer[e]=this.rng.range(15,70))):r===2?(i=this.runSpeed[e],this.timer[e]<=0&&(this.state[e]=3,this.timer[e]=this.rng.range(3,6.5))):this.timer[e]<=0&&(this.state[e]=0,this.timer[e]=this.rng.range(15,70)),this.curSpeed[e]=i,this.phase[e]+=i*t*4.4,this.crossing[e]){let n=Math.max(.1,Math.hypot(this.cx1[e]-this.cx0[e],this.cz1[e]-this.cz0[e])),r=this.state[e]===2?i:this.state[e]===0?this.speed[e]*1.3:this.speed[e];if(this.curSpeed[e]=r,this.cProg[e]+=r*t/n,this.cProg[e]>=1){this.crossing[e]=0,this.cAxis[e]=-1,this.block[e]=this.cTarget[e];let t=this.cCorner[e];this.u[e]=((t+(this.dir[e]>0?1e-4:-1e-4))%4+4)%4,this.place(e)}else{let t=this.cProg[e];this.x[e]=this.cx0[e]+(this.cx1[e]-this.cx0[e])*t,this.z[e]=this.cz0[e]+(this.cz1[e]-this.cz0[e])*t,this.state[e]!==3&&this.state[e]!==1?this.heading[e]=Math.atan2(this.cx1[e]-this.cx0[e],this.cz1[e]-this.cz0[e]):this.faceLook(e)}return}let a=this.sw,o=this.state[e]===2?a-.6:this.homeD[e]+this.dir[e]*.3,s=this.d[e]+(o-this.d[e])*Math.min(1,.8*t)+this.sepU[e]*1.6*t;if(s=s<.7?.7:s>a-.5?a-.5:s,this.d[e]=s,i>0){let n=this.block[e],r=this.u[e],a=i*t;for(let t=0;t<6&&a>1e-6;t++){let t=Math.floor(r)&3,i=this.edgeLen(n,t,s),o=r-Math.floor(r),c=this.dir[e]>0?(1-o)*i:o*i;if(a<c){r+=this.dir[e]*a/i;break}a-=c;let l=this.dir[e]>0?t+1&3:t;if(r=l+(this.dir[e]>0?1e-4:-1e-4),r<0&&(r+=4),this.state[e]===0&&this.maybeQueueCrossing(e,l)){r=l;break}}this.u[e]=r>=4?r-4:r}if(this.place(e),this.state[e]===3)this.faceLook(e);else if(this.state[e]!==1){let t=Math.floor(this.u[e])&3;this.heading[e]=Math.atan2(Om[t]*this.dir[e],km[t]*this.dir[e])}}faceLook(e){this.heading[e]=Math.atan2(this.lookX[e]-this.x[e],this.lookZ[e]-this.z[e])}maybeQueueCrossing(e,t){if(!this.rng.chance(.3))return!1;let n=this.block[e],r=Em[t][+!this.rng.chance(.5)],i=this.blockI[n]+r[0],a=this.blockJ[n]+r[1];if(i<0||a<0||i>=this.nbx||a>=this.nbz)return!1;let o=this.blockAt[i*this.nbz+a];if(o<0)return!1;let s=this.d[e];return this.cTarget[e]=o,this.cCorner[e]=r[2],this.cAxis[e]=r[3],this.cNode[e]=(this.blockI[n]+Dm[t][0])*this.graph.nz+this.blockJ[n]+Dm[t][1],this.cx0[e]=this.cornerX(n,t,s),this.cz0[e]=this.cornerZ(n,t,s),this.cx1[e]=this.cornerX(o,r[2],s),this.cz1[e]=this.cornerZ(o,r[2],s),this.state[e]=1,this.timer[e]=this.rng.range(15,45),this.heading[e]=Math.atan2(this.cx1[e]-this.cx0[e],this.cz1[e]-this.cz0[e]),!0}densityNear(e,t){let n=0,r=Math.max(0,Math.floor((e-30-this.gx0)/wm)),i=Math.min(this.gw-1,Math.floor((e+30-this.gx0)/wm)),a=Math.max(0,Math.floor((t-30-this.gz0)/wm)),o=Math.min(this.gh-1,Math.floor((t+30-this.gz0)/wm));for(let s=a;s<=o;s++)for(let a=r;a<=i;a++)for(let r=this.cellHead[s*this.gw+a];r>=0;r=this.cellNext[r]){let i=Math.hypot(this.x[r]-e,this.z[r]-t);i<30&&(n+=1-i/30)}return Math.min(1,n/6)}};function jm(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Dr,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Mm(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Mm(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function Mm(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new gr(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}var Nm=[15263974,15921904,1447706,2039843,10396584,7172728,4869973,1912658,2771578,8198682,11018272,4857637,2899246,12103060,9072461,15906565,15906565,15774720],Pm=[2830138,3951198,7021872,9080726,14275783,1973790,3100474,10705450,4930411,13084234,8031395,5912613],Fm=[15845544,14263422,11959122,9263675,6175270,15251862];function Im(e,t,n,r,i,a,o){let s=new Hr(e,t,n).toNonIndexed();return s.translate(r,i,a),Lm(s,o)}function Lm(e,t){let n=new U(t),r=e.attributes.position.count,i=new Float32Array(r*3);for(let e=0;e<r;e++)i[e*3]=n.r,i[e*3+1]=n.g,i[e*3+2]=n.b;return e.setAttribute(`color`,new gr(i,3)),e.index?e.toNonIndexed():e}function Rm(e){let t=e.index?e.toNonIndexed():e;for(let e of Object.keys(t.attributes))e!==`position`&&e!==`normal`&&e!==`color`&&t.deleteAttribute(e);return t}function zm(){let e=16777215,t=723982,n=[Im(1.82,.62,4.5,0,.62,0,e),Im(1.6,.52,2.3,0,1.19,-.25,1382944),Im(1.5,.08,2.05,0,1.49,-.25,e),Im(1.64,.36,.08,0,1.12,.93,e),Im(1.86,.2,4.56,0,.36,0,t)];for(let[e,r]of[[-.82,1.45],[.82,1.45],[-.82,-1.45],[.82,-1.45]])n.push(Im(.26,.64,.64,e,.32,r,t));let r=jm(n.map(Rm),!1);for(let e of n)e.dispose();return r.computeBoundingSphere(),r}function Bm(){let e=[],t=(t,n,r,i,a)=>{let o=new ia(.34,.16);o.rotateY(i),o.translate(t,n,r),e.push(Rm(Lm(o,a)))};for(let e of[-.62,.62])t(e,.78,2.262,0,16773590),t(e,.8,-2.262,Math.PI,16718346);let n=jm(e,!1);for(let t of e)t.dispose();return n}function Vm(){let e=new $i(.21,.5,2,6);e.scale(1,1,.7),e.translate(0,1.2,0);let t=Rm(Lm(e,16777215)),n=new ra(.12,1);n.translate(0,1.66,.01);let r=[Im(.14,.84,.16,-.09,.42,0,3159100),Im(.14,.84,.16,.09,.42,0,3159100)],i=[Rm(Lm(n,16777215)),...r.map(Rm)],a=jm(i,!1);for(let e of i)e.dispose();return e.dispose(),n.dispose(),{body:t,rest:a}}function Hm(e,t,n,r){let i=new xi(e,t,n);return i.instanceMatrix.setUsage(ze),i.frustumCulled=!1,i.castShadow=r,i.receiveShadow=r,i.count=0,i}var Um=class{traffic;peds;group=new si;cars;carLights;pedBody;pedRest;carsRendered=0;pedsRendered=0;carColor;clothColor;skinColor;frustum=new ki;projView=new _n;sphere=new cn;m4=new _n;q=new mt;e=new Dn(0,0,0,`YXZ`);pos=new V;one=new V(1,1,1);lightMat;o;constructor(e,t,n={}){this.traffic=e,this.peds=t,this.o={carDrawDistance:450,pedDrawDistance:180,pedAnimDistance:70,sidewalkY:0,shadows:!0,...n};let r=e.count,i=t.count,a=new oa({vertexColors:!0,roughness:.38,metalness:.35});this.cars=Hm(zm(),a,Math.max(1,r),this.o.shadows),this.lightMat=new fr({vertexColors:!0,toneMapped:!1}),this.carLights=Hm(Bm(),this.lightMat,Math.max(1,r),!1),this.carLights.receiveShadow=!1,this.carLights.instanceMatrix=this.cars.instanceMatrix,this.setLightIntensity(1);let{body:o,rest:s}=Vm(),c=new oa({vertexColors:!0,roughness:.85});this.pedBody=Hm(o,c,Math.max(1,i),this.o.shadows),this.pedRest=Hm(s,c,Math.max(1,i),this.o.shadows),this.pedRest.instanceMatrix=this.pedBody.instanceMatrix;let l=new U;this.carColor=new Float32Array(r*3);for(let t=0;t<r;t++)l.setHex(Nm[e.color[t]%Nm.length]),this.carColor.set([l.r,l.g,l.b],t*3);this.clothColor=new Float32Array(i*3),this.skinColor=new Float32Array(i*3);for(let e=0;e<i;e++){let t=Math.imul(e+1,2654435761)>>>0;l.setHex(Pm[t%Pm.length]),this.clothColor.set([l.r,l.g,l.b],e*3),l.setHex(Fm[(t>>>8)%Fm.length]),this.skinColor.set([l.r,l.g,l.b],e*3)}this.cars.instanceColor=new pi(new Float32Array(Math.max(1,r)*3),3).setUsage(ze),this.pedBody.instanceColor=new pi(new Float32Array(Math.max(1,i)*3),3).setUsage(ze),this.pedRest.instanceColor=new pi(new Float32Array(Math.max(1,i)*3),3).setUsage(ze),this.group.name=`ai`,this.group.add(this.cars,this.carLights,this.pedBody,this.pedRest)}setLightIntensity(e){this.lightMat.color.setScalar(e)}update(e,t,n,r){e.updateMatrixWorld(),this.projView.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this.frustum.setFromProjectionMatrix(this.projView);let i=e.getWorldPosition(this.pos),a=i.x,o=i.y,s=i.z;this.carsRendered=n?this.writeCars(a,o,s):0,this.pedsRendered=r?this.writePeds(a,o,s,t):0,this.cars.visible=this.carLights.visible=this.carsRendered>0,this.pedBody.visible=this.pedRest.visible=this.pedsRendered>0}writeCars(e,t,n){let r=this.traffic,i=r.transforms,a=this.cars.instanceMatrix.array,o=this.cars.instanceColor.array,s=this.o.carDrawDistance**2,c=0;this.sphere.radius=2.6;for(let l=0;l<r.count;l++){let r=i[l*3],u=i[l*3+1],d=r-e,f=u-n;if(d*d+f*f+t*t>s||(this.sphere.center.set(r,.8,u),!this.frustum.intersectsSphere(this.sphere)))continue;let p=i[l*3+2],m=Math.cos(p),h=Math.sin(p),g=c*16;a[g]=m,a[g+1]=0,a[g+2]=-h,a[g+3]=0,a[g+4]=0,a[g+5]=1,a[g+6]=0,a[g+7]=0,a[g+8]=h,a[g+9]=0,a[g+10]=m,a[g+11]=0,a[g+12]=r,a[g+13]=0,a[g+14]=u,a[g+15]=1,o[c*3]=this.carColor[l*3],o[c*3+1]=this.carColor[l*3+1],o[c*3+2]=this.carColor[l*3+2],c++}return this.cars.count=this.carLights.count=c,c>0&&(this.cars.instanceMatrix.clearUpdateRanges(),this.cars.instanceMatrix.addUpdateRange(0,c*16),this.cars.instanceMatrix.needsUpdate=!0,this.cars.instanceColor.clearUpdateRanges(),this.cars.instanceColor.addUpdateRange(0,c*3),this.cars.instanceColor.needsUpdate=!0),c}writePeds(e,t,n,r){let i=this.peds,a=this.pedBody.instanceMatrix.array,o=this.pedBody.instanceColor.array,s=this.pedRest.instanceColor.array,c=this.o.pedDrawDistance**2,l=this.o.pedAnimDistance**2,u=this.o.sidewalkY,d=0;this.sphere.radius=1.1;for(let f=0;f<i.count;f++){let p=i.x[f],m=i.z[f],h=p-e,g=m-n,_=u+1-t,v=h*h+g*g+_*_;if(v>c||(this.sphere.center.set(p,u+.9,m),!this.frustum.intersectsSphere(this.sphere)))continue;let y=0,b=0,x=0;if(v<l){let e=i.state[f],t=i.phase[f];if(i.curSpeed[f]>.05&&(e===0||e===2)){let n=+(e===2);y=Math.abs(Math.sin(t))*(.04+.05*n),b=Math.sin(t)*.045,x=.04+.2*n}else e===3&&!(f&3)&&(y=Math.max(0,Math.sin(r*9+f))*.18)}this.e.set(x,i.heading[f],b),this.q.setFromEuler(this.e),this.pos.set(p,u+y,m),this.m4.compose(this.pos,this.q,this.one),this.m4.toArray(a,d*16),o[d*3]=this.clothColor[f*3],o[d*3+1]=this.clothColor[f*3+1],o[d*3+2]=this.clothColor[f*3+2],s[d*3]=this.skinColor[f*3],s[d*3+1]=this.skinColor[f*3+1],s[d*3+2]=this.skinColor[f*3+2],d++}if(this.pedBody.count=this.pedRest.count=d,d>0){let e=this.pedBody.instanceMatrix;e.clearUpdateRanges(),e.addUpdateRange(0,d*16),e.needsUpdate=!0;let t=this.pedBody.instanceColor,n=this.pedRest.instanceColor;t.clearUpdateRanges(),t.addUpdateRange(0,d*3),t.needsUpdate=!0,n.clearUpdateRanges(),n.addUpdateRange(0,d*3),n.needsUpdate=!0}return d}dispose(){this.group.removeFromParent();for(let e of[this.cars,this.carLights,this.pedBody,this.pedRest])e.geometry.dispose(),e.material.dispose(),e.dispose()}},Wm=class{graph;traffic;peds;renderer;time=0;carsOn=!0;pedsOn=!0;simMs=0;probe={x:0,y:0,z:0,vx:0,vy:0,vz:0};honkTmp=new Float32Array(64);constructor(e,t,n={}){let r=n.seed??e.params.seed;this.graph=new fm(e),this.traffic=new Sm(this.graph,{cars:n.cars??220,seed:r}),this.peds=new Am(e,this.graph,{pedestrians:n.pedestrians??600,seed:r}),this.renderer=new Um(this.traffic,this.peds,n),t.add(this.renderer.group)}update(e,t,n){let r=Math.min(Math.max(e,0),.1),i=performance.now();this.time+=r;let a=this.probe;a.x=t.pos.x,a.y=t.pos.y,a.z=t.pos.z,a.vx=t.vel.x,a.vy=t.vel.y,a.vz=t.vel.z,this.carsOn&&this.traffic.update(r,this.time,a.x,a.z,a),this.pedsOn&&this.peds.update(r,this.time,a.x,a.z,a);let o=performance.now();this.simMs=o-i,this.renderer.update(n,this.time,this.carsOn,this.pedsOn)}notifyImpact(e,t,n){this.pedsOn&&this.peds.notifyImpact(e,t,n)}densityNear(e,t){return{traffic:this.carsOn?this.traffic.densityNear(e,t):0,crowd:this.pedsOn?this.peds.densityNear(e,t):0}}drainHonks(){let e=this.traffic.drainHonks(this.honkTmp),t=[];for(let n=0;n<e;n++)t.push({x:this.honkTmp[n*2],z:this.honkTmp[n*2+1]});return t}setLightIntensity(e){this.renderer.setLightIntensity(e)}stats(){return{cars:this.carsOn?this.traffic.count:0,carsActive:this.carsOn?this.traffic.activeCount:0,carsRendered:this.renderer.carsRendered,peds:this.pedsOn?this.peds.count:0,pedsActive:this.pedsOn?this.peds.activeCount:0,pedsRendered:this.renderer.pedsRendered,simMs:this.simMs}}setEnabled(e,t){this.carsOn=e,this.pedsOn=t}dispose(){this.renderer.dispose()}},Gm=24e3,Km=class{overlay;pos=new Float32Array(Gm*2*3);col=new Float32Array(Gm*2*3);n=0;geo=new Dr;lines;labels=[];labelN=0;c=new U;_p=new V;enabled=!1;constructor(e,t){this.overlay=t,this.geo.setAttribute(`position`,new gr(this.pos,3)),this.geo.setAttribute(`color`,new gr(this.col,3)),this.lines=new Hi(this.geo,new Ai({vertexColors:!0,depthTest:!1,transparent:!0,toneMapped:!1})),this.lines.frustumCulled=!1,this.lines.renderOrder=10,e.add(this.lines)}begin(){this.n=0,this.labelN=0}line(e,t,n){if(this.n>=Gm)return;let r=typeof n==`number`?this.c.setHex(n):n,i=this.n*6;this.pos[i]=e.x,this.pos[i+1]=e.y,this.pos[i+2]=e.z,this.pos[i+3]=t.x,this.pos[i+4]=t.y,this.pos[i+5]=t.z,this.col[i]=r.r,this.col[i+1]=r.g,this.col[i+2]=r.b,this.col[i+3]=r.r,this.col[i+4]=r.g,this.col[i+5]=r.b,this.n++}lineXYZ(e,t,n,r,i,a,o){this.line(this._a.set(e,t,n),this._b.set(r,i,a),o)}_a=new V;_b=new V;arrow(e,t,n,r){let i=this._p.copy(e).addScaledVector(t,n);this.line(e,i,r),this.cross(i,.12,r)}cross(e,t,n){this.lineXYZ(e.x-t,e.y,e.z,e.x+t,e.y,e.z,n),this.lineXYZ(e.x,e.y-t,e.z,e.x,e.y+t,e.z,n),this.lineXYZ(e.x,e.y,e.z-t,e.x,e.y,e.z+t,n)}box(e,t,n,r,i,a,o){let s=(e,t,n,r,i,a)=>this.lineXYZ(e,t,n,r,i,a,o);s(e,t,n,r,t,n),s(r,t,n,r,t,a),s(r,t,a,e,t,a),s(e,t,a,e,t,n),s(e,i,n,r,i,n),s(r,i,n,r,i,a),s(r,i,a,e,i,a),s(e,i,a,e,i,n),s(e,t,n,e,i,n),s(r,t,n,r,i,n),s(r,t,a,r,i,a),s(e,t,a,e,i,a)}circle(e,t,n,r=16){for(let i=0;i<r;i++){let a=i/r*Math.PI*2,o=(i+1)/r*Math.PI*2;this.lineXYZ(e.x+Math.cos(a)*t,e.y,e.z+Math.sin(a)*t,e.x+Math.cos(o)*t,e.y,e.z+Math.sin(o)*t,n)}}label(e,t,n,r=`#fff`){let i=this._p.copy(e).project(n);if(i.z>1||i.z<-1||Math.abs(i.x)>1.1||Math.abs(i.y)>1.1)return;let a=this.labels[this.labelN];a||(a=document.createElement(`div`),a.className=`dbg-label`,this.overlay.appendChild(a),this.labels.push(a)),this.labelN++,a.style.display=`block`,a.style.transform=`translate(${(i.x+1)/2*this.overlay.clientWidth}px, ${(1-i.y)/2*this.overlay.clientHeight}px)`,a.textContent!==t&&(a.textContent=t),a.style.color=r}end(){this.geo.setDrawRange(0,this.n*2),this.geo.attributes.position.needsUpdate=!0,this.geo.attributes.color.needsUpdate=!0,this.lines.visible=this.enabled&&this.n>0;for(let e=this.labelN;e<this.labels.length;e++)this.labels[e].style.display=`none`}},qm=class{root;stats;help;hint;helpAuto=6;reticle;speedo;toast;toastT=0;showStats=!1;constructor(e){this.root=document.createElement(`div`),this.root.className=`hud`,this.stats=document.createElement(`pre`),this.stats.className=`hud-stats`,this.help=document.createElement(`div`),this.help.className=`hud-help`;let t=(e,t)=>`<dt>${e}</dt><dd>${t}</dd>`;this.help.innerHTML=`<header>Controls <span>H to hide</span></header><dl>
${t(`<kbd>WASD</kbd> <kbd>Mouse</kbd>`,`move · look`)}
${t(`<kbd>Enter</kbd> / <kbd>Shift</kbd>`,`hold to swing · sprint · wall-run`)}
${t(`<kbd>Space</kbd>`,`jump · mid-swing: jump off`)}
${t(`<kbd>E</kbd> / <kbd>LMB</kbd>`,`web zip · at ◇ then Space: launch`)}
${t(`<kbd>Q</kbd>`,`dive`)}
${t(`<kbd>F</kbd> <kbd>C</kbd> <kbd>R</kbd>`,`trick · drop · reel in`)}
${t("<kbd>`</kbd> <kbd>G</kbd>",`dev panel · debug draw`)}
${t(`<kbd>M</kbd> <kbd>T</kbd> <kbd>K</kbd>`,`mute · time of day · suit`)}
</dl><footer>Pad: LS/RS · A jump · RT swing · RB zip · LB dive</footer>`,this.hint=document.createElement(`div`),this.hint.className=`hud-hint hidden`,this.hint.innerHTML=`<kbd>H</kbd> controls`,this.reticle=document.createElement(`div`),this.reticle.className=`hud-reticle`,this.speedo=document.createElement(`div`),this.speedo.className=`hud-speed`,this.toast=document.createElement(`div`),this.toast.className=`hud-toast`,this.root.append(this.stats,this.help,this.hint,this.reticle,this.speedo,this.toast),e.appendChild(this.root)}toggleHelp(){this.helpAuto=-1,this.setHelp(this.help.classList.contains(`hidden`))}hideHelp(){this.setHelp(!1)}setHelp(e){this.help.classList.toggle(`hidden`,!e),this.hint.classList.toggle(`hidden`,e)}noteActivity(e){this.helpAuto<0||(this.helpAuto-=e,this.helpAuto<0&&this.hideHelp())}setStats(e){this.stats.style.display=this.showStats?`block`:`none`,this.showStats&&(this.help.classList.add(`hidden`),this.hint.classList.add(`hidden`)),this.showStats&&this.stats.textContent!==e&&(this.stats.textContent=e)}lastMph=-1;lastState=``;setSpeed(e,t){let n=Math.round(e*2.23694);this.speedoNum||(this.speedo.innerHTML=`<div class="v"><b></b><span>mph</span></div><i><em></em></i><small></small>`,this.speedoNum=this.speedo.querySelector(`b`),this.speedoBar=this.speedo.querySelector(`em`),this.speedoState=this.speedo.querySelector(`small`)),n!==this.lastMph&&(this.lastMph=n,this.speedoNum.textContent=String(n),this.speedoBar.style.transform=`scaleX(${Math.min(1,n/110).toFixed(3)})`,this.speedo.classList.toggle(`fast`,n>80)),t!==this.lastState&&(this.lastState=t,this.speedoState.textContent=t.replace(/([a-z])([A-Z])/g,`$1 $2`))}speedoNum=null;speedoBar;speedoState;setReticle(e,t=0){if(e===null){this.reticle.style.display=`none`;return}this.reticle.style.display=`block`,this.reticle.style.transform=`translate(${e}px, ${t}px) rotate(45deg)`}flash(e){this.toast.textContent=e,this.toast.style.opacity=`1`,this.toastT=1.2}update(e){this.toastT>0&&(this.toastT-=e,this.toastT<=0&&(this.toast.style.opacity=`0`))}},Jm=class e{constructor(t,n,r,i,a=`div`){this.parent=t,this.object=n,this.property=r,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(a),this.domElement.classList.add(`lil-controller`),this.domElement.classList.add(i),this.$name=document.createElement(`div`),this.$name.classList.add(`lil-name`),e.nextNameID=e.nextNameID||0,this.$name.id=`lil-gui-name-${++e.nextNameID}`,this.$widget=document.createElement(`div`),this.$widget.classList.add(`lil-widget`),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener(`keydown`,e=>e.stopPropagation()),this.domElement.addEventListener(`keyup`,e=>e.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(r)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled?this:(this._disabled=e,this.domElement.classList.toggle(`lil-disabled`,e),this.$disable.toggleAttribute(`disabled`,e),this)}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}options(e){let t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);let e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}},Ym=class extends Jm{constructor(e,t,n){super(e,t,n,`lil-boolean`,`label`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`checkbox`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener(`change`,()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}};function Xm(e){let t,n;return(t=e.match(/(#|0x)?([a-f0-9]{6})/i))?n=t[2]:(t=e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?n=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(n=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),n?`#`+n:!1}var Zm={isPrimitive:!0,match:e=>typeof e==`string`,fromHexString:Xm,toHexString:Xm},Qm={isPrimitive:!0,match:e=>typeof e==`number`,fromHexString:e=>parseInt(e.substring(1),16),toHexString:e=>`#`+e.toString(16).padStart(6,0)},$m=[Zm,Qm,{isPrimitive:!1,match:e=>Array.isArray(e)||ArrayBuffer.isView(e),fromHexString(e,t,n=1){let r=Qm.fromHexString(e);t[0]=(r>>16&255)/255*n,t[1]=(r>>8&255)/255*n,t[2]=(r&255)/255*n},toHexString([e,t,n],r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return Qm.toHexString(i)}},{isPrimitive:!1,match:e=>Object(e)===e,fromHexString(e,t,n=1){let r=Qm.fromHexString(e);t.r=(r>>16&255)/255*n,t.g=(r>>8&255)/255*n,t.b=(r&255)/255*n},toHexString({r:e,g:t,b:n},r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return Qm.toHexString(i)}}];function eh(e){return $m.find(t=>t.match(e))}var th=class extends Jm{constructor(e,t,n,r){super(e,t,n,`lil-color`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`color`),this.$input.setAttribute(`tabindex`,-1),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$text=document.createElement(`input`),this.$text.setAttribute(`type`,`text`),this.$text.setAttribute(`spellcheck`,`false`),this.$text.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`lil-display`),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=eh(this.initialValue),this._rgbScale=r,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener(`input`,()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$text.addEventListener(`input`,()=>{let e=Xm(this.$text.value);e&&this._setValueFromHexString(e)}),this.$text.addEventListener(`focus`,()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener(`blur`,()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){let t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}},nh=class extends Jm{constructor(e,t,n){super(e,t,n,`lil-function`),this.$button=document.createElement(`button`),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener(`click`,e=>{e.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$disable=this.$button}},rh=class extends Jm{constructor(e,t,n,r,i,a){super(e,t,n,`lil-number`),this._initInput(),this.min(r),this.max(i);let o=a!==void 0;this.step(o?a:this._getImplicitStep(),o),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){let e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+`%`}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),window.matchMedia(`(pointer: coarse)`).matches&&(this.$input.setAttribute(`type`,`number`),this.$input.setAttribute(`step`,`any`)),this.$widget.appendChild(this.$input),this.$disable=this.$input;let e=()=>{let e=parseFloat(this.$input.value);isNaN(e)||(this._stepExplicit&&(e=this._snap(e)),this.setValue(this._clamp(e)))},t=e=>{let t=parseFloat(this.$input.value);isNaN(t)||(this._snapClampSetValue(t+e),this.$input.value=this.getValue())},n=e=>{e.key===`Enter`&&this.$input.blur(),e.code===`ArrowUp`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e))),e.code===`ArrowDown`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e)*-1))},r=e=>{this._inputFocused&&(e.preventDefault(),t(this._step*this._normalizeMouseWheel(e)))},i=!1,a,o,s,c,l,u=e=>{a=e.clientX,o=s=e.clientY,i=!0,c=this.getValue(),l=0,window.addEventListener(`mousemove`,d),window.addEventListener(`mouseup`,f)},d=e=>{if(i){let t=e.clientX-a,n=e.clientY-o;Math.abs(n)>5?(e.preventDefault(),this.$input.blur(),i=!1,this._setDraggingStyle(!0,`vertical`)):Math.abs(t)>5&&f()}if(!i){let t=e.clientY-s;l-=t*this._step*this._arrowKeyMultiplier(e),c+l>this._max?l=this._max-c:c+l<this._min&&(l=this._min-c),this._snapClampSetValue(c+l)}s=e.clientY},f=()=>{this._setDraggingStyle(!1,`vertical`),this._callOnFinishChange(),window.removeEventListener(`mousemove`,d),window.removeEventListener(`mouseup`,f)};this.$input.addEventListener(`input`,e),this.$input.addEventListener(`keydown`,n),this.$input.addEventListener(`wheel`,r,{passive:!1}),this.$input.addEventListener(`mousedown`,u),this.$input.addEventListener(`focus`,()=>{this._inputFocused=!0}),this.$input.addEventListener(`blur`,()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()})}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement(`div`),this.$slider.classList.add(`lil-slider`),this.$fill=document.createElement(`div`),this.$fill.classList.add(`lil-fill`),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add(`lil-has-slider`);let e=(e,t,n,r,i)=>(e-t)/(n-t)*(i-r)+r,t=t=>{let n=this.$slider.getBoundingClientRect(),r=e(t,n.left,n.right,this._min,this._max);this._snapClampSetValue(r)},n=e=>{this._setDraggingStyle(!0),t(e.clientX),window.addEventListener(`mousemove`,r),window.addEventListener(`mouseup`,i)},r=e=>{t(e.clientX)},i=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`mousemove`,r),window.removeEventListener(`mouseup`,i)},a=!1,o,s,c=e=>{e.preventDefault(),this._setDraggingStyle(!0),t(e.touches[0].clientX),a=!1},l=e=>{e.touches.length>1||(this._hasScrollBar?(o=e.touches[0].clientX,s=e.touches[0].clientY,a=!0):c(e),window.addEventListener(`touchmove`,u,{passive:!1}),window.addEventListener(`touchend`,d))},u=e=>{if(a){let t=e.touches[0].clientX-o,n=e.touches[0].clientY-s;Math.abs(t)>Math.abs(n)?c(e):(window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d))}else e.preventDefault(),t(e.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d)},f=this._callOnFinishChange.bind(this),p;this.$slider.addEventListener(`mousedown`,n),this.$slider.addEventListener(`touchstart`,l,{passive:!1}),this.$slider.addEventListener(`wheel`,e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)&&this._hasScrollBar)return;e.preventDefault();let t=this._normalizeMouseWheel(e)*this._step;this._snapClampSetValue(this.getValue()+t),this.$input.value=this.getValue(),clearTimeout(p),p=setTimeout(f,400)},{passive:!1})}_setDraggingStyle(e,t=`horizontal`){this.$slider&&this.$slider.classList.toggle(`lil-active`,e),document.body.classList.toggle(`lil-dragging`,e),document.body.classList.toggle(`lil-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:n}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,n=-e.wheelDelta/120,n*=this._stepExplicit?1:10),t+-n}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=0;return this._hasMin?t=this._min:this._hasMax&&(t=this._max),e-=t,e=Math.round(e/this._step)*this._step,e+=t,e=parseFloat(e.toPrecision(15)),e}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){let e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}},ih=class extends Jm{constructor(e,t,n,r){super(e,t,n,`lil-option`),this.$select=document.createElement(`select`),this.$select.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`lil-display`),this.$select.addEventListener(`change`,()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener(`focus`,()=>{this.$display.classList.add(`lil-focus`)}),this.$select.addEventListener(`blur`,()=>{this.$display.classList.remove(`lil-focus`)}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(e=>{let t=document.createElement(`option`);t.textContent=e,this.$select.appendChild(t)}),this.updateDisplay(),this}updateDisplay(){let e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}},ah=class extends Jm{constructor(e,t,n){super(e,t,n,`lil-string`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`spellcheck`,`false`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$input.addEventListener(`input`,()=>{this.setValue(this.$input.value)}),this.$input.addEventListener(`keydown`,e=>{e.code===`Enter`&&this.$input.blur()}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}},oh=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;function sh(e){let t=document.createElement(`style`);t.innerHTML=e;let n=document.querySelector(`head link[rel=stylesheet], head style`);n?document.head.insertBefore(t,n):document.head.appendChild(t)}var ch=!1,lh=class e{constructor({parent:e,autoPlace:t=e===void 0,container:n,width:r,title:i=`Controls`,closeFolders:a=!1,injectStyles:o=!0,touchStyles:s=!0}={}){if(this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement(`div`),this.domElement.classList.add(`lil-gui`),this.$title=document.createElement(`button`),this.$title.classList.add(`lil-title`),this.$title.setAttribute(`aria-expanded`,!0),this.$title.addEventListener(`click`,()=>this.openAnimated(this._closed)),this.$title.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$children=document.createElement(`div`),this.$children.classList.add(`lil-children`),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(i),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add(`lil-root`),s&&this.domElement.classList.add(`lil-allow-touch-styles`),!ch&&o&&(sh(oh),ch=!0),n?n.appendChild(this.domElement):t&&(this.domElement.classList.add(`lil-auto-place`,`autoPlace`),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty(`--width`,r+`px`),this._closeFolders=a}add(e,t,n,r,i){if(Object(n)===n)return new ih(this,e,t,n);let a=e[t];switch(typeof a){case`number`:return new rh(this,e,t,n,r,i);case`boolean`:return new Ym(this,e,t);case`string`:return new ah(this,e,t);case`function`:return new nh(this,e,t)}console.error(`gui.add failed
	property:`,t,`
	object:`,e,`
	value:`,a)}addColor(e,t,n=1){return new th(this,e,t,n)}addFolder(t){let n=new e({parent:this,title:t});return this.root._closeFolders&&n.close(),n}load(e,t=!0){return e.controllers&&this.controllers.forEach(t=>{t instanceof nh||t._name in e.controllers&&t.load(e.controllers[t._name])}),t&&e.folders&&this.folders.forEach(t=>{t._title in e.folders&&t.load(e.folders[t._title])}),this}save(e=!0){let t={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof nh)){if(e._name in t.controllers)throw Error(`Cannot save GUI with duplicate property "${e._name}"`);t.controllers[e._name]=e.save()}}),e&&this.folders.forEach(e=>{if(e._title in t.folders)throw Error(`Cannot save GUI with duplicate folder "${e._title}"`);t.folders[e._title]=e.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),this.domElement.classList.toggle(`lil-closed`,this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),requestAnimationFrame(()=>{let t=this.$children.clientHeight;this.$children.style.height=t+`px`,this.domElement.classList.add(`lil-transition`);let n=e=>{e.target===this.$children&&(this.$children.style.height=``,this.domElement.classList.remove(`lil-transition`),this.$children.removeEventListener(`transitionend`,n))};this.$children.addEventListener(`transitionend`,n);let r=e?this.$children.scrollHeight:0;this.domElement.classList.toggle(`lil-closed`,!e),requestAnimationFrame(()=>{this.$children.style.height=r+`px`})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}},uh=class{gui;constructor(e){this.gui=new lh({title:`STRAND dev panel`}),this.gui.domElement.style.zIndex=`20`;let t=this.gui.addFolder(`Debug draw`),n={velocity:`velocity vector`,acceleration:`acceleration vector`,tension:`web tension`,anchor:`anchor`,candidates:`anchor candidates`,scores:`candidate scores`,trajectory:`trajectory prediction`,collision:`collision shapes`,forces:`swing forces`,stats:`stats HUD (fps/cpu/gpu/state…)`};for(let r of Object.keys(n))t.add(e.flags,r).name(n[r]);let r=this.gui.addFolder(`World & rendering`);r.add(e.env,`timeOfDay`,0,1,.005).name(`time of day (full)`).onChange(()=>e.onTime()),r.add(e.env,`bloom`,0,2,.01).name(`bloom (× look)`).onChange(()=>e.onBloom());let i=r.addFolder(`atmosphere (× look)`);i.add(Ld,`fog`,0,3,.01).name(`aerial fog`).onChange(()=>e.onTime()),i.add(Ld,`heightFog`,0,4,.01).name(`ground fog`).onChange(()=>e.onTime()),i.add(Ld,`heightFalloff`,.2,3,.01).name(`ground fog falloff`).onChange(()=>e.onTime()),i.add(Ld,`sky`,.3,2,.01).name(`sky brightness`).onChange(()=>e.onTime()),i.add(Ld,`stars`,0,3,.01).name(`stars`).onChange(()=>e.onTime()),i.close(),r.add(e.suit,`skin`,e.suit.options).name(`suit (K)`).onChange(()=>e.onSuit()).listen(),r.add(e.quality,`preset`,[`low`,`medium`,`high`,`ultra`]).name(`quality`).onChange(()=>e.onQuality()),r.add(e.ai,`cars`).name(`traffic`).onChange(()=>e.onAI()),r.add(e.ai,`pedestrians`).onChange(()=>e.onAI()),r.add(e.audio,`volume`,0,1,.01).onChange(()=>e.onAudio()),r.add(e.audio,`muted`).onChange(()=>e.onAudio());let a={seed:e.seed};r.add(a,`seed`,1,99999,1).name(`city seed`),r.add({go:()=>e.regenerate(a.seed)},`go`).name(`regenerate city`);let o=this.gui.addFolder(`Simulation`);o.add(e.sim,`timeScale`,.05,2,.01).name(`time scale`),o.add(e.sim,`paused`),o.add({r:()=>e.respawn()},`r`).name(`respawn on rooftop`);for(let t of[`tour`,`swing`,`swingTurn`,`diveCatch`,`parkour`])o.add({f:()=>e.bench(t)},`f`).name(`bench: ${t}`);let s=this.gui.addFolder(`Tuning`),c=K;for(let e of Object.keys(Qc)){let t=s.addFolder(e);t.close();for(let n of Object.keys(c[e])){let r=el(`${e}.${n}`,c[e][n]);t.add(c[e],n,r.min,r.max,r.step)}}s.add({reset:()=>{nl(),this.gui.controllersRecursive().forEach(e=>e.updateDisplay())}},`reset`).name(`reset all tuning`),s.close(),this.gui.close(),this.gui.hide()}toggle(){this.gui._hidden?(this.gui.show(),this.gui.open()):this.gui.hide()}},dh=class{gl;ext;pending=[];free=[];active=null;ms=-1;constructor(e){this.gl=e,this.ext=e.getExtension(`EXT_disjoint_timer_query_webgl2`)}get supported(){return!!this.ext}begin(){if(!this.ext||this.active||this.pending.length>4)return;let e=this.free.pop()??this.gl.createQuery();e&&(this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT,e),this.active=e)}end(){this.ext&&this.active&&(this.gl.endQuery(this.ext.TIME_ELAPSED_EXT),this.pending.push(this.active),this.active=null,this.poll())}poll(){let e=this.gl;for(;this.pending.length;){let t=this.pending[0];if(!e.getQueryParameter(t,e.QUERY_RESULT_AVAILABLE))break;if(this.pending.shift(),!e.getParameter(this.ext.GPU_DISJOINT_EXT)){let n=e.getQueryParameter(t,e.QUERY_RESULT)/1e6;this.ms=this.ms<0?n:this.ms+(n-this.ms)*.1}this.free.push(t)}}},fh=class{style;yaw;releaseT=0;t=0;m={seconds:0,distance:0,avgSpeed:0,maxSpeed:0,avgSwingSpeed:0,minSwingClearance:1/0,swings:0,groundTouches:0,wallContacts:0,releases:0,avgReleaseQuality:0,swingJumps:0,perfectJumps:0,wallSlams:0,states:{},webFails:0};qSum=0;swingT=0;swingDist=0;last=null;_v=new V;constructor(e,t){this.style=e,this.yaw=t}drive(e,t,n){this.t+=n,t.camYaw=this.yaw,this.style===`swingTurn`&&(t.camYaw=this.yaw+Math.floor(this.t/6)*(Math.PI/2));let r=t.camYaw;t.camForward.set(-Math.sin(r),-.15,-Math.cos(r)).normalize(),t.moveX=0,t.moveY=1,t.jump=!1,t.zip=!1,t.dive=!1;let i=e.state;if(this.style===`parkour`){t.traverse=!0;return}if(i===`Swinging`){let n=e.rope;if(this.style===`swingHold`)t.traverse=!0;else if(this.style===`swingChain`)t.traverse=!0,t.jump=n.age>.3&&Hl(e.swingPhase,e.swingArcEnd,e.swingOmega)>=1,t.jump&&(this.releaseT=.1);else{let r=this.style===`swingLow`?.72:.66;e.swingPhase>r&&e.vel.y>0&&n.age>.35?(t.traverse=!1,this.releaseT=.12):t.traverse=!0}}else if(i===`Grounded`||i===`Landing`||i===`Recovery`)t.traverse=!0,t.jump=this.t%.5<.25;else if(i===`WallRunning`||i===`WallCrawling`)t.traverse=!0,t.jump=!0;else{if(this.releaseT-=n,this.style===`diveCatch`&&e.vel.y<0&&e.feetY>30){t.dive=!0,t.traverse=!1,t.camForward.set(-Math.sin(r)*.4,-1,-Math.cos(r)*.4).normalize();return}t.traverse=this.style===`swingHold`?!0:this.style===`swingChain`?this.releaseT<=0&&e.vel.y<3:this.releaseT<=0&&e.vel.y<(this.style===`swingLow`?-4:2)}}observe(e,t){let n=this.m;n.seconds+=t;let r=e.vel.length();n.maxSpeed=Math.max(n.maxSpeed,r);let i=this._v.subVectors(e.pos,e.prevPos).length();n.distance+=i;let a=e.state;n.states[a]=(n.states[a]??0)+t,a===`Swinging`&&(n.minSwingClearance=Math.min(n.minSwingClearance,e.feetY-e.surfaceBelow()),this.swingT+=t,this.swingDist+=i),a!==this.last&&(a===`Swinging`&&n.swings++,(a===`Grounded`||a===`Landing`||a===`Recovery`)&&n.groundTouches++,(a===`WallRunning`||a===`WallCrawling`)&&n.wallContacts++,this.last=a);for(let t of e.events)t.type===`webRelease`&&(n.releases++,this.qSum+=t.a),t.type===`webFail`&&n.webFails++,t.type===`swingJump`&&(n.swingJumps++,t.a>=1&&n.perfectJumps++),t.type===`wallSlam`&&n.wallSlams++;e.events.length=0,n.avgSpeed=n.distance/Math.max(1e-6,n.seconds),n.avgSwingSpeed=this.swingDist/Math.max(1e-6,this.swingT),n.avgReleaseQuality=n.releases?this.qSum/n.releases:0}},ph=class{goals;gi=0;gt=0;releases=0;swings=0;lastState=null;log={goals:[],visited:[],transitions:[]};yaw=0;_v=new V;finished=!1;constructor(e=0){this.yaw=e;let t=(e,t)=>{if(t.moveY=1,this.followStreet(e),e.state===`WallRunning`||e.state===`WallCrawling`){t.jump=!0,t.traverse=!0;return}if(e.state===`Grounded`||e.state===`Landing`||e.state===`Recovery`){t.traverse=!0,t.jump=e.stateTime>.1;return}e.state===`Swinging`?(t.traverse=!(e.rope.swingAngle>30&&e.vel.y>0&&e.rope.age>.35),t.traverse||this.releases++):t.traverse=e.vel.y<1};this.goals=[{name:`sprint to roof edge and leap`,timeout:6,drive:(e,t)=>{t.moveY=1,t.traverse=!0},done:e=>e.state===`Airborne`&&e.vel.y>0},{name:`turn up the avenue`,timeout:1,enter:()=>{this.yaw=0},drive:(e,t)=>{t.moveY=1,t.traverse=e.feetY-e.surfaceBelow()>4&&e.vel.y<0},done:(e,t)=>t>.3},{name:`dive toward the street`,timeout:3,drive:(e,t)=>{t.moveY=1,t.dive=e.vel.y<2,t.camForward.set(-Math.sin(this.yaw),-.6,-Math.cos(this.yaw)).normalize()},done:(e,t)=>t>.9||e.feetY<22},{name:`catch webs and swing, releasing on the up-swing`,timeout:12,enter:()=>{this.releases=0,this.swings=0},drive:(e,n)=>t(e,n),done:()=>this.releases>=1&&this.swings>=2},{name:`web zip to a point`,timeout:6,drive:(e,n,r)=>{n.moveY=.6,n.camForward.set(-Math.sin(this.yaw),.25,-Math.cos(this.yaw)).normalize(),e.perchTarget&&e.state!==`WebZip`?(n.zip=r%.2<.1,n.traverse=!1):e.state!==`WebZip`&&t(e,n)},done:e=>e.state===`Perching`||e.state===`PointLaunch`},{name:`point launch`,timeout:2,drive:(e,t,n)=>{t.jump=e.state===`Perching`&&n%.2<.1},done:e=>e.state===`PointLaunch`||e.state===`Airborne`&&e.vel.y>8},{name:`swing to a facade and wall-run up it`,timeout:10,enter:e=>{this.yaw=this.nearestWallYaw(e)},drive:(e,t)=>{this.yaw=this.nearestWallYaw(e),t.moveY=1,t.traverse=e.state===`Swinging`||e.vel.y<1||e.state===`Grounded`||e.state===`WallRunning`||e.state===`WallCrawling`},done:e=>e.state===`WallRunning`},{name:`run up and over the top`,timeout:14,drive:(e,t)=>{t.moveY=1,t.traverse=!0},done:e=>e.state===`Mantling`||e.state===`Grounded`||e.state===`Airborne`&&e.fsm.previous===`WallRunning`},{name:`leap and swing again`,timeout:14,enter:e=>{this.yaw+=Math.PI,this.releases=0},drive:(e,n,r)=>{n.moveY=1,e.state===`Grounded`||e.state===`Mantling`||e.state===`Landing`||e.state===`Recovery`?(n.traverse=!0,n.jump=r%.4<.2):(t(e,n),n.dive=e.state===`Airborne`&&e.vel.y<0&&e.feetY>70)},done:e=>e.state===`Swinging`&&e.stateTime>.4}]}streetT=0;followStreet(e){if(e.simTime-this.streetT<.5)return;this.streetT=e.simTime;let t=this.yaw,n=-1/0,r=this._v.set(e.pos.x,Math.max(e.pos.y-8,3),e.pos.z),i=Math.round(this.yaw/(Math.PI/2))*(Math.PI/2),a=e.city?.bounds;for(let o=-1;o<=1;o++){let s=i+o*Math.PI/2,c=new V(-Math.sin(s),0,-Math.cos(s)),l=e.world.raycast(r,c,200,e.hit,8,!1)?e.hit.t:200;if(a){let e=c.x>.001?(a.x1-40-r.x)/c.x:c.x<-.001?(a.x0+40-r.x)/c.x:1/0,t=c.z>.001?(a.z1-40-r.z)/c.z:c.z<-.001?(a.z0+40-r.z)/c.z:1/0;l=Math.min(l,Math.max(0,e),Math.max(0,t))}let u=l-Math.abs(o)*40;u>n&&(n=u,t=s)}this.yaw=t}nearestWallYaw(e){let t=this.yaw,n=1/0,r=this._v.copy(e.pos);for(let i=0;i<24;i++){let a=i/24*Math.PI*2,o=new V(-Math.sin(a),0,-Math.cos(a));e.world.raycast(r,o,120,e.hit,9,!1)&&e.hit.t<n&&e.world.maxY[e.hit.box]>e.feetY+12&&(n=e.hit.t,t=a)}return t}drive(e,t,n){if(t.moveX=0,t.moveY=0,t.jump=!1,t.traverse=!1,t.zip=!1,t.dive=!1,t.trick=!1,t.drop=!1,t.camYaw=this.yaw,t.camForward.set(-Math.sin(this.yaw),-.1,-Math.cos(this.yaw)).normalize(),this.finished)return;let r=this.goals[this.gi];this.gt===0&&r.enter?.(e),this.gt+=n,r.drive(e,t,this.gt),t.camYaw=this.yaw}observe(e){let t=e.state;if(t!==this.lastState&&(t===`Swinging`&&this.swings++,this.log.visited.includes(t)||this.log.visited.push(t),this.lastState&&this.log.transitions.push(`${this.lastState}>${t}`),this.lastState=t),this.finished)return;let n=this.goals[this.gi],r=n.done(e,this.gt);(r||this.gt>n.timeout)&&(this.log.goals.push({name:n.name,ok:r,time:+this.gt.toFixed(2)}),this.gi++,this.gt=0,this.gi>=this.goals.length&&(this.finished=!0))}},mh=class{container;renderer;scene=new di;city;world;player;cityView;env;cam;post;input;intent=new Tl;rig=new cp;anim=new Up(this.rig);audio=new cm;ai=null;web;zipWeb;debug;hud;panel;gpu;acc=0;last=0;skyline;farGround;water;bridge;speedFx;fps=60;frameMs=16;simTime=0;bench=null;renderPos=new V;_v=new V;_w=new V;pred=Ul(160);hudTimer=0;stepsLastFrame=0;flags={velocity:!1,acceleration:!1,tension:!1,anchor:!0,candidates:!1,scores:!1,trajectory:!1,collision:!1,forces:!1,stats:!1};hooks;quality;timeScale=1;paused=!1;constructor(e,t){this.container=e,this.renderer=new Zc({antialias:!1,powerPreference:`high-performance`,stencil:!1}),this.renderer.outputColorSpace=Ne,this.renderer.toneMapping=6,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=2,this.renderer.info.autoReset=!1,e.appendChild(this.renderer.domElement),this.gpu=new dh(this.renderer.getContext()),this.cam=new sd(1),this.env=new Rd(this.scene,this.renderer),this.post=new bf(this.renderer,this.scene,this.cam.camera),this.quality=t.quality,this.input=new El(this.renderer.domElement),this.scene.add(this.rig.root),this.web=new wf(this.scene),this.zipWeb=new wf(this.scene),this.speedFx=new Df(this.scene);let n=document.createElement(`div`);n.className=`overlay`,e.appendChild(n),this.debug=new Km(this.scene,n),this.hud=new qm(e),this.flags.stats=t.debug,this.debug.enabled=t.debug,this.hooks={flags:this.flags,env:{timeOfDay:this.env.timeOfDay,bloom:1},quality:{preset:this.quality},suit:{skin:cp.SKINS[0],options:[...cp.SKINS]},onSuit:()=>this.setSkin(cp.SKINS.indexOf(this.hooks.suit.skin)),ai:{cars:!0,pedestrians:!0},audio:{volume:.8,muted:!1},sim:{timeScale:1,paused:!1},seed:t.seed,onTime:()=>{this.env.timeOfDay=this.hooks.env.timeOfDay,this.applyTime()},onQuality:()=>this.setQuality(this.hooks.quality.preset),onAI:()=>this.ai?.setEnabled(this.hooks.ai.cars,this.hooks.ai.pedestrians),onAudio:()=>{this.audio.masterVolume=this.hooks.audio.volume,this.audio.muted=this.hooks.audio.muted},onBloom:()=>this.post.setBloom(this.hooks.env.bloom),respawn:()=>this.spawn(),regenerate:e=>{let t=new URL(location.href);t.searchParams.set(`seed`,String(e)),location.href=t.toString()},bench:e=>this.startBench(e,20)},this.panel=new uh(this.hooks);let r=0;try{r=Number(localStorage.getItem(`strand.skin`)??0)||0}catch{}this.setSkin(r),this.buildWorld(t.seed),this.setQuality(this.quality),window.addEventListener(`resize`,()=>this.resize()),this.resize();let i=()=>this.audio.start();window.addEventListener(`pointerdown`,i),window.addEventListener(`keydown`,i),t.timeOfDay!==void 0&&(this.env.timeOfDay=this.hooks.env.timeOfDay=t.timeOfDay),this.applyTime(),t.bench&&this.startBench(t.bench,t.benchSeconds)}buildWorld(e){let t=performance.now();this.city=bl({seed:e}),this.world=Cl(this.city),this.player=new rd(this.world,this.city),this.cityView=new Yd(this.city),this.cityView.addTo(this.scene),this.env.setStaticCasters(this.cityView.group);let n=Pf(this.city);this.skyline=new rp(n),this.farGround=new ip(n,this.city),this.water=new op(n),this.bridge=new sp(n.bridge),this.scene.add(this.skyline.group,this.farGround.group,this.water.mesh,this.bridge.group),this.ai=new Wm(this.city,this.scene,{seed:e}),this.updateLights(),this.spawn(),console.info(`[strand] city seed ${e}: ${this.city.stats.buildings} buildings, ${this.city.stats.tiers} tiers, ${this.city.stats.props} props, ${this.world.count} colliders, ${this.cityView.drawCalls} draws, ${this.cityView.instances} instances, built in ${(performance.now()-t).toFixed(0)} ms`)}setSkin(e,t=!1){this.rig.setSkin(e),this.hooks.suit.skin=cp.SKINS[this.rig.skin];try{localStorage.setItem(`strand.skin`,String(this.rig.skin))}catch{}t&&this.hud.flash(`suit: ${cp.SKINS[this.rig.skin]}`)}applyTime(){this.env.apply(),this.post.setLook(this.env.look),this.updateLights()}updateLights(){this.ai?.setLightIntensity(.4+2.6*hh(this.env.timeOfDay))}spawn(){let e=wl(this.city);this.player.spawn(e.x,e.y,e.z,e.yaw),this.player.fsm.reset(`Airborne`),this.cam.snapTo(this.player.pos,e.yaw),this.cam.pitch=-.12}setQuality(e){this.quality=e,this.prMax=Math.min(window.devicePixelRatio||1,e===`ultra`?2:e===`high`?1.5:e===`medium`?1:.75),this.renderer.setPixelRatio(this.prMax*this.prScale),this.drsWarm=2,this.env.setShadowQuality(e===`ultra`?4096:e===`high`?2048:1024,e!==`low`,e===`high`||e===`ultra`),this.renderer.shadowMap.enabled=e!==`low`,this.post.setQuality(e),this.resize()}prMax=1.5;prScale=1;drsT=0;gpuAvg=-1;drsFrames=0;drsMisses=0;drsClean=0;drsCeil=1;drsWarm=3;rawDt=1/60;dynamicResolution(e){if(this.gpu.supported&&this.gpu.ms>=0&&(this.gpuAvg=this.gpuAvg<0?this.gpu.ms:this.gpuAvg+(this.gpu.ms-this.gpuAvg)*.1),this.drsWarm>0){this.drsWarm-=e;return}if(this.drsFrames++,this.rawDt>1/45&&this.drsMisses++,this.drsT+=e,this.drsT<.5)return;let t=this.drsMisses/Math.max(1,this.drsFrames);if(this.drsT=0,this.drsFrames=0,this.drsMisses=0,document.hidden)return;this.drsCeil=Math.min(1,this.drsCeil+.5/30);let n=this.prScale;t>.12?(this.drsCeil=n*.98,n*=.85,this.drsClean=0):t<.02?(this.drsClean+=.5,this.drsClean>=2&&n<this.drsCeil&&(n=Math.min(this.drsCeil,n*1.08),this.drsClean=0)):this.drsClean=0,n=Math.min(1,Math.max(.5,n)),Math.abs(n-this.prScale)>.01&&(this.prScale=n,this.renderer.setPixelRatio(this.prMax*n),this.resize())}get renderScale(){return this.prScale}resize(){let e=this.container.clientWidth||window.innerWidth,t=this.container.clientHeight||window.innerHeight;this.renderer.setSize(e,t),wf.viewportH=t*this.renderer.getPixelRatio(),this.skyline?.setPixelRatio(this.renderer.getPixelRatio()),this.post.setSize(e,t),this.cam.camera.aspect=e/t,this.cam.camera.updateProjectionMatrix()}startBench(e,t){this.spawn(),this.player.vel.set(0,0,-15),this.cam.yaw=0;let n=wl(this.city),r=e===`tour`?new ph(n.yaw):null;r&&this.player.vel.set(0,0,0),this.bench={bot:new fh(e,0),tour:r,frames:[],sim:[],render:[],t:0,seconds:t,name:e},this.hud.flash(`BENCH ${e} (${t}s)`),this.hud.hideHelp(),console.info(`[strand] bench ${e} started`)}start(){this.last=performance.now();let e=t=>{requestAnimationFrame(e),this.frame(t)};requestAnimationFrame(e)}frame(e){let t=(e-this.last)/1e3;this.last=e;let n=q(t,5e-4,.1);this.rawDt=t,this.fps+=(1/Math.max(.001,t)-this.fps)*.05,this.frameMs+=(t*1e3-this.frameMs)*.05,cl.begin(`frame`),this.handleUIKeys();let r=this.input.fill(this.intent),i=K.camera.sensitivity;this.cam.look(this.input.lookDX*i+r.padLookX*3.2*n,this.input.lookDY*i+r.padLookY*2.4*n),this.input.lookDX=this.input.lookDY=0,this.bench&&(this.cam.yaw=this.intent.camYaw),this.intent.camYaw=this.cam.yaw,this.intent.camPitch=this.cam.pitch,this.intent.camForward.copy(this.cam.forward.lengthSq()>0?this.cam.forward:this._v.set(0,0,-1)),cl.begin(`sim`);let a=1/K.physics.fixedHz;this.paused=this.hooks.sim.paused,this.timeScale=this.hooks.sim.timeScale,this.paused||(this.acc+=n*this.timeScale);let o=0,s=this.player;for(;this.acc>=a&&o<10;)this.bench&&(this.bench.tour?this.bench.tour.drive(s,this.intent,a):this.bench.bot.drive(s,this.intent,a),this.cam.yaw=this.intent.camYaw),this.intent.latch(),s.step(a,this.intent),this.handleEvents(),this.bench&&(this.bench.tour?.observe(s),this.bench.bot.observe(s,a)),this.acc-=a,this.simTime+=a,o++;o===10&&(this.acc=0),this.stepsLastFrame=o;let c=cl.end(`sim`),l=this.acc/a;this.renderPos.lerpVectors(s.prevPos,s.pos,l),cl.begin(`anim`);let u=this.animFrame();this.anim.update(n,u);for(let e of this.anim.steps){let t={type:e.wall?`wallStep`:`footstep`,a:e.speed,pos:this.renderPos};this.audio.onEvent(t,this.audioFrame())}cl.end(`anim`),cl.begin(`camera`),this.cam.update(n,this.cameraFrame(),this.world),cl.end(`camera`),this.env.followShadow(this.renderPos),this.env.update(n),Wf(this.env,n),this.bridge.update(),cl.begin(`ai`),this.ai?.update(n,{pos:this.renderPos,vel:s.vel},this.cam.camera),cl.end(`ai`),this.updateWebs(n),this.speedFx.update(n,this.cam.camera,s.vel,48);let d=s.vel.length();this.post.setSpeed(Y(30,85,d)*.9);let f=this.audioFrame();if(this.audio.update(n,f),this.ai)for(let e of this.ai.drainHonks())this.audio.honk(Math.hypot(e.x-this.cam.camera.position.x,e.z-this.cam.camera.position.z));this.drawDebug(),this.updateHud(n,c),cl.begin(`render`),this.renderer.info.reset(),this.env.prepare(),this.gpu.begin(),this.post.render(this.scene,this.cam.camera,n),this.gpu.end(),this.dynamicResolution(n);let p=cl.end(`render`);cl.end(`frame`),this.tickBench(n,c,p)}handleUIKeys(){let e=this.input;if((e.consume(`Backquote`)||e.consume(`F1`))&&this.panel.toggle(),e.consume(`KeyG`)&&(this.debug.enabled=!this.debug.enabled,this.flags.stats=this.debug.enabled,this.flags.candidates=this.debug.enabled,this.flags.scores=this.debug.enabled,this.flags.trajectory=this.debug.enabled,this.flags.velocity=this.debug.enabled),e.consume(`KeyH`)&&this.hud.toggleHelp(),e.consume(`KeyK`)&&this.setSkin(this.rig.skin+1,!0),e.consume(`KeyM`)&&(this.audio.muted=!this.audio.muted,this.hud.flash(this.audio.muted?`muted`:`sound on`)),e.consume(`KeyT`)){let e=[.3,.5,.71,.78,.9],t=e.findIndex(e=>e>this.env.timeOfDay+.01);this.env.timeOfDay=e[t<0?0:t],this.hooks.env.timeOfDay=this.env.timeOfDay,this.applyTime()}e.consume(`KeyP`)&&(this.hooks.sim.paused=!this.hooks.sim.paused),e.consume(`Backspace`)&&this.spawn(),e.pressedOnce.clear()}handleEvents(){let e=this.player;if(!e.events.length)return;let t=this.audioFrame();for(let n of e.events)switch(this.audio.onEvent(n,t),n.type){case`hardLand`:this.cam.addTrauma(.55),this.cam.landingDip(n.a),this.ai?.notifyImpact(n.pos.x,n.pos.z,1);break;case`roll`:this.cam.addTrauma(.15),this.cam.landingDip(n.a*.6),this.ai?.notifyImpact(n.pos.x,n.pos.z,.5);break;case`land`:this.cam.landingDip(n.a*.5),n.a>8&&this.ai?.notifyImpact(n.pos.x,n.pos.z,.25);break;case`superJump`:case`pointLaunch`:this.cam.addTrauma(.12);break;case`webFire`:this.web.fire();break;case`webAttach`:this.cam.onWebAttach(e.vel.length());break;case`webRelease`:n.a>.85&&!e.chainPending&&this.hud.flash(`perfect release`);break;case`swingJump`:n.a>=1&&(this.hud.flash(`perfect jump`),this.cam.addTrauma(.1))}this.bench||(e.events.length=0)}animFrame(){let e=this.player;return this._af??={pos:this.renderPos,vel:e.vel,acc:e.accSmooth,state:e.state,stateTime:e.stateTime,facing:e.facing,ropeActive:!1,anchor:e.rope.anchor,swingAngle:0,tension:0,zipTarget:e.zipWebPoint,wallNormal:e.wallNormal,wallMode:`vertical`,trickKind:0,landingImpact:0,diving:!1,jumpCharge:0,releaseQuality:0,camForward:this.cam.forward,swingTuck:0,swingPhase:0},Object.assign(this._af,{state:e.state,stateTime:e.stateTime,facing:e.facing,ropeActive:e.rope.active,swingAngle:e.rope.swingAngle,tension:e.rope.tension,wallMode:e.wallMode,trickKind:e.trickKind,landingImpact:e.landingImpact,diving:this.intent.dive&&(e.state===`Airborne`||e.state===`Trick`),jumpCharge:e.jumpCharge,releaseQuality:e.releaseQuality,swingTuck:e.swingTuck,swingPhase:e.swingPhase})}_af=null;cameraFrame(){let e=this.player;return this._cf??={pos:this.renderPos,vel:e.vel,acc:e.accSmooth,state:e.state,wallNormal:e.wallNormal,wallMode:`vertical`,ropeActive:!1,anchor:e.rope.anchor,diving:!1},Object.assign(this._cf,{state:e.state,wallMode:e.wallMode,ropeActive:e.rope.active,diving:this.intent.dive&&e.state===`Airborne`})}_cf=null;audioFrame(){let e=this.player,t=this.cam.camera.position,n=this.ai?this.ai.densityNear(t.x,t.z):{traffic:0,crowd:0};return this._aud??={speed:0,verticalSpeed:0,altitude:0,state:``,ropeActive:!1,ropeTension:0,diving:!1,camPos:t,camForward:this.cam.forward,nearbyTraffic:0,nearbyCrowd:0,timeOfDay:.7},Object.assign(this._aud,{speed:e.vel.length(),verticalSpeed:e.vel.y,altitude:e.feetY,state:e.state,ropeActive:e.rope.active,ropeTension:e.rope.tension,diving:this.intent.dive&&e.state===`Airborne`,nearbyTraffic:n.traffic,nearbyCrowd:n.crowd,timeOfDay:this.env.timeOfDay})}_aud=null;updateWebs(e){let t=this.player,n=this.cam.camera;if(t.rope.active&&t.state===`Swinging`){let r=this.anim.webHandPosition(this._v),i=q((t.rope.distance-t.rope.length+1.5)/1.5,0,1);this.web.update(e,n,r,t.rope.anchor,i,t.rope.tension)}else this.web.update(e,n,null,t.rope.anchor,1,0);t.state===`WebZip`?(this.rig.handR.getWorldPosition(this._w),this.zipWeb.update(e,n,this._w,t.zipWebPoint,1,0)):this.zipWeb.update(e,n,null,t.zipWebPoint,1,0);let r=t.perchTarget;if(r&&t.state!==`WebZip`&&t.state!==`Perching`){let e=this._w.set(r.x,r.y,r.z).project(n);e.z<1?this.hud.setReticle((e.x+1)/2*this.container.clientWidth-9,(1-e.y)/2*this.container.clientHeight-9):this.hud.setReticle(null)}else this.hud.setReticle(null)}drawDebug(){let e=this.debug;if(e.begin(),!e.enabled){e.end();return}let t=this.player,n=this.flags,r=this.cam.camera,i=this.renderPos;if(n.velocity&&e.arrow(i,t.vel,.12,65382),n.acceleration&&e.arrow(i,t.accSmooth,.03,16755200),t.rope.active&&n.anchor&&(e.cross(t.rope.anchor,.8,16724821),n.tension)){let n=q(t.rope.tension/8e3,0,1);e.line(i,t.rope.anchor,Math.round(255*n)<<16|Math.round(255*(1-n))<<8),e.label(this._v.copy(i).lerp(t.rope.anchor,.5),`T ${(t.rope.tension/1e3).toFixed(1)} kN`,r,`#ffd`)}if(n.forces&&t.state===`Swinging`){let n=t.swingDbg;e.arrow(i,n.pump,.004,3394815),e.arrow(i,n.steer,.004,13395711),e.arrow(i,n.assist,.004,16777011),e.arrow(i,n.drag,.004,16737894)}let a=t.anchors;if(n.candidates){let t=-1/0,i=1/0;for(let e=0;e<a.count;e++){let n=a.candidates[e];n.valid&&(t=Math.max(t,n.score),i=Math.min(i,n.score))}for(let o=0;o<a.count;o++){let s=a.candidates[o],c=s.valid?(s.score-i)/Math.max(.001,t-i):0,l=s.valid?s===a.best?16777215:Math.round(255*(1-c))<<16|Math.round(255*c)<<8|32:5592405;e.cross(s.point,s===a.best?.9:.4,l),n.scores&&s.valid&&e.label(s.point,s.score.toFixed(2)+(s.collided?` ✗`:``),r,s===a.best?`#fff`:`#bbb`)}for(let t=0;t<a.predictionCount;t++){let n=a.predictions[t];for(let t=1;t<n.count;t++)e.line(n.points[t-1],n.points[t],n.collided?8930372:4482696)}}if(n.trajectory){let n=Zl(t.pos,t.vel,t.rope.active?t.rope.anchor:null,t.rope.length,null,2,1/60,this.world,null,this.pred,!0);for(let t=1;t<n.count;t++)e.line(n.points[t-1],n.points[t],65535)}if(n.collision){let t=this.world;t.queryRect(i.x-30,i.z-30,i.x+30,i.z+30,n=>{t.maxY[n]<i.y-40||t.minY[n]>i.y+40||e.box(t.minX[n],t.minY[n],t.minZ[n],t.maxX[n],t.maxY[n],t.maxZ[n],2254506)}),e.circle(this._v.set(i.x,i.y-.9,i.z),.4,16777215),e.circle(this._v.set(i.x,i.y+.45,i.z),.4,16777215)}e.end()}updateHud(e,t){let n=this.player;if(this.hud.update(e),n.vel.lengthSq()>4&&this.hud.noteActivity(e),this.hud.setSpeed(n.vel.length(),n.state),this.hudTimer-=e,this.hudTimer>0)return;if(this.hudTimer=.1,this.hud.showStats=this.flags.stats,!this.flags.stats){this.hud.setStats(``);return}let r=n.rope,i=this.renderer.info,a=this.ai?.stats(),o=[`FPS ${this.fps.toFixed(0)}  frame ${this.frameMs.toFixed(1)} ms  steps ${this.stepsLastFrame}`,`CPU sim ${cl.get(`sim`).toFixed(2)} ms (${t.toFixed(2)})  anim ${cl.get(`anim`).toFixed(2)}  cam ${cl.get(`camera`).toFixed(2)}  ai ${cl.get(`ai`).toFixed(2)}`,`CPU render submit ${cl.get(`render`).toFixed(2)} ms  GPU ${this.gpu.supported?this.gpu.ms>=0?this.gpu.ms.toFixed(2)+` ms`:`…`:`n/a`}  res ${(this.prScale*100).toFixed(0)}%`,`draws ${i.render.calls}  tris ${(i.render.triangles/1e3).toFixed(0)}k  anchor select ${n.anchors.lastTimeMs.toFixed(2)} ms`,`state ${n.state} (${n.stateTime.toFixed(2)} s)  prev ${n.fsm.previous??`-`}`,`speed ${n.vel.length().toFixed(1)} m/s (${(n.vel.length()*2.237).toFixed(0)} mph)  h ${sl(n.vel).toFixed(1)}  v ${n.vel.y.toFixed(1)}`,`altitude ${n.feetY.toFixed(1)} m  above surface ${(n.feetY-n.surfaceBelow()).toFixed(1)} m`,r.active?`web L ${r.length.toFixed(1)} → ${r.targetLength.toFixed(1)} m  d ${r.distance.toFixed(1)}  angle ${r.swingAngle.toFixed(0)}°  v_r ${r.radialVel.toFixed(2)}  v_t ${r.tangentialSpeed.toFixed(1)}  T ${(r.tension/1e3).toFixed(2)} kN (analytic ${(r.tensionAnalytic/1e3).toFixed(2)})`:`web -  last release quality ${(n.releaseQuality*100).toFixed(0)}%`,a?`traffic ${a.carsActive}/${a.cars} (drawn ${a.carsRendered})  peds ${a.pedsActive}/${a.peds} (drawn ${a.pedsRendered})  ai sim ${a.simMs.toFixed(2)} ms`:``,`audio ${JSON.stringify(this.audio.stats()).slice(0,90)}`];this.hud.setStats(o.join(`
`))}tickBench(e,t,n){let r=this.bench;if(!r||(r.t+=e,r.frames.push(e*1e3),r.sim.push(t),r.render.push(n),this.player.events.length=0,r.t<r.seconds&&!(r.tour&&r.tour.finished)))return;let i=[...r.frames].sort((e,t)=>e-t),a=e=>e.reduce((e,t)=>e+t,0)/Math.max(1,e.length),o={bench:r.name,seconds:+r.t.toFixed(2),frames:r.frames.length,fpsAvg:+(1e3/a(r.frames)).toFixed(1),frameMsP50:+i[Math.floor(i.length*.5)].toFixed(2),frameMsP99:+i[Math.floor(i.length*.99)].toFixed(2),simMsAvg:+a(r.sim).toFixed(3),renderSubmitMsAvg:+a(r.render).toFixed(3),gpuMs:this.gpu.supported?+this.gpu.ms.toFixed(2):null,renderScale:+this.prScale.toFixed(2),drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,flight:{...r.bot.m,states:r.bot.m.states},tour:r.tour?.log.goals,ai:this.ai?.stats()};console.info(`BENCH_RESULT `+JSON.stringify(o)),window.__benchResult=o,this.hud.flash(`bench done: ${o.fpsAvg} fps, ${o.flight.avgSpeed.toFixed(1)} m/s`),this.bench=null}debugState(){let e=this.player;return{state:e.state,pos:e.pos.toArray(),vel:e.vel.toArray(),fps:this.fps}}};function hh(e){return 1-Y(-4,14,Math.sin((e-.25)*Math.PI*2)*62)}var gh=new URLSearchParams(location.search),_h=document.getElementById(`app`),vh=document.getElementById(`start`);zd.value=Number(gh.get(`fdebug`)??0);function yh(){try{let e=new mh(_h,{seed:Number(gh.get(`seed`)??1337)||1337,quality:gh.get(`quality`)??(matchMedia(`(max-width: 900px)`).matches?`medium`:`high`),bench:gh.get(`bench`)??null,benchSeconds:Number(gh.get(`seconds`)??20),debug:gh.has(`debug`),timeOfDay:gh.has(`tod`)?Number(gh.get(`tod`)):void 0});Object.assign(window,{game:e,tuning:K}),gh.has(`skin`)&&e.setSkin(Math.max(0,[`strand`,`classic`].indexOf((gh.get(`skin`)??``).toLowerCase()))),e.start(),vh.classList.add(`hidden`)}catch(e){console.error(e),vh.innerHTML=`<h1>STRAND</h1><p>WebGL2 is required. ${e.message}</p>`}}gh.has(`bench`)||gh.has(`autostart`)?yh():vh.addEventListener(`click`,yh,{once:!0});