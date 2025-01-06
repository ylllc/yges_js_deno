// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import Log from './logger.js';

// Happening Manager -------------------- //
(()=>{ // local namespace 

function _default_happened(hap){
	Log.fatal(hap.toString(),hap.getProp());	
}
function _default_abandoned(hap){
	Log.warn('* Abandoned * '+hap.toString(),hap.getProp());	
}
function _default_resolved(hap){
	Log.debug('* Resolved * '+hap.toString(),hap.getProp());	
}

function _create_happening(cbprop,cbstr,cberr,init={}){

	let resolved=false;
	let abandoned=false;
	let cb_resolved=init.cb_resolved??_default_resolved;
	let cb_abandoned=init.cb_abandoned??_default_abandoned;

	let hap={
		name:init.name??'YgEs_Happening',
		User:init.user??{},

		getProp:cbprop,
		toString:cbstr,
		toJSON:()=>JSON.stringify(hap.getProp()),
		toError:cberr,

		isResolved:()=>resolved,
		resolve:()=>{
			if(resolved)return;
			resolved=true;
			abandoned=false;
			if(cb_resolved)cb_resolved(hap);
		},

		isAbandoned:()=>abandoned && !resolved,
		abandon:()=>{
			if(resolved)return;
			if(abandoned)return;
			abandoned=true;
			if(cb_abandoned)cb_abandoned(hap);
		},
	}
	return hap;
}

function _create_manager(prm,parent=null){

	let issues=[]
	let children=[]

	let mng={
		name:prm.name??'YgEs_HappeningManager',
		Happened:prm.happen??null,
		User:prm.user??{},

		createLocal:(prm={})=>{
			let cm=_create_manager(prm,mng);
			children.push(cm);
			return cm;
		},

		getParent:()=>parent,
		getChildren:()=>children,
		getIssues:()=>issues,

		abandon:()=>{
			for(let sub of children){
				sub.abandon();
			}
			for(let hap of issues){
				hap.abandon();
			}
			issues=[]
		},

		countIssues:()=>{
			let ct=issues.length;
			for(let sub of children){
				ct+=sub.countIssues();
			}
			return ct;
		},
		isCleaned:()=>{
			if(issues.length>0)return false;
			for(let sub of children){
				if(!sub.isCleaned())return false;
			}
			return true;
		},
		cleanup:()=>{
			let tmp=[]
			for(let hap of issues){
				if(!hap.isResolved())tmp.push(hap);
			}
			issues=tmp;

			for(let sub of children){
				sub.cleanup();
			}
		},

		getInfo:()=>{
			let info={name:mng.name,_issues:[],_children:[]}
			for(let hap of issues){
				if(hap.isResolved())continue;
				info._issues.push({name:hap.name,prop:hap.getProp()});
			}
			for(let sub of children){
				let si=sub.getInfo();
				if(si._issues.length>0 || si._children.length>0)info._children.push(si);
			}
			return info;
		},

		poll:(cb)=>{
			if(!cb)return;
			for(let hap of issues){
				if(hap.isResolved())continue;
				if(hap.isAbandoned())continue;
				cb(hap);
			}
			for(let sub of children){
				sub.poll(cb);
			}
		},

		_callHappened:(hap)=>{
			if(mng.Happened)mng.Happened(hap);
			else if(parent)parent._callHappened(hap);
			else _default_happened(hap);
		},
		happen:(hap)=>{
			issues.push(hap);
			mng._callHappened(hap);
			return hap;
		},
		happenMsg:(msg,init={})=>{
			return mng.happen(_create_happening(
				()=>{return {msg:''+msg}},
				()=>''+msg,
				()=>new Error(msg),
				init
			));
		},

		happenProp:(prop,init={})=>{
			return mng.happen(_create_happening(
				()=>prop,
				()=>JSON.stringify(prop),
				()=>new Error(JSON.stringify(prop)),
				init
			));
		},

		happenError:(err,init={})=>{
			return mng.happen(_create_happening(
				()=>{return YgEs.fromError(err)},
				()=>''+err,
				()=>err,
				init
			));
		},
	}
	return mng;
}

YgEs.HappeningManager=_create_manager('YgEs_GlobalHappeningManager');

})();
export default YgEs.HappeningManager;
