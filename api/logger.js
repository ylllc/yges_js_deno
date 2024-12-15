// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import util from './util.js';

// Logger //

// log level 
const _log_level_names=Object.freeze(['TICK','TRACE','DEBUG','INFO','NOTICE','WARN','FATAL','CRIT','ALERT','EMERG']);

// make reverse lookup 
var ll={}
for(var i in _log_level_names)ll[_log_level_names[i]]=parseInt(i);
ll['NEVER']=_log_level_names.length;
const _log_level_lookup=Object.freeze(ll);

// default settings 
const _default_showable=_log_level_lookup.INFO;

function _default_format(capt,lev,msg){

	switch(typeof msg){
		case 'function': msg=msg(); break;
		case 'object': msg=util.inspect(msg); break;
	}

	var lln=_log_level_names[lev]??('?'+lev+'?');
	if(capt)capt='{'+capt+'} ';
	return new Date().toISOString()+': ['+lln+'] '+capt+msg;
}

function _default_way(msg){
	console.log(msg);
}

// create local instance 
function _create_local(capt=null,showable=null,parent=null){

	var t={
		name:'YgEs_Logger',
		Showable:showable,
		Caption:capt,
		Format:null,
		Way:null,
		User:{},

		LEVEL_NAMES:_log_level_names,
		LEVEL:_log_level_lookup,

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
		format:(capt,lev,msg)=>{
			if(t.Format!==null)return t.Format(capt,lev,msg);
			if(parent)return parent.format(capt,lev,msg);
			return _default_format(capt,lev,msg);
		},
		write:(src)=>{
			if(t.Way!==null)t.Way(src);
			else if(parent)parent.write(src);
			else _default_way(src);
		},

		put:(lev,msg)=>{
			if(lev>=t.LEVEL_NAMES.length)return;
			if(lev<t.getShowable())return;
			var s=t.format(t.getCaption(),lev,msg);
			t.write(s);
		},

		tick:(msg)=>{t.put(t.LEVEL.TICK,msg);},
		trace:(msg)=>{t.put(t.LEVEL.TRACE,msg);},
		debug:(msg)=>{t.put(t.LEVEL.DEBUG,msg);},
		info:(msg)=>{t.put(t.LEVEL.INFO,msg);},
		notice:(msg)=>{t.put(t.LEVEL.NOTICE,msg);},
		warn:(msg)=>{t.put(t.LEVEL.WARN,msg);},
		fatal:(msg)=>{t.put(t.LEVEL.FATAL,msg);},
		crit:(msg)=>{t.put(t.LEVEL.CRIT,msg);},
		alert:(msg)=>{t.put(t.LEVEL.ALERT,msg);},
		emerg:(msg)=>{t.put(t.LEVEL.EMERG,msg);},
	}
	return t;
}

const mif=_create_local();
mif.name='YgEs_GlobalLogger';

export default mif;
