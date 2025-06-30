// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';

// Logger ------------------------------- //
(()=>{ // local namespace 

// log level 
const _level_names=Object.freeze(['TICK','TRACE','DEBUG','INFO','NOTICE','WARN','FATAL','CRIT','ALERT','EMERG']);
// make reverse lookup 
const _level_lookup=Object.freeze(YgEs.CreateEnum(_level_names.concat(['NEVER'])));

// default settings 
const _default_showable=_level_lookup.INFO;

function _default_format(src){

	switch(typeof src.Msg){
		case 'function': src.Msg=src.Msg(); break;
		case 'object': src.Msg=YgEs.Inspect(src.Msg); break;
	}

	let lev=_level_names[src.Lev]??('?'+src.Lev+'?');
	let capt=src.Capt?('{'+src.Capt+'} '):'';
	src.Text=src.Date+': ['+lev+'] '+capt+src.Msg;
}

function _default_way(src){

	switch(src.Lev){
		case Log.LEVEL.TICK:
		case Log.LEVEL.TRACE:
		case Log.LEVEL.DEBUG:
		console.debug(src.Text);
		break;

		case Log.LEVEL.INFO:
		case Log.LEVEL.NOTICE:
		console.info(src.Text);
		break;

		case Log.LEVEL.WARN:
		console.warn(src.Text);
		break;

		case Log.LEVEL.FATAL:
		case Log.LEVEL.CRIT:
		case Log.LEVEL.ALERT:
		case Log.LEVEL.EMERG:
		console.error(src.Text);
		break;

		default:
		console.log(src.Text);
	}

	if(src.Prop)console.dir(src.Prop);
}

function _do_format(t,src){

	for(let inst=t;inst;inst=inst.GetParent()){
		if(inst.Format){
			inst.Format(inst,src);
			return;
		}
	}
	_default_format(src);
}

function _do_write(t,src){

	for(let inst=t;inst;inst=inst.GetParent()){
		if(inst.Way){
			inst.Way(inst,src);
			return;
		}
	}
	_default_way(src);
}

// create local instance 
function _create_local(capt=undefined,showable=undefined,parent=undefined){

	capt=YgEs.Validate(capt,{Literal:true,Nullable:true},'capt');
	showable=YgEs.Validate(showable,{Integer:true,Nullable:true,Min:0,Max:_level_names.length},'showable');
	parent=YgEs.Validate(parent,{Class:'YgEs.LocalLog'},parent);

	const iid=YgEs.NextID();

	let self=YgEs.SoftClass();
	self.Extend('YgEs.LocalLog',{
		// private
	},{
		// public
		Showable:showable,
		Caption:capt,
		Format:undefined,
		Way:undefined,

		LEVEL_NAMES:_level_names,
		LEVEL:_level_lookup,

		CreateLocal:(capt=undefined,showable=undefined)=>_create_local(capt,showable,self),
		CreateSplitter:(capt=undefined,showable=undefined)=>_create_splitter(capt,showable,self),

		GetInstanceID:()=>iid,
		GetParent:()=>parent,
		GetCaption:()=>{
			for(let t=self;t;t=t.GetParent()){
				if(t.Caption!=null)return t.Caption;
			}
			return '';
		},
		GetShowable:()=>{
			for(let t=self;t;t=t.GetParent()){
				if(t.Showable!=null)return t.Showable;
			}
			return _default_showable;
		},

		Put:(lev,msg,prop=undefined)=>{
			if(lev>=self.LEVEL_NAMES.length)return;
			if(lev<self.GetShowable())return;
			let src={
				Date:new Date().toISOString(),
				Capt:self.GetCaption(),
				Lev:lev,
				Msg:msg
			}
			if(prop)src.Prop=prop;
			_do_format(self,src);
			_do_write(self,src);
		},

		Tick:(msg,prop=undefined)=>{self.Put(self.LEVEL.TICK,msg,prop);},
		Trace:(msg,prop=undefined)=>{self.Put(self.LEVEL.TRACE,msg,prop);},
		Debug:(msg,prop=undefined)=>{self.Put(self.LEVEL.DEBUG,msg,prop);},
		Info:(msg,prop=undefined)=>{self.Put(self.LEVEL.INFO,msg,prop);},
		Notice:(msg,prop=undefined)=>{self.Put(self.LEVEL.NOTICE,msg,prop);},
		Warn:(msg,prop=undefined)=>{self.Put(self.LEVEL.WARN,msg,prop);},
		Fatal:(msg,prop=undefined)=>{self.Put(self.LEVEL.FATAL,msg,prop);},
		Crit:(msg,prop=undefined)=>{self.Put(self.LEVEL.CRIT,msg,prop);},
		Alert:(msg,prop=undefined)=>{self.Put(self.LEVEL.ALERT,msg,prop);},
		Emerg:(msg,prop=undefined)=>{self.Put(self.LEVEL.EMERG,msg,prop);},
	});

	return self;
}

function _create_splitter(capt=undefined,showable=undefined,parent=undefined){

	let self=_create_local(capt,showable,parent);
	let priv=self.Extend('YgEs.LogSplitter',{
		// private 
		slot:{},
	},{
		// public 
		Format:(logger,src)=>{
			for(let sub of Object.values(priv.slot)){
				if(src.Lev<sub.GetShowable())continue;
				_do_format(sub,src);
			}
		},
		Way:(logger,src)=>{
			for(let sub of Object.values(priv.slot)){
				if(src.Lev<sub.GetShowable())continue;
				_do_write(sub,src);
			}
		},
		Ref:(id)=>{
			return priv.slot[id];
		},
		Attach:(id,logger)=>{
			if(!logger){
				self.Detach(id);
				return;
			}
			priv.slot[id]=logger;
		},
		Detach:(id)=>{
			if(!priv.slot[id])return;
			delete priv.slot[id];
		},
	});

	return self;
}

const Log=YgEs.Log=_create_local('Global');

})();
export default YgEs.Log;
