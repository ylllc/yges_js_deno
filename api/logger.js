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

	let s=src.Text;
	if(src.Prop)s+='; '+YgEs.Inspect(src.Prop);
	console.log(s);
}

// create local instance 
function _create_local(capt=null,showable=null,parent=null){

	const format=(src)=>{
		for(let inst=t;inst;inst=inst.GetParent()){
			if(inst.Format!==null){
				inst.Format(src);
				return;
			}
		}
		_default_format(src);
	}
	const write=(src)=>{
		for(let inst=t;inst;inst=inst.GetParent()){
			if(inst.Way!==null){
				inst.Way(src);
				return;
			}
		}
		_default_way(src);
	}

	const iid=YgEs.NextID();
	let t={
		name:'YgEs.LocalLog',
		User:{},

		Showable:showable,
		Caption:capt,
		Format:null,
		Way:null,

		LEVEL_NAMES:_level_names,
		LEVEL:_level_lookup,

		CreateLocal:(capt=null,showable=null)=>_create_local(capt,showable,t),

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
			format(src);
			write(src);
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

const Log=YgEs.Log=_create_local();
YgEs.Log.name='YgEs.GlobalLog';

})();
export default YgEs.Log;
