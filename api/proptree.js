// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Property Tree //

import qq from './quickqueue.js';

function _prop_internal(){

	var t={
		name:'YgEs_PropTree',
		_yges_propmix_:true,
		_sub:undefined,
		_ref:(q)=>{return undefined;},
		getType:()=>mif.PROPTYPE.EMPTY,
		export:()=>{return undefined;},
		toArray:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			var u=_prop_dig(t,q);
			_prop_toarray(u);
		},
		toProp:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			var u=_prop_dig(t,q);
			_prop_toprop(u);
		},
		exists:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_exists(t,q);
		},
		ref:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_ref(t,q);
		},
		dig:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_dig(t,q);
		},
		count:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_count(t,q);
		},
		get:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_get(t,q);
		},
		set:(...args)=>{
			var loc=args;
			var v=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_set(t,q,v);
		},
		cut:(...args)=>{
			var loc=args;
			var k=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_cut(t,q,k);
		},
		merge:(...args)=>{
			var loc=args;
			var v=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_merge(t,q,v);
		},
		push:(...args)=>{
			var loc=args;
			var v=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_push(t,q,v);
		},
		unshift:(...args)=>{
			var loc=args;
			var v=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_unshift(t,q,v);
		},
		pop:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_pop(t,q);
		},
		shift:(...args)=>{
			var loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_shift(t,q);
		},
		each:(...args)=>{
			var loc=args;
			var cb=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			var q=qq.create(loc);
			return _prop_each(t,q,cb);
		},
	}
	return t;
}

function _prop_replace(t,src,deep){

	if(src?._yges_propmix_){
		t._sub=src._sub;
		t._ref=src._ref;
		t.getType=src.getType;
		t.export=src.export;
	}
	else if(!deep || src===null || typeof src!=='object'){
		t._sub=undefined;
		t._ref=(q)=>{return undefined;}
		t.getType=()=>mif.PROPTYPE.MONO;
		t.export=()=>{return src;}
	}
	else if(Array.isArray(src)){
		t._sub=[]
		t.getType=()=>mif.PROPTYPE.ARRAY;
		for(var v of src)t._sub.push(_prop_create(v,deep));
		t._ref=(q)=>{
			var idx=q.next();
			var u=t._sub[idx];
			if(!u)return undefined;
			return _prop_ref(u,q);
		}
		t.export=()=>{
			var u=[]
			for(var v of t._sub){
				u.push(v?v.export():undefined);
			}
			return u;
		}
	}
	else{
		t._sub={}
		t.getType=()=>mif.PROPTYPE.PROP;
		for(var k in src)t._sub[k]=_prop_create(src[k],deep);
		t._ref=(q)=>{
			var idx=q.next();
			var u=t._sub[idx];
			if(!u)return undefined;
			return _prop_ref(u,q);
		}
		t.export=()=>{
			var u={}
			for(var k in t._sub){
				var v=t._sub[k];
				u[k]=v?v.export():undefined;
			}
			return u;
		}
	}
	return t;
}

function _prop_remove(t,k){

	switch(t.getType()){
		case mif.PROPTYPE.EMPTY:
		return undefined;

		case mif.PROPTYPE.MONO:
		t._sub=undefined;
		t._ref=(q)=>{return undefined;}
		t.getType=()=>mif.PROPTYPE.EMPTY;
		var v=t.export();
		t.export=()=>{return undefined;}
		return v;

		case mif.PROPTYPE.ARRAY:
		if(!t._sub[k])return undefined;
		var v=t._sub[k];
		t._sub=t._sub.slice(0,k).concat(t._sub.slice(k+1));
		return v;

		case mif.PROPTYPE.PROP:
		if(!t._sub[k])return undefined;
		var v=t._sub[k];
		delete t._sub[k];
		return v;
	}
	return undefined;
}

function _prop_create(init,deep){

	var t=_prop_internal();
	_prop_replace(t,init,deep);
	return t;
}

function _prop_exists(t,q){

	if(q.isEnd())return true;
	if(!t._sub)return false;

	var idx=q.next();
	var t2=t._sub[idx];
	if(!t2)return false;
	return _prop_exists(t2,q);
}

