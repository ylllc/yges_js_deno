// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Happening Manager //

import log from './logger.js';

function _default_happened(hap){
	log.fatal(hap.ToJSON());	
}
function _default_abandoned(hap){
	log.warn('* Abandoned * '+hap.ToString());	
}
function _default_resolved(hap){
	log.debug('* Resolved * '+hap.ToString());	
}

function _create_happening(cbprop,cbstr,init=null){

	var hap={
		name:init?.name??'YgEs_Happening',
		resolved:false,
		abandoned:false,
		User:init?.User??{},
		GetProp:cbprop,
		ToString:cbstr,
		ToJSON:()=>JSON.stringify(hap.GetProp()),
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

function _create_manager(name,parent=null){

	var mng={
		name:'YgEs_HappeningManager',
		issues:[],
		children:[],
		Happened:null,
		User:{},

		createLocal:(name='YgEs_HappeningManager')=>_create_manager(name,mng),

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
				init
			));
		},

		happenProp:(prop,init=null)=>{
			return mng.happen(_create_happening(
				()=>prop,
				()=>JSON.stringify(prop),
				init
			));
		},

		happenError:(err,init=null)=>{
			return mng.happen(_create_happening(
				()=>{return {
					name:err.name,
					msg:err.message,
					file:err.fileName,
					line:err.lineNumber,
					col:err.columnNumber,
					stack:err.stack,
					src:err,
				}},
				()=>''+err,
				init
			));
		},
	}
	if(parent)parent.children.push(mng);
	return mng;
}


const mif=_create_manager('YgEs_GlobalHappeningManager');

export default mif;
