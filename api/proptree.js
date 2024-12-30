// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import QuickQueue from './quickqueue.js';

// Property Tree ------------------------ //
(()=>{ // local namespace 

function _prop_internal(){

	let t={
		name:'YgEs_PropTree',
		_yges_proptree_:true, // means this is YgEs_PropTree 
		_sub:undefined,
		_ref:(q)=>{return undefined;},
		getType:()=>PropTree.PROPTYPE.EMPTY,
		export:()=>{return undefined;},
		toArray:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			let u=_prop_dig(t,q);
			_prop_toarray(u);
		},
		toProp:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			let u=_prop_dig(t,q);
			_prop_toprop(u);
		},
		exists:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_exists(t,q);
		},
		ref:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_ref(t,q);
		},
		dig:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_dig(t,q);
		},
		count:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_count(t,q);
		},
		get:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_get(t,q);
		},
		set:(...args)=>{
			let loc=args;
			let v=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_set(t,q,v);
		},
		cut:(...args)=>{
			let loc=args;
			let k=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_cut(t,q,k);
		},
		merge:(...args)=>{
			let loc=args;
			let v=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_merge(t,q,v);
		},
		push:(...args)=>{
			let loc=args;
			let v=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_push(t,q,v);
		},
		unshift:(...args)=>{
			let loc=args;
			let v=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_unshift(t,q,v);
		},
		pop:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_pop(t,q);
		},
		shift:(...args)=>{
			let loc=args;
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_shift(t,q);
		},
		each:(...args)=>{
			let loc=args;
			let cb=loc.pop();
			if(Array.isArray(loc[0]))loc=loc[0];
			let q=QuickQueue.create(loc);
			return _prop_each(t,q,cb);
		},
	}
	return t;
}

function _prop_replace(t,src,deep){

	if(src?._yges_proptree_){
		t._sub=src._sub;
		t._ref=src._ref;
		t.getType=src.getType;
		t.export=src.export;
	}
	else if(!deep || src===null || typeof src!=='object'){
		t._sub=undefined;
		t._ref=(q)=>{return undefined;}
		t.getType=()=>PropTree.PROPTYPE.MONO;
		t.export=()=>{return src;}
	}
	else if(Array.isArray(src)){
		t._sub=[]
		t.getType=()=>PropTree.PROPTYPE.ARRAY;
		for(let v of src)t._sub.push(_prop_create(v,deep));
		t._ref=(q)=>{
			let idx=q.next();
			let u=t._sub[idx];
			if(!u)return undefined;
			return _prop_ref(u,q);
		}
		t.export=()=>{
			let u=[]
			for(let v of t._sub){
				u.push(v?v.export():undefined);
			}
			return u;
		}
	}
	else{
		t._sub={}
		t.getType=()=>PropTree.PROPTYPE.PROP;
		for(let k in src)t._sub[k]=_prop_create(src[k],deep);
		t._ref=(q)=>{
			let idx=q.next();
			let u=t._sub[idx];
			if(!u)return undefined;
			return _prop_ref(u,q);
		}
		t.export=()=>{
			let u={}
			for(let k in t._sub){
				let v=t._sub[k];
				u[k]=v?v.export():undefined;
			}
			return u;
		}
	}
	return t;
}

function _prop_remove(t,k){

	switch(t.getType()){
		case PropTree.PROPTYPE.EMPTY:
		return undefined;

		case PropTree.PROPTYPE.MONO:
		t._sub=undefined;
		t._ref=(q)=>{return undefined;}
		t.getType=()=>PropTree.PROPTYPE.EMPTY;
		var v=t.export();
		t.export=()=>{return undefined;}
		return v;

		case PropTree.PROPTYPE.ARRAY:
		if(!t._sub[k])return undefined;
		var v=t._sub[k];
		t._sub=t._sub.slice(0,k).concat(t._sub.slice(k+1));
		return v;

		case PropTree.PROPTYPE.PROP:
		if(!t._sub[k])return undefined;
		var v=t._sub[k];
		delete t._sub[k];
		return v;
	}
	return undefined;
}

