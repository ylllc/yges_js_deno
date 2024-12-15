// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Low Level File Control for Deno //

import timing from './timing.js';
import fs from 'node:fs';

function _initStat(stat){

	var t={
		getLowLevel:()=>stat,
		isFile:()=>{
			if(!stat)return null;
			return stat.isFile();
		},
		isDir:()=>{
			if(!stat)return null;
			return stat.isDirectory();
		},
		isSymLink:()=>{
			if(!stat)return null;
			return stat.isSymbolicLink();
		},
		getDevID:()=>{
			if(!stat)return null;
			return stat.dev;
		},
		getInode:()=>{
			if(!stat)return null;
			return stat.ino;
		},
		getMode:()=>{
			if(!stat)return null;
			return stat.mode;
		},
		getGID:()=>{
			if(!stat)return null;
			return stat.gid;
		},
		getUID:()=>{
			if(!stat)return null;
			return stat.uid;
		},
		getSize:()=>{
			if(!stat)return null;
			return stat.size;
		},
		getAccessTime:()=>{
			if(!stat)return null;
			return stat.atime;
		},
		getModifyTime:()=>{
			if(!stat)return null;
			return stat.mtime;
		},
		getChangeTime:()=>{
			if(!stat)return null;
			return stat.ctime;
		},
		getBirthTime:()=>{
			if(!stat)return null;
			return stat.birthtime;
		},
	}
	return t;
}

var mif={
	name:'YgEs_FileLowLevel',
	User:{},

	exists:(path)=>{
		return fs.existsSync(path);
	},
	mkdir:(path,opt={})=>{
		return fs.promises.mkdir(path,opt);
	},
	stat:(path,opt={})=>{
		return timing.toPromise(async (ok,ng)=>{
			timing.fromPromise(
				fs.promises.stat(path,opt),
				(res)=>{ok(_initStat(res));},
				(err)=>{ok(null);}
			);
		});
	},
	isDir:(path)=>{
		return timing.toPromise(async (ok,ng)=>{
			timing.fromPromise(
				mif.stat(proc),
				(res)=>{ok(res.isDir());},
				(err)=>{ok(false);}
			);
		});
	},
	isFile:(path)=>{
		return timing.toPromise(async (ok,ng)=>{
			timing.fromPromise(
				mif.stat(proc),
				(res)=>{ok(res.isFile());},
				(err)=>{ok(false);}
			);
		});
	},
	load:(path,opt)=>{
		return fs.promises.readFile(path,opt);
	},
	save:(path,data,opt)=>{
		return fs.promises.writeFile(path,data,opt);
	},
	remove:(path,opt)=>{
		return fs.promises.rm(path,opt);
	},

}

export default mif;
