// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// File Control //

import hap_global from './happening.js';
import workmng from './worker.js';
import timing from './timing.js';
import fs from './fs_ll.js';

var mif={
	name:'YgEs_FileControl',
	User:{},
	Happen:hap_global,

	exists:(path)=>fs.exists(path),
	isFile:(path)=>fs.isFile(path),

	stat:(path,opt={})=>fs.stat(path,opt),
	load:(path,opt={})=>fs.load(path,opt),
	save:(path,data,opt={})=>fs.save(path,data,opt),
	remove:(path,opt={})=>fs.remove(path,opt),
	
}

export default mif;
