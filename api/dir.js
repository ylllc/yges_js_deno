// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import HappeningManager from './happening.js';
import AgentManager from './agent.js';
import Timing from './timing.js';
import FS from './fs_ll.js';

// Directory Control -------------------- //
(()=>{ // local namespace 

function _target(dir,parent){

	var ws={
		Name:'YgEs.Dir.Target',
		HappenTo:(Dir.HappenTo??HappeningManager).CreateLocal(),

		OnOpen:(wk)=>{
			var done=false;
			Timing.FromPromise(
				FS.MkDir(dir,{recursive:true}),
				(res)=>{
					done=true;
				},
				(err)=>{
					ws.HappenTo.Happen(err);
				}
			);
			wk.WaitFor('MkDir done',()=>{return done;});
		},
	};
	if(parent)ws.Dependencies=[parent.Fetch()]
	var wk=AgentManager.StandBy(ws);

	wk.GetPath=()=>dir;
	wk.Exists=()=>FS.Exists(dir);
	wk.Relative=(path)=>dir+'/'+path;
	wk.SubDir=(path)=>_target(dir+'/'+path,wk);
	wk.Glob=(ptn='*')=>FS.Glob(dir,ptn);

	return wk;
}

let Dir=YgEs.Dir={
	Name:'YgEs.Dir.Control',
	User:{},
	_private_:{},

	HappenTo:HappeningManager,

	Exists:(path)=>FS.Exists(path),
	IsDir:(path)=>FS.IsDir(path),

	Stat:(path,opt={})=>FS.Stat(path,opt),
	MkDir:(path,opt={})=>FS.MkDir(path,opt),

	Target:(dir)=>_target(dir,null),
}

})();
export default YgEs.Dir;