function _prop_dig(t,q){

	if(q.isEnd())return t;

	var idx=q.next();
	if(typeof idx==='string')_prop_toprop(t);
	else _prop_toarray(t);

	if(!t._sub[idx])t._sub[idx]=_prop_internal();
	return _prop_dig(t._sub[idx],q);
}

function _prop_ref(t,q){

	if(q.isEnd())return t;
	return t._ref(q);
}

function _prop_count(t,q){

	var u=_prop_ref(t,q);
	if(!u)return 0;

	switch(u.getType()){
		case mif.PROPTYPE.MONO: return 1;
		case mif.PROPTYPE.PROP: return Object.keys(u._sub).length;
		case mif.PROPTYPE.ARRAY: return u._sub.length;
		default:  return 0;
	}
}

function _prop_get(t,q){

	var u=_prop_ref(t,q);
	if(!u)return undefined;
	return u.export();
}

function _prop_set(t,q,v){

	var u=_prop_dig(t,q);
	return _prop_replace(u,v,false);
}

function _prop_cut(t,q,k){

	var u=_prop_ref(t,q);
	if(!u)return undefined;
	return _prop_remove(u,k);
}

function _prop_merge_internal(dst,src){

	if(!src._sub){
		return _prop_replace(dst,src,false);
	}

	for(var k in src._sub){
		var t=dst.dig(k);
		_prop_merge_internal(t,src._sub[k]);
	}
	return dst;
}

function _prop_merge(t,q,v){

	var src=(v?._yges_propmix_)?v:_prop_create(v,true);
	var dst=_prop_dig(t,q);
	return _prop_merge_internal(dst,src);
}

function _prop_toarray(t){

	switch(t.getType()){
		case mif.PROPTYPE.ARRAY:
		return;

		case mif.PROPTYPE.PROP:
		var b=Object.values(t._sub)
		_prop_replace(t,[],true);
		t._sub=b;
		break;

		default:
		_prop_replace(t,[],true);
	}
}

function _prop_toprop(t){

	switch(t.getType()){
		case mif.PROPTYPE.PROP:
		return;

		case mif.PROPTYPE.ARRAY:
		var b=t._sub;
		_prop_replace(t,{},true);
		t._sub=Object.assign({},b);
		break;

		default:
		_prop_replace(t,{},true);
	}
}

function _prop_push(t,q,v){

	t=_prop_dig(t,q);
	_prop_toarray(t);
	if(!v._yges_propmix_)v=_prop_create(v,false);
	t._sub.push(v);
	return t;
}

function _prop_unshift(t,q,v){

	t=_prop_dig(t,q);
	_prop_toarray(t);
	if(!v._yges_propmix_)v=_prop_create(v,false);
	t._sub.unshift(v);
	return t;
}

function _prop_pop(t,q){

	var t=_prop_ref(t,q);
	if(!t)return undefined;
	_prop_toarray(t);
	if(!t._sub)return undefined;
	var u=t._sub.pop();
	return u?u.export():undefined;
}

function _prop_shift(t,q){

	var t=_prop_ref(t,q);
	if(!t)return undefined;
	_prop_toarray(t);
	if(t._sub.length<1)return undefined;
	var u=t._sub.shift();
	return u?u.export():undefined;
}

function _prop_each(t,q,cb){

	var u=_prop_ref(t,q);
	if(!u)return undefined;

	if(!cb)return null;

	switch(u.getType()){
		case mif.PROPTYPE.PROP:
		case mif.PROPTYPE.ARRAY:
		for(var k in u._sub){
			var t=u._sub[k];
			if(!t)continue;
			if(cb(k,t)===false)return false;
		}
		return true;
	}
	return null;
}

var mif={
	name:'YgEs_PropTreeContainer',
	User:{},

	PROPTYPE:Object.freeze({
		EMPTY:0,
		MONO:1,
		ARRAY:2,
		PROP:3,
	}),

	create:(...args/*init=undefined,deep=false*/)=>{
		var a=args;
		if(a.length<1)return _prop_internal();
		return _prop_create((a.length>0)?a[0]:undefined,(a.length>1)?a[1]:false);
	},

}

export default mif;
