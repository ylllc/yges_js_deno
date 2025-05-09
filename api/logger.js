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
		if(inst.Format!==null){
			inst.Format(inst,src);
			return;
		}
	}
	_default_format(src);
}

function _do_write(t,src){

	for(let inst=t;inst;inst=inst.GetParent()){
		if(inst.Way!==null){
			inst.Way(inst,src);
			return;
		}
	}
	_default_way(src);
}

// create local instance 
function _create_local(capt=null,showable=null,parent=null){

	const iid=YgEs.NextID();
	let t={
		Name:'YgEs.LocalLog',
		User:{},
		_private_:{},

		Showable:showable,
		Caption:capt,
		Format:null,
		Way:null,

		LEVEL_NAMES:_level_names,
		LEVEL:_level_lookup,

		CreateLocal:(capt=null,showable=null)=>_create_local(capt,showable,t),
		CreateSplitter:(capt=null,showable=null)=>_create_splitter(capt,showable,t),

		GetInstanceID:()=>iid,
		GetParent:()=>parent,
		GetCaption:()=>{
			for(let inst=t;inst;inst=inst.GetParent()){
				if(inst.Caption!==null)return inst.Caption;
			}
			return '';
		},
		GetShowable:()=>{
			for(let inst=t;inst;inst=inst.GetParent()){
				if(inst.Showable!==null)return inst.Showable;
			}
			return _default_showable;
		},

		Put:(lev,msg,prop=null)=>{
			if(lev>=t.LEVEL_NAMES.length)return;
			if(lev<t.GetShowable())return;
			let src={
				Date:new Date().toISOString(),
				Capt:t.GetCaption(),
				Lev:lev,
				Msg:msg
			}
			if(prop)src.Prop=prop;
			_do_format(t,src);
			_do_write(t,src);
		},

		Tick:(msg,prop=null)=>{t.Put(t.LEVEL.TICK,msg,prop);},
		Trace:(msg,prop=null)=>{t.Put(t.LEVEL.TRACE,msg,prop);},
		Debug:(msg,prop=null)=>{t.Put(t.LEVEL.DEBUG,msg,prop);},
		Info:(msg,prop=null)=>{t.Put(t.LEVEL.INFO,msg,prop);},
		Notice:(msg,prop=null)=>{t.Put(t.LEVEL.NOTICE,msg,prop);},
		Warn:(msg,prop=null)=>{t.Put(t.LEVEL.WARN,msg,prop);},
		Fatal:(msg,prop=null)=>{t.Put(t.LEVEL.FATAL,msg,prop);},
		Crit:(msg,prop=null)=>{t.Put(t.LEVEL.CRIT,msg,prop);},
		Alert:(msg,prop=null)=>{t.Put(t.LEVEL.ALERT,msg,prop);},
		Emerg:(msg,prop=null)=>{t.Put(t.LEVEL.EMERG,msg,prop);},
	}
	return t;
}

function _create_splitter(capt=null,showable=null,parent=null){

	let t=_create_local(capt,showable,parent);
	t._private_.slot={}
	t.Format=(logger,src)=>{
		for(let sub of Object.values(t._private_.slot)){
			if(src.Lev<sub.GetShowable())continue;
			_do_format(sub,src);
		}
	}
	t.Way=(logger,src)=>{
		for(let sub of Object.values(t._private_.slot)){
			if(src.Lev<sub.GetShowable())continue;
			_do_write(sub,src);
		}
	}
	t.Ref=(id)=>{
		return t._private_.slot[id];
	}
	t.Attach=(id,logger)=>{
		if(!logger){
			t.Detach(id);
			return;
		}
		t._private_.slot[id]=logger;
	}
	t.Detach=(id)=>{
		if(!t._private_.slot[id])return;
		delete t._private_.slot[id];
	}

	return t;
}

const Log=YgEs.Log=_create_local();
YgEs.Log.Name='YgEs.GlobalLog';

})();
export default YgEs.Log;
