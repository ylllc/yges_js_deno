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

	exists:(path)=>FS.exists(path),
	isFile:(path)=>FS.isFile(path),

	stat:(path,opt={})=>FS.stat(path,opt),
	load:(path,opt={})=>FS.load(path,opt),
	save:(path,data,opt={})=>FS.save(path,data,opt),
	remove:(path,opt={})=>FS.remove(path,opt),

	glob:(dir,ptn)=>FS.glob(dir,ptn='*'),
}

})();
export default YgEs.File;
