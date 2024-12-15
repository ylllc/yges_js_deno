// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Happening Manager //

import log from './logger.js';
import util from './util.js';

function _default_happened(hap){
	log.fatal(hap.GetProp());	
}
function _default_abandoned(hap){
	log.warn('* Abandoned * '+hap.ToString());	
}
function _default_resolved(hap){
	log.debug('* Resolved * '+hap.ToString());	
}

function _create_happening(cbprop,cbstr,cberr,init=null){

	var hap={
		name:init?.name??'YgEs_Happening',
		resolved:false,
		abandoned:false,
		User:init?.User??{},
		GetProp:cbprop,
		ToString:cbstr,
		ToJSON:()=>JSON.stringify(hap.GetProp()),
		ToError:cberr,
		Resolved:init?.Resolved??_default_resolved,
		Abandoned:init?.Abandoned??_default_abandoned,

		isResolved:()=>hap.resolved,
		resolve:()=>{
			if(hap.resolved)return;
			hap.resolved=true;
			hap.abandoned=false;
			if(hap.Resolved)hap.Resolved(hap);
		},

		isAbandoned:()=>hap.abandoned && !hap.resolved,
		abandon:()=>{
			if(hap.resolved)return;
			if(hap.abandoned)return;
			hap.abandoned=true;
			if(hap.Abandoned)hap.Abandoned(hap);
		},
	}
	return hap;
}

function _create_manager(prm,parent=null){

	var mng={
		name:prm.name??'YgEs_HappeningManager',
		issues:[],
		children:[],
		Happened:prm.happen??null,
		User:prm.user??{},

		createLocal:(prm={})=>_create_manager(prm,mng),

		abandon:()=>{
			for(var sub of mng.children){
				sub.abandon();
			}
			for(var hap of mng.issues){
				hap.abandon();
			}
			mng.issues=[]
		},

		countIssues:()=>{
			var ct=mng.issues.length;
			for(var sub of mng.children){
				ct+=sub.countIssues();
			}
			return ct;
		},
		isCleaned:()=>{
			if(mng.issues.length>0)return false;
			for(var sub of mng.children){
				if(!sub.isCleaned())return false;
			}
			return true;
		},
		cleanup:()=>{
			var tmp=[]
			for(var hap of mng.issues){
				if(!hap.resolved)tmp.push(hap);
			}
			mng.issues=tmp;

			for(var sub of mng.children){
				sub.cleanup();
			}
		},

		getInfo:()=>{
			var info={name:mng.name,issues:[],children:[]}
			for(var hap of mng.issues){
				if(hap.resolved)continue;
				info.issues.push({name:hap.name,prop:hap.GetProp()});
			}
			for(var sub of mng.children){
				var si=sub.getInfo();
				if(si.issues.length>0 || si.children.length>0)info.children.push(si);
			}
			return info;
		},

		poll:(cb)=>{
			if(!cb)return;
			for(var hap of mng.issues){
				if(hap.resolved)continue;
				if(hap.abandoned)continue;
				cb(hap);
			}
			for(var sub of mng.children){
				sub.poll(cb);
			}
		},

		_callHappened:(hap)=>{
			if(mng.Happened)mng.Happened(hap);
			else if(parent)parent._callHappened(hap);
			else _default_happened(hap);
		},
		happen:(hap)=>{
			mng.issues.push(hap);
			mng._callHappened(hap);
			return hap;
		},
		happenMsg:(msg,init=null)=>{
			return mng.happen(_create_happening(
				()=>{return {msg:''+msg}},
				()=>''+msg,
				()=>new Error(msg),
				init
			));
		},

		happenProp:(prop,init=null)=>{
			return mng.happen(_create_happening(
				()=>prop,
				()=>JSON.stringify(prop),
				()=>new Error(JSON.stringify(prop)),
				init
			));
		},

		happenError:(err,init=null)=>{
			return mng.happen(_create_happening(
				()=>{return util.fromError(err)},
				()=>''+err,
				()=>err,
				init
			));
		},
	}
	if(parent)parent.children.push(mng);
	return mng;
}


const mif=_create_manager('YgEs_GlobalHappeningManager');

export default mif;
