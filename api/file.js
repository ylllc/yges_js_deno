// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import HappeningManager from './happening.js';
import FS from './fs_ll.js';

// File Control ------------------------- //
(()=>{ // local namespace 

YgEs.File={
	name:'YgEs_FileControl',
	User:{},
	HappenTo:HappeningManager,

	Exists:(path)=>FS.Exists(path),
	IsFile:(path)=>FS.IsFile(path),

	Stat:(path,opt={})=>FS.Stat(path,opt),
	Load:(path,opt={})=>FS.Load(path,opt),
	Save:(path,data,opt={})=>FS.Save(path,data,opt),
	Remove:(path,opt={})=>FS.Remove(path,opt),

	Glob:(dir,ptn)=>FS.Glob(dir,ptn='*'),
}

})();
export default YgEs.File;