function _prop_create(init,deep){

	let t=_prop_internal();
	_prop_replace(t,init,deep);
	return t;
}

function _prop_exists(t,q){

	if(q.isEnd())return true;
	if(!t._sub)return false;

	let idx=q.next();
	let t2=t._sub[idx];
	if(!t2)return false;
	return _prop_exists(t2,q);
}

function _prop_dig(t,q){

	if(q.isEnd())return t;

	let idx=q.next();
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

	let u=_prop_ref(t,q);
	if(!u)return 0;

	switch(u.getType()){
		case PropTree.PROPTYPE.MONO: return 1;
		case PropTree.PROPTYPE.PROP: return Object.keys(u._sub).length;
		case PropTree.PROPTYPE.ARRAY: return u._sub.length;
		default:  return 0;
	}
}

function _prop_get(t,q){

	let u=_prop_ref(t,q);
	if(!u)return undefined;
	return u.export();
}

function _prop_set(t,q,v){

	let u=_prop_dig(t,q);
	return _prop_replace(u,v,false);
}

function _prop_cut(t,q,k){

	let u=_prop_ref(t,q);
	if(!u)return undefined;
	return _prop_remove(u,k);
}

function _prop_merge_internal(dst,src){

	if(!src._sub){
		return _prop_replace(dst,src,false);
	}

	for(let k in src._sub){
		let t=dst.dig(k);
		_prop_merge_internal(t,src._sub[k]);
	}
	return dst;
}

function _prop_merge(t,q,v){

	let src=(v?._yges_proptree_)?v:_prop_create(v,true);
	let dst=_prop_dig(t,q);
	return _prop_merge_internal(dst,src);
}

function _prop_toarray(t){

	switch(t.getType()){
		case PropTree.PROPTYPE.ARRAY:
		return;

		case PropTree.PROPTYPE.PROP:
		let b=Object.values(t._sub)
		_prop_replace(t,[],true);
		t._sub=b;
		break;

		default:
		_prop_replace(t,[],true);
	}
}

function _prop_toprop(t){

	switch(t.getType()){
		case PropTree.PROPTYPE.PROP:
		return;

		case PropTree.PROPTYPE.ARRAY:
		let b=t._sub;
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
	if(!v._propmix_)v=_prop_create(v,false);
	t._sub.push(v);
	return t;
}

function _prop_unshift(t,q,v){

	t=_prop_dig(t,q);
	_prop_toarray(t);
	if(!v._propmix_)v=_prop_create(v,false);
	t._sub.unshift(v);
	return t;
}

function _prop_pop(t,q){

	t=_prop_ref(t,q);
	if(!t)return undefined;
	_prop_toarray(t);
	if(!t._sub)return undefined;
	let u=t._sub.pop();
	return u?u.export():undefined;
}

function _prop_shift(t,q){

	t=_prop_ref(t,q);
	if(!t)return undefined;
	_prop_toarray(t);
	if(t._sub.length<1)return undefined;
	let u=t._sub.shift();
	return u?u.export():undefined;
}

function _prop_each(t,q,cb){

	let u=_prop_ref(t,q);
	if(!u)return undefined;

	if(!cb)return null;

	switch(u.getType()){
		case PropTree.PROPTYPE.PROP:
		case PropTree.PROPTYPE.ARRAY:
		for(let k in u._sub){
			let t=u._sub[k];
			if(!t)continue;
			if(cb(k,t)===false)return false;
		}
		return true;
	}
	return null;
}

let PropTree=YgEs.PropTree={
	name:'YgEs_PropTreeContainer',
	User:{},

	PROPTYPE:Object.freeze({
		EMPTY:0,
		MONO:1,
		ARRAY:2,
		PROP:3,
	}),

	create:(...args/*init=undefined,deep=false*/)=>{
		let a=args;
		if(a.length<1)return _prop_internal();
		return _prop_create((a.length>0)?a[0]:undefined,(a.length>1)?a[1]:false);
	},

}

})();
export default YgEs.PropTree;
