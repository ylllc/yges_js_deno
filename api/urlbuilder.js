// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import PropTree from './proptree.js';

// URL Builder -------------------------- //
(()=>{ // local namespace 

const _rx_proplayer=/^(.+)\[(.*)\]$/;

function _set_prop(prop,ks,v){

	if(ks.length<1){
		prop.Set(v);
		return;
	}

	let k=ks.pop();
	if(k===''){
		let sub=PropTree.Create({},true);
		prop.Push(sub);
		_set_prop(sub,ks,v);
	}
	else{
		let sub=prop.Dig(k);
		_set_prop(sub,ks,v);
	}
}

function _parse(url,opt={}){

	let pu={
		name:'YgEs_ParsedURL',
		User:{},
		_private_:{},

		Scheme:'',
		Slashes:'',
		UID:'',
		Pass:'',
		Host:'',
		Port:'',
		Path:'',
		Query:'',
		Fragment:'',

		Bake:()=>{
			let s=pu.Path;
			if(pu.Host!=''){
				s=encodeURIComponent(pu.Host)+((pu.Port=='')?'':':')+encodeURIComponent(pu.Port)+s;

				if(pu.UID!=''){
					s=encodeURIComponent(pu.UID)+((pu.Pass=='')?'':':')+encodeURIComponent(pu.Pass)+'@'+s;
				}
			}
			if(pu.Scheme!=''){
				s=encodeURIComponent(pu.Scheme)+':'+pu.Slashes+s;
			}
			if(pu.Query!='')s+='?'+pu.Query;
			if(pu.Fragment!='')s+='#'+pu.Fragment;
			return s;
		},

		ExtractHost:()=>{
			return URLBuilder.ExtractHost(pu.Host);
		},
		BakeHost:(src)=>{
			pu.Host=URLBuilder.BakeHost(src);
		},

		ExtractPath:()=>{
			return URLBuilder.ExtractPath(pu.Path);
		},
		BakePath:(src)=>{
			pu.Path=URLBuilder.BakePath(src);
		},

		ExtractArgs:()=>{
			return URLBuilder.ExtractArgs(pu.Query);
		},
		BakeArgs:(src)=>{
			pu.Query=URLBuilder.BakeArgs(src);
		},

		ExtractProp:()=>{
			return URLBuilder.ExtractProp(pu.Query);
		},
		BakeProp:(src)=>{
			pu.Query=URLBuilder.BakeProp(src);
		},
	}

	try{
		let u=new URL(url);
		let scheme_cp=u.protocol.indexOf(':');
		pu.Scheme=(scheme_cp<0)?'':u.protocol.substring(0,scheme_cp);
		if(scheme_cp<0)pu.Slashes='';
		else if(u.host)pu.Slashes=u.origin.substring(scheme_cp+1,u.origin.length-u.host.length);
		else pu.Slashes=u.href.substring(scheme_cp+1,u.href.length-u.pathname.length);

		if(u.username!='')pu.UID=decodeURIComponent(u.username);
		if(u.password!='')pu.Pass=decodeURIComponent(u.password);
		if(u.hostname!='')pu.Host=u.hostname;
		if(u.port!='')pu.Port=u.port;
		if(u.pathname!='')pu.Path=u.pathname;
		if(u.search!=''){
			let query_qp=u.search.indexOf('?');
			pu.Query=(query_qp<0)?'':u.search.substring(query_qp+1);
		}
		if(u.hash!=''){
			let fragment_hp=u.hash.indexOf('#');
			pu.Fragment=(fragment_hp<0)?'':u.hash.substring(fragment_hp+1);
		}

		switch(pu.Scheme){
			case 'mailto':
			pu.Path=decodeURIComponent(pu.Path);
			let ap=pu.Path.indexOf('@');
			if(ap>=0){
				pu.UID=pu.Path.substring(0,ap);
				pu.Host=pu.Path.substring(ap+1);
			}
			pu.Path='';
			break;
		}
	}
	catch(e){
		let hp=url.indexOf('#');
		if(hp>=0){
			pu.Fragment=url.substring(hp+1);
			url=url.substring(0,hp);
		}
		let qp=url.indexOf('?');
		if(qp>=0){
			pu.Query=url.substring(qp+1);
			url=url.substring(0,qp);
		}
		pu.Path=url;
	}

	return pu;
}

let URLBuilder=YgEs.URLBuilder={
	name:'YgEs_URLBuilder',
	User:{},
	_private_:{},

	Parse:_parse,

	ExtractHost:(src)=>{
		if(src=='')return []
		return src.split('.');
	},
	BakeHost:(src)=>{
		if(src.length<1)return '';
		return src.join('.');
	},

	ExtractPath:(src)=>{
		if(src=='')return []
		let a=[]
		for(let s of src.split('/'))a.push(decodeURIComponent(s));
		return a;
	},
	BakePath:(src)=>{
		if(src.length<1)return '';
		let a=[]
		for(let s of src)a.push(encodeURIComponent(s));
		return a.join('/');
	},

	ExtractArgs:(src)=>{
		if(src=='')return []
		let a=[]
		for(let s of src.split('+')){
			a.push(decodeURIComponent(s));
		}
		return a;
	},
	BakeArgs:(src)=>{
		if(src.length<1)return '';
		let a=[]
		for(let s of src)a.push(encodeURIComponent(s));
		return a.join('+');
	},

	ExtractProp:(src)=>{

		if(src=='')return {}

		let prop=PropTree.Create({},true);
		for(let s of src.split('&')){
			let kv=s.split('=',2);
			if(kv.length<2)prop.Push(s);
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
		return prop.Export();
	},
	_bakeKey:(k,base)=>{
		k=encodeURIComponent(k);
		if(base=='')return k;
		return base+'['+k+']';
	},
	_bakeInternal:(src,pool,base)=>{

		for(let k in src){
			let v=src[k];
			let k2=URLBuilder._bakeKey(k,base);
			let k3=Array.isArray(src)?(base+'[]'):k2;
			if(typeof v!=='object'){
				pool.push(k3+'='+encodeURIComponent(v));
				continue;
			}
			if(!v){
				pool.push(k3+'=');
				continue;
			}
			URLBuilder._bakeInternal(v,pool,k2);
		}
	},
	BakeProp:(src)=>{
		if(Object.keys(src).length<1)return '';
		let pool=[]
		URLBuilder._bakeInternal(src,pool,'');
		return pool.join('&');
	},
}

})();
export default YgEs.URLBuilder;
