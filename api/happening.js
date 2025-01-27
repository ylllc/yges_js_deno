// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import Log from './logger.js';

// Happening Manager -------------------- //
(()=>{ // local namespace 

function _default_happened(hap){
	Log.Fatal(hap.ToString(),hap.GetProp());	
}
function _default_abandoned(hap){
	Log.Warn('* Abandoned * '+hap.ToString(),hap.GetProp());	
}
function _default_resolved(hap){
	Log.Debug('* Resolved * '+hap.ToString(),hap.GetProp());	
}

function _create_happening(cbprop,cbstr,cberr,init={}){

	let resolved=false;
	let abandoned=false;
	let onResolved=init.OnResolved??_default_resolved;
	let onAbandoned=init.OnAbandoned??_default_abandoned;

	const iid=YgEs.NextID();
	let hap={
		name:init.Name??'YgEs.Happening',
		User:init.User??{},

		GetInstanceID:()=>iid,
		GetProp:cbprop,
		ToString:cbstr,
		toString:cbstr,
		ToJSON:()=>JSON.stringify(hap.GetProp()),
		ToError:cberr,

		IsResolved:()=>resolved,
		Resolve:()=>{
			if(resolved)return;
			resolved=true;
			abandoned=false;
			if(onResolved)onResolved(hap);
		},

		IsAbandoned:()=>abandoned && !resolved,
		Abandon:()=>{
			if(resolved)return;
			if(abandoned)return;
			abandoned=true;
			if(onAbandoned)onAbandoned(hap);
		},
	}
	return hap;
}

function _create_manager(prm,parent=null){

	let issues=[]
	let children=[]
	let abandoned=false;

	const onHappen=(hap)=>{
		for(let hm=mng;hm;hm=hm.GetParent()){
			if(!hm.OnHappen)continue;
			hm.OnHappen(hap);
			return;
		}
		_default_happened(hap);
	}

	const iid=YgEs.NextID();
	let mng={
		name:prm.Name??'YgEs.HappeningManager',
		OnHappen:prm.OnHappen??null,
		User:prm.User??{},

		CreateLocal:(prm={})=>{
			let cm=_create_manager(prm,mng);
			children.push(cm);
			return cm;
		},

		GetInstanceID:()=>iid,
		GetParent:()=>parent,
		GetChildren:()=>children,
		GetIssues:()=>issues,
		IsAbandoned:()=>abandoned,

		Abandon:()=>{
			for(let sub of children){
				sub.Abandon();
			}
			for(let hap of issues){
				hap.Abandon();
			}
			issues=[]
			abandoned=true;
		},

		CountIssues:()=>{
			let ct=issues.length;
			for(let sub of children){
				ct+=sub.CountIssues();
			}
			return ct;
		},
		IsCleaned:()=>{
			if(issues.length>0)return false;
			for(let sub of children){
				if(!sub.IsCleaned())return false;
			}
			return true;
		},
		CleanUp:()=>{
			let tmp=[]
			for(let hap of issues){
				if(!hap.IsResolved())tmp.push(hap);
			}
			issues=tmp;

			tmp=[]
			for(let sub of children){
				if(sub.IsAbandoned())continue;
				sub.CleanUp();
				tmp.push(sub);
			}
			children=tmp;
		},

		GetInfo:()=>{
			let info={Name:mng.name,Abandoned:abandoned,Issues:[],Children:[]}
			for(let hap of issues){
				if(hap.IsResolved())continue;
				info.Issues.push({Name:hap.name,Prop:hap.GetProp()});
			}
			for(let sub of children){
				let si=sub.GetInfo();
				if(si.Issues.length>0 || si.Children.length>0)info.Children.push(si);
			}
			return info;
		},

		Poll:(cb)=>{
			if(!cb)return;
			for(let hap of issues){
				if(hap.IsResolved())continue;
				if(hap.IsAbandoned())continue;
				cb(hap);
			}
			for(let sub of children){
				sub.Poll(cb);
			}
		},

		Happen:(hap)=>{
			issues.push(hap);
			onHappen(hap);
			return hap;
		},
		HappenMsg:(msg,init={})=>{
			return mng.Happen(_create_happening(
				()=>{return {msg:''+msg}},
				()=>''+msg,
				()=>new Error(msg),
				init
			));
		},

		HappenProp:(prop,init={})=>{
			return mng.Happen(_create_happening(
				()=>prop,
				()=>JSON.stringify(prop),
				()=>new Error(JSON.stringify(prop)),
				init
			));
		},

		HappenError:(err,init={})=>{
			return mng.Happen(_create_happening(
				()=>{return YgEs.FromError(err)},
				()=>''+err,
				()=>err,
				init
			));
		},
	}
	return mng;
}

YgEs.HappeningManager=_create_manager({Name:'YgEs.GlobalHappeningManager'});

})();
export default YgEs.HappeningManager;
