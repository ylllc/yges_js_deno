// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import HappeningManager from './happening.js';
import AgentManager from './agent.js';
import Timing from './timing.js';
import FS from './fs_ll.js';

// Directory Control -------------------- //
(()=>{ // local namespace 

function _target(dir,prepare,parent){

	var ws={
		name:'YgEs_DirTarget',
		happen:Dir.Happen.createLocal(),

		getPath:()=>dir,

		cb_open:(wk)=>{
			var done=false;
			Timing.fromPromise(
				FS.mkdir(dir,{recursive:prepare}),
				(res)=>{
					done=true;
				},
				(err)=>{
					ws.happen.happenError(err);
				}
			);
			wk.waitFor(()=>{return done;});
		},
	};
	if(parent)ws.delendencies=[parent.fetch()]
	var wk=AgentManager.standby(ws);

	wk.getPath=()=>dir;
	wk.subdir=(path,prepare)=>_target(dir+'/'+path,prepare,wk);
	wk.relative=(path)=>dir+'/'+path;

	wk.exists=()=>FS.exists(dir);

	return wk;
}

let Dir=YgEs.Dir={
	name:'YgEs_DirControl',
	User:{},
	Happen:HappeningManager,

	exists:(path)=>FS.exists(path),
	isDir:(path)=>FS.isDir(path),

	stat:(path,opt={})=>FS.stat(path,opt),
	mkdir:(path,opt={})=>FS.mkdir(path,opt),

	target:(dir,prepare)=>_target(dir,prepare,null),
}

})();
export default YgEs.Dir;
