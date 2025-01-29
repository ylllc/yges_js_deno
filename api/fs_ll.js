// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import Timing from './timing.js';
import fs from 'node:fs';
import {walk} from 'jsr:@std/fs/walk';
import {globToRegExp} from 'jsr:@std/path';

// Low Level File Control for Node.js --- //
(()=>{ // local namespace 

function _initStat(path,stat){

	var t={
		name:'YgEs_FileStat',

		GetPath:()=>path,
		GetLowLevel:()=>stat,
		IsFile:()=>{
			if(!stat)return null;
			return stat.isFile();
		},
		IsDir:()=>{
			if(!stat)return null;
			return stat.isDirectory();
		},
		IsSymLink:()=>{
			if(!stat)return null;
			return stat.isSymbolicLink();
		},
		GetDevID:()=>{
			if(!stat)return null;
			return stat.dev;
		},
		GetInode:()=>{
			if(!stat)return null;
			return stat.ino;
		},
		GetMode:()=>{
			if(!stat)return null;
			return stat.mode;
		},
		GetGID:()=>{
			if(!stat)return null;
			return stat.gid;
		},
		GetUID:()=>{
			if(!stat)return null;
			return stat.uid;
		},
		GetSize:()=>{
			if(!stat)return null;
			return stat.size;
		},
		GetAccessTime:()=>{
			if(!stat)return null;
			return stat.atime;
		},
		GetModifyTime:()=>{
			if(!stat)return null;
			return stat.mtime;
		},
		GetChangeTime:()=>{
			if(!stat)return null;
			return stat.ctime;
		},
		GetBirthTime:()=>{
			if(!stat)return null;
			return stat.birthtime;
		},
	}
	return t;
}

const FS=YgEs.FS={
	name:'YgEs_FileLowLevel',
	User:{},

	Exists:(path)=>{
		return fs.existsSync(path);
	},
	MkDir:(path,opt={})=>{
		return fs.promises.mkdir(path,opt);
	},
	Stat:(path,opt={})=>{
		return Timing.ToPromise(async (ok,ng)=>{
			Timing.FromPromise(
				fs.promises.stat(path,opt),
				(res)=>{ok(_initStat(path,res));},
				(err)=>{ok(null);}
			);
		});
	},
	IsDir:(path)=>{
		return Timing.ToPromise(async (ok,ng)=>{
			Timing.FromPromise(
				FS.Stat(proc),
				(res)=>{ok(res.IsDir());},
				(err)=>{ok(false);}
			);
		});
	},
	IsFile:(path)=>{
		return Timing.ToPromise(async (ok,ng)=>{
			Timing.FromPromise(
				FS.Stat(proc),
				(res)=>{ok(res.IsFile());},
				(err)=>{ok(false);}
			);
		});
	},
	Load:(path,opt)=>{
		return fs.promises.readFile(path,opt);
	},
	Save:(path,data,opt)=>{
		return fs.promises.writeFile(path,data,opt);
	},
	Remove:(path,opt)=>{
		return fs.promises.rm(path,opt);
	},

	Glob:(dir,ptn='*')=>{
		return Timing.ToPromise(async (ok,ng)=>{

			try{
				let bp=dir+'/';
				let r=[]
				for await (let ent of walk(dir,{maxDepth:1,match:[globToRegExp(bp+ptn)]})){
					if(ent.path.length<=bp.length)continue; // avoid dirself 
					r.push(ent.name);
				}
				ok(r);
			}
			catch(e){
				ng(e);
			}
		});
	},
}

})();
export default YgEs.FS;
