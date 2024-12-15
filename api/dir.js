// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Directory Control //

import hap_global from './happening.js';
import workmng from './worker.js';
import timing from './timing.js';
import fs from './fs_ll.js';

function _target(dir,prepare,parent){

	var ws={
		name:'YgEs_DirTarget',
		happen:mif.Happen.createLocal(),

		getPath:()=>dir,

		cb_open:(wk)=>{
			var done=false;
			timing.fromPromise(
				fs.mkdir(dir,{recursive:prepare}),
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
	var wk=workmng.standby(ws);

	wk.getPath=()=>dir;
	wk.subdir=(path,prepare)=>_target(dir+'/'+path,prepare,wk);
	wk.relative=(path)=>dir+'/'+path;

	wk.exists=()=>fs.exists(dir);

	return wk;
}

var mif={
	name:'YgEs_DirControl',
	User:{},
	Happen:hap_global,

	exists:(path)=>fs.exists(path),
	isDir:(path)=>fs.isDir(path),

	stat:(path,opt={})=>fs.stat(path,opt),
	mkdir:(path,opt={})=>fs.mkdir(path,opt),

	target:(dir,prepare)=>_target(dir,prepare,null),
}

export default mif;
