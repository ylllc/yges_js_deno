// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import PropTree from './proptree.js';

// URL Builder -------------------------- //
(()=>{ // local namespace 

const _rx_proplayer=/^(.+)\[(.*)\]$/;

function _set_prop(prop,ks,v){

	if(ks.length<1){
		prop.set(v);
		return;
	}

	let k=ks.pop();
	if(k===''){
		let sub=PropTree.create({},true);
		prop.push(sub);
		_set_prop(sub,ks,v);
	}
	else{
		let sub=prop.dig(k);
		_set_prop(sub,ks,v);
	}
}

function _parse(url,opt={}){

	let pu={
		name:'YgEs_ParsedURL',
		User:{},

		scheme:'',
		slashes:'',
		user:'',
		pass:'',
		host:'',
		port:'',
		path:'',
		query:'',
		fragment:'',

		bake:()=>{
			let s=pu.path;
			if(pu.host!=''){
				s=encodeURIComponent(pu.host)+((pu.port=='')?'':':')+encodeURIComponent(pu.port)+s;

				if(pu.user!=''){
					s=encodeURIComponent(pu.user)+((pu.pass=='')?'':':')+encodeURIComponent(pu.pass)+'@'+s;
				}
			}
			if(pu.scheme!=''){
				s=encodeURIComponent(pu.scheme)+':'+pu.slashes+s;
			}
			if(pu.query!='')s+='?'+pu.query;
			if(pu.fragment!='')s+='#'+pu.fragment;
			return s;
		},

		extractHost:()=>{
			return URLBuilder.extractHost(pu.host);
		},
		bakeHost:(src)=>{
			pu.host=URLBuilder.bakeHost(src);
		},

		extractPath:()=>{
			return URLBuilder.extractPath(pu.path);
		},
		bakePath:(src)=>{
			pu.path=URLBuilder.bakePath(src);
		},

		extractArgs:()=>{
			return URLBuilder.extractArgs(pu.query);
		},
		bakeArgs:(src)=>{
			pu.query=URLBuilder.bakeArgs(src);
		},

		extractProp:()=>{
			return URLBuilder.extractProp(pu.query);
		},
		bakeProp:(src)=>{
			pu.query=URLBuilder.bakeProp(src);
		},
	}

	try{
		let u=new URL(url);
		let scheme_cp=u.protocol.indexOf(':');
		pu.scheme=(scheme_cp<0)?'':u.protocol.substring(0,scheme_cp);
		if(scheme_cp<0)pu.slashes='';
		else if(u.host)pu.slashes=u.origin.substring(scheme_cp+1,u.origin.length-u.host.length);
		else pu.slashes=u.href.substring(scheme_cp+1,u.href.length-u.pathname.length);

		if(u.username!='')pu.user=decodeURIComponent(u.username);
		if(u.password!='')pu.pass=decodeURIComponent(u.password);
		if(u.hostname!='')pu.host=u.hostname;
		if(u.port!='')pu.port=u.port;
		if(u.pathname!='')pu.path=u.pathname;
		if(u.search!=''){
			let query_qp=u.search.indexOf('?');
			pu.query=(query_qp<0)?'':u.search.substring(query_qp+1);
		}
		if(u.hash!=''){
			let fragment_hp=u.hash.indexOf('#');
			pu.fragment=(fragment_hp<0)?'':u.hash.substring(fragment_hp+1);
		}

		switch(pu.scheme){
			case 'mailto':
			pu.path=decodeURIComponent(pu.path);
			let ap=pu.path.indexOf('@');
			if(ap>=0){
				pu.user=pu.path.substring(0,ap);
				pu.host=pu.path.substring(ap+1);
			}
			pu.path='';
			break;
		}
	}
	catch(e){
		let hp=url.indexOf('#');
		if(hp>=0){
			pu.fragment=url.substring(hp+1);
			url=url.substring(0,hp);
		}
		let qp=url.indexOf('?');
		if(qp>=0){
			pu.query=url.substring(qp+1);
			url=url.substring(0,qp);
		}
		pu.path=url;
	}

	return pu;
}

let URLBuilder=YgEs.URLBuilder={
	name:'YgEs_URLBuilder',
	User:{},

	parse:_parse,

	extractHost:(src)=>{
		if(src=='')return []
		return src.split('.');
	},
	bakeHost:(src)=>{
		if(src.length<1)return '';
		return src.join('.');
	},

	extractPath:(src)=>{
		if(src=='')return []
		let a=[]
		for(let s of src.split('/'))a.push(decodeURIComponent(s));
		return a;
	},
	bakePath:(src)=>{
		if(src.length<1)return '';
		let a=[]
		for(let s of src)a.push(encodeURIComponent(s));
		return a.join('/');
	},

	extractArgs:(src)=>{
		if(src=='')return []
		let a=[]
		for(let s of src.split('+')){
			a.push(decodeURIComponent(s));
		}
		return a;
	},
	bakeArgs:(src)=>{
		if(src.length<1)return '';
		let a=[]
		for(let s of src)a.push(encodeURIComponent(s));
		return a.join('+');
	},

	extractProp:(src)=>{

		if(src=='')return {}

		let prop=PropTree.create({},true);
		for(let s of src.split('&')){
			let kv=s.split('=',2);
			if(kv.length<2)prop.push(s);
			else{
				let ks=[]
				let k=kv[0];
				while(true){
					let r=k.match(_rx_proplayer);
					if(!r)break;
					ks.push(decodeURIComponent(r[2]));
					k=r[1];
				}
				ks.push(k);
				_set_prop(prop,ks,decodeURIComponent(kv[1]));
			}
		}
		return prop.export();
	},
	bakeKey:(k,base)=>{
		k=encodeURIComponent(k);
		if(base=='')return k;
		return base+'['+k+']';
	},
	bakeInternal:(src,pool,base)=>{

		for(let k in src){
			let v=src[k];
			let k2=URLBuilder.bakeKey(k,base);
			let k3=Array.isArray(src)?(base+'[]'):k2;
			if(typeof v!=='object'){
				pool.push(k3+'='+encodeURIComponent(v));
				continue;
			}
			if(!v){
				pool.push(k3+'=');
				continue;
			}
			URLBuilder.bakeInternal(v,pool,k2);
		}
	},
	bakeProp:(src)=>{
		if(Object.keys(src).length<1)return '';
		let pool=[]
		URLBuilder.bakeInternal(src,pool,'');
		return pool.join('&');
	},
}

})();
export default YgEs.URLBuilder;
