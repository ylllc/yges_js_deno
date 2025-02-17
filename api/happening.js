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
		_private_:{},

		_yges_happening_:true, // means this is YgEs.Happening 

		GetInstanceID:()=>iid,
		GetProp:cbprop,
		ToString:cbstr,
		toString:cbstr,
		ToError:cberr,

		IsResolved:()=>resolved,
		IsAbandoned:()=>abandoned && !resolved,

		GetStatus:()=>{
			if(resolved)return 'Resolved';
			if(abandoned)return 'Abandoned';
			return 'Posed';
		},
		GetInfo:()=>{return {
			InstanceID:iid,
			Name:hap.name,
			Status:hap.GetStatus(),
			Msg:cbstr(),
			Prop:cbprop(),
			User:hap.User,
		}},

		Resolve:()=>{
			if(resolved)return;
			resolved=true;
			abandoned=false;
			if(onResolved)onResolved(hap);
		},

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
		User:prm.User??{},
		_private_:{},

		OnHappen:prm.OnHappen??null,

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

		GetStatus:()=>{
			if(abandoned)return 'Abandoned';
			return 'Available';
		},
		GetInfo:()=>{
			let r={
				InstanceID:iid,
				Name:mng.name,
				Status:mng.GetStatus(),
				User:mng.User,
				Issues:[],
				Sub:[],
			}
			for(let hap of issues)r.Issues.push(hap.GetInfo());
			for(let sub of children)r.Sub.push(sub.GetInfo());
			return r;
		},

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

		Happen:(src,prop={},init={})=>{

			let hap=null;
			if(typeof src!='object'){
				hap=_create_happening(
					()=>prop,
					()=>''+src,
					()=>new Error(''+src,{cause:prop}),
					init
				);
			}
			else if(src._yges_happening_){
				hap=_create_happening(
					()=>src.GetProp(),
					()=>''+src,
					()=>new Error(''+src,{cause:src.GetProp()}),
					init
				);
			}
			else if(src instanceof Error){
				hap=_create_happening(
					()=>YgEs.FromError(src),
					()=>'{'+src.name+'} '+src.message,
					()=>src,
					init
				);
			}
			else{
				hap=_create_happening(
					()=>Object.assign(src,prop),
					()=>'Happening',
					()=>new Error('Happening',{cause:Object.assign(src,prop)}),
					init
				);
			}

			issues.push(hap);
			onHappen(hap);
			return hap;
		},
	}
	return mng;
}

YgEs.HappeningManager=_create_manager({Name:'YgEs.GlobalHappeningManager'});

})();
export default YgEs.HappeningManager;
