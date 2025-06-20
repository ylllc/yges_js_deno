// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import Log from './logger.js';

// Happening Manager -------------------- //
(()=>{ // local namespace 

function _default_happened(mng,hap){
	Log.Fatal(hap.ToString(),hap.GetProp());	
}
function _default_abandoned(hap){
	Log.Warn('* Abandoned * '+hap.ToString(),hap.GetProp());	
}
function _default_resolved(hap){
	Log.Debug('* Resolved * '+hap.ToString(),hap.GetProp());	
}

function _create_happening(cbprop,cbstr,cberr,prm={}){

	const iid=YgEs.NextID();

	const onResolved=YgEs.Validate(prm.OnResolved,{
		Callable:true,
		Dafault:_default_resolved
	});
	const onAbandoned=YgEs.Validate(prm.OnAbandoned,{
		Callable:true,
		Default:_default_abandoned,
	});

	let self=YgEs.SoftClass();
	if(YgEs.Validate(prm.User,{Struct:true}))Object.assign(self.User,prm.User);

	let priv=self.Extend('YgEs.Happening',{
		// private 
		resolved:false,
		abandoned:false,
	},{
		// public 
		GetInstanceID:()=>iid,
		GetProp:cbprop,
		ToString:cbstr,
		toString:cbstr,
		ToError:cberr,

		IsResolved:()=>priv.resolved,
		IsAbandoned:()=>priv.abandoned && !priv.resolved,

		GetStatus:()=>{
			if(priv.resolved)return 'Resolved';
			if(priv.abandoned)return 'Abandoned';
			return 'Posed';
		},
		GetInfo:()=>{return {
			InstanceID:iid,
			Name:self.Name,
			Status:self.GetStatus(),
			Msg:cbstr(),
			Prop:cbprop(),
			User:self.User,
		}},

		Resolve:()=>{
			if(priv.resolved)return;
			priv.resolved=true;
			priv.abandoned=false;
			if(onResolved)onResolved(self);
		},

		Abandon:()=>{
			if(priv.resolved)return;
			if(priv.abandoned)return;
			priv.abandoned=true;
			if(onAbandoned)onAbandoned(self);
		},
	});

	return self;
}

function _create_manager(prm,parent=null){

	const iid=YgEs.NextID();

	const onHappen=(hap)=>{
		for(let hm=self;hm;hm=hm.GetParent()){
			if(!hm.OnHappen)continue;
			hm.OnHappen(self,hap);
			return;
		}
		_default_happened(self,hap);
	}

	let self=YgEs.SoftClass();
	if(YgEs.Validate(prm.User,{Struct:true}))Object.assign(self.User,prm.User);

	let priv=self.Extend('YgEs.HappeningManager',{
		// private 
		abandoned:false,
		issues:[],
		children:[],
	},{
		// public 
		OnHappen:YgEs.Validate(prm.OnHappen,{Callable:true}),

		CreateLocal:(prm={})=>{
			let cm=_create_manager(prm,self);
			priv.children.push(cm);
			return cm;
		},

		GetInstanceID:()=>iid,
		GetParent:()=>parent,
		GetChildren:()=>priv.children,
		GetIssues:()=>priv.issues,
		IsAbandoned:()=>priv.abandoned,

		GetStatus:()=>{
			if(priv.abandoned)return 'Abandoned';
			return 'Available';
		},
		GetInfo:()=>{
			let r={
				InstanceID:iid,
				Name:self.GetCaption(),
				Status:self.GetStatus(),
				User:self.User,
				Issues:[],
				Sub:[],
			}
			for(let hap of priv.issues)r.Issues.push(hap.GetInfo());
			for(let sub of priv.children)r.Sub.push(sub.GetInfo());
			return r;
		},

		Abandon:()=>{
			for(let sub of priv.children){
				sub.Abandon();
			}
			for(let hap of priv.issues){
				hap.Abandon();
			}
			priv.issues=[]
			priv.abandoned=true;
		},

		CountIssues:()=>{
			let ct=priv.issues.length;
			for(let sub of priv.children){
				ct+=sub.CountIssues();
			}
			return ct;
		},
		IsCleaned:()=>{
			if(priv.issues.length>0)return false;
			for(let sub of priv.children){
				if(!sub.IsCleaned())return false;
			}
			return true;
		},
		CleanUp:()=>{
			let tmp=[]
			for(let hap of priv.issues){
				if(!hap.IsResolved())tmp.push(hap);
			}
			priv.issues=tmp;

			tmp=[]
			for(let sub of priv.children){
				if(sub.IsAbandoned())continue;
				sub.CleanUp();
				tmp.push(sub);
			}
			priv.children=tmp;
		},

		Poll:(cb)=>{
			if(!cb)return;
			for(let hap of priv.issues){
				if(hap.IsResolved())continue;
				if(hap.IsAbandoned())continue;
				cb(hap);
			}
			for(let sub of priv.children){
				sub.Poll(cb);
			}
		},

		Happen:(src,prop={},prm={})=>{

			let hap=null;
			if(src==null || typeof src!='object'){
				hap=_create_happening(
					()=>prop,
					()=>''+src,
					()=>new Error(''+src,{cause:prop}),
					prm
				);
			}
			else if(src instanceof Error){
				hap=_create_happening(
					()=>YgEs.FromError(src),
					()=>'{'+src.Name+'} '+src.message,
					()=>src,
					prm
				);
			}
			else if(YgEs.InstanceOf(src,'YgEs.Happening')){
				hap=_create_happening(
					()=>src.GetProp(),
					()=>''+src,
					()=>new Error(''+src,{cause:src.GetProp()}),
					prm
				);
			}
			else{
				hap=_create_happening(
					()=>Object.assign(src,prop),
					()=>'Happening',
					()=>new Error('Happening',{cause:Object.assign(src,prop)}),
					prm
				);
			}

			priv.issues.push(hap);
			onHappen(hap);
			return hap;
		},
	});

	return self;
}

YgEs.HappeningManager=_create_manager({Name:'YgEs.GlobalHappeningManager'});

})();
export default YgEs.HappeningManager;
