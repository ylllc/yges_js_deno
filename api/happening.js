// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Log from './logger.js';

// Happening Manager -------------------- //
(()=>{ // local namespace 

let Log=YgEs.Log;

function _yges_happening_default_happened(hap){
	Log.fatal(hap.getProp());	
}
function _yges_happening_default_abandoned(hap){
	Log.warn('* Abandoned * '+hap.toString());	
}
function _yges_happening_default_resolved(hap){
	Log.debug('* Resolved * '+hap.toString());	
}

function _yges_happening_create_happening(cbprop,cbstr,cberr,init={}){

	let cb_resolved=init.cb_resolved??_yges_happening_default_resolved;
	let cb_abandoned=init.cb_abandoned??_yges_happening_default_abandoned;

	let hap={
		name:init.name??'YgEs_Happening',
		resolved:false,
		abandoned:false,
		User:init.user??{},

		getProp:cbprop,
		toString:cbstr,
		toJSON:()=>JSON.stringify(hap.getProp()),
		toError:cberr,

		isResolved:()=>hap.resolved,
		resolve:()=>{
			if(hap.resolved)return;
			hap.resolved=true;
			hap.abandoned=false;
			if(cb_resolved)cb_resolved(hap);
		},

		isAbandoned:()=>hap.abandoned && !hap.resolved,
		abandon:()=>{
			if(hap.resolved)return;
			if(hap.abandoned)return;
			hap.abandoned=true;
			if(cb_abandoned)cb_abandoned(hap);
		},
	}
	return hap;
}

function _yges_happening_create_manager(prm,parent=null){

	let mng={
		name:prm.name??'YgEs_HappeningManager',
		issues:[],
		children:[],
		Happened:prm.happen??null,
		User:prm.user??{},

		createLocal:(prm={})=>_yges_happening_create_manager(prm,mng),

		abandon:()=>{
			for(let sub of mng.children){
				sub.abandon();
			}
			for(let hap of mng.issues){
				hap.abandon();
			}
			mng.issues=[]
		},

		countIssues:()=>{
			let ct=mng.issues.length;
			for(let sub of mng.children){
				ct+=sub.countIssues();
			}
			return ct;
		},
		isCleaned:()=>{
			if(mng.issues.length>0)return false;
			for(let sub of mng.children){
				if(!sub.isCleaned())return false;
			}
			return true;
		},
		cleanup:()=>{
			let tmp=[]
			for(let hap of mng.issues){
				if(!hap.resolved)tmp.push(hap);
			}
			mng.issues=tmp;

			for(let sub of mng.children){
				sub.cleanup();
			}
		},

		getInfo:()=>{
			let info={name:mng.name,issues:[],children:[]}
			for(let hap of mng.issues){
				if(hap.resolved)continue;
				info.issues.push({name:hap.name,prop:hap.getProp()});
			}
			for(let sub of mng.children){
				let si=sub.getInfo();
				if(si.issues.length>0 || si.children.length>0)info.children.push(si);
			}
			return info;
		},

		poll:(cb)=>{
			if(!cb)return;
			for(let hap of mng.issues){
				if(hap.resolved)continue;
				if(hap.abandoned)continue;
				cb(hap);
			}
			for(let sub of mng.children){
				sub.poll(cb);
			}
		},

		_callHappened:(hap)=>{
			if(mng.Happened)mng.Happened(hap);
			else if(parent)parent._callHappened(hap);
			else _yges_happening_default_happened(hap);
		},
		happen:(hap)=>{
			mng.issues.push(hap);
			mng._callHappened(hap);
			return hap;
		},
		happenMsg:(msg,init={})=>{
			return mng.happen(_yges_happening_create_happening(
				()=>{return {msg:''+msg}},
				()=>''+msg,
				()=>new Error(msg),
				init
			));
		},

		happenProp:(prop,init={})=>{
			return mng.happen(_yges_happening_create_happening(
				()=>prop,
				()=>JSON.stringify(prop),
				()=>new Error(JSON.stringify(prop)),
				init
			));
		},

		happenError:(err,init={})=>{
			return mng.happen(_yges_happening_create_happening(
				()=>{return YgEs.fromError(err)},
				()=>''+err,
				()=>err,
				init
			));
		},
	}
	if(parent)parent.children.push(mng);
	return mng;
}

YgEs.HappeningManager=_yges_happening_create_manager('YgEs_GlobalHappeningManager');

})();
export default YgEs.HappeningManager;
