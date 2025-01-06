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
const _level_lookup=YgEs.createEnum(_level_names.concat(['NEVER']));

// default settings 
const _default_showable=_level_lookup.INFO;

function _default_format(src){

	switch(typeof src.Msg){
		case 'function': src.Msg=src.Msg(); break;
		case 'object': src.Msg=YgEs.inspect(src.Msg); break;
	}

	let lev=_level_names[src.Lev]??('?'+src.Lev+'?');
	let capt=src.Capt?('{'+src.Capt+'} '):'';
	src.Msg=src.Date+': ['+lev+'] '+capt+src.Msg;
}

function _default_way(src){

	let msg=src.Msg;
	if(src.Prop)msg+='; '+YgEs.inspect(src.Prop);
	console.log(msg);
}

// create local instance 
function _create_local(capt=null,showable=null,parent=null){

	let t={
		name:'YgEs_Logger',
		User:{},

		Showable:showable,
		Caption:capt,
		Format:null,
		Way:null,

		LEVEL_NAMES:_level_names,
		LEVEL:_level_lookup,

		createLocal:(capt=null,showable=null)=>_create_local(capt,showable,t),

		getCaption:()=>{
			if(t.Caption!==null)return t.Caption;
			if(parent)return parent.getCaption();
			return '';
		},
		getShowable:()=>{
			if(t.Showable!==null)return t.Showable;
			if(parent)return parent.getShowable();
			return _default_showable;
		},
		format:(src)=>{
			if(t.Format!==null)t.Format(src);
			else if(parent)parent.format(src);
			else _default_format(src);
		},
		write:(src)=>{
			if(t.Way!==null)t.Way(src);
			else if(parent)parent.write(src);
			else _default_way(src);
		},

		put:(lev,msg,prop=null)=>{
			if(lev>=t.LEVEL_NAMES.length)return;
			if(lev<t.getShowable())return;
			let src={
				Date:new Date().toISOString(),
				Capt:t.getCaption(),
				Lev:lev,
				Msg:msg
			}
			if(prop)src.Prop=prop;
			t.format(src);
			t.write(src);
		},

		tick:(msg,prop=null)=>{t.put(t.LEVEL.TICK,msg,prop);},
		trace:(msg,prop=null)=>{t.put(t.LEVEL.TRACE,msg,prop);},
		debug:(msg,prop=null)=>{t.put(t.LEVEL.DEBUG,msg,prop);},
		info:(msg,prop=null)=>{t.put(t.LEVEL.INFO,msg,prop);},
		notice:(msg,prop=null)=>{t.put(t.LEVEL.NOTICE,msg,prop);},
		warn:(msg,prop=null)=>{t.put(t.LEVEL.WARN,msg,prop);},
		fatal:(msg,prop=null)=>{t.put(t.LEVEL.FATAL,msg,prop);},
		crit:(msg,prop=null)=>{t.put(t.LEVEL.CRIT,msg,prop);},
		alert:(msg,prop=null)=>{t.put(t.LEVEL.ALERT,msg,prop);},
		emerg:(msg,prop=null)=>{t.put(t.LEVEL.EMERG,msg,prop);},
	}
	return t;
}

const Log=YgEs.Log=_create_local();
YgEs.Log.name='YgEs_GlobalLogger';

})();
export default YgEs.Log;
