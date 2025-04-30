// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Dir from '../api/dir.js';
import File from '../api/file.js';
import Engine from '../api/engine.js';
import Timing from '../api/timing.js';
import Log from '../api/logger.js';

// Example: File Control ---------------- //

Engine.Start();

// prepare diretories 
let basedir=Dir.Target('..');
let tmpdir=basedir.SubDir('tmp');

// start async procedure 
(async()=>{
	// wait for tmpdir ready 
	Log.Info(tmpdir.GetPath()+': '+(tmpdir.Exists()?'already':'not'));
	let h_tmpdir=tmpdir.Open();
	await Timing.SyncKit(100,()=>{return h_tmpdir.IsReady()}).ToPromise();
	Log.Info(tmpdir.GetPath()+': '+(tmpdir.Exists()?'ready':'not'));

	// quick accesses 
	let srcpath=basedir.Relative('LICENSE');
	let dstpath=tmpdir.Relative('LICENSE');
	let st=await File.Stat(srcpath);
	Log.Info('IsDir: '+st.IsDir());
	Log.Info('IsFile: '+st.IsFile());
	Log.Info('IsSymLink: '+st.IsSymLink());
	Log.Info('DevID: '+st.GetDevID());
	Log.Info('Inode: '+st.GetInode());
	Log.Info('Mode: '+st.GetMode());
	Log.Info('GID: '+st.GetGID());
	Log.Info('UID: '+st.GetUID());
	Log.Info('Size: '+st.GetSize());
	Log.Info('ATime: '+st.GetAccessTime());
	Log.Info('MTime: '+st.GetModifyTime());
	Log.Info('CTime: '+st.GetChangeTime());
	Log.Info('BTime: '+st.GetBirthTime());
	let data=await File.Load(srcpath);
	await File.Save(dstpath,data);

	let files=await File.Glob(basedir.GetPath());
	Log.Info(files);

	// close tmpdir (still keep in filesystem) 
	h_tmpdir.Close();

	Engine.Sync((dmy)=>{
		Engine.ShutDown();
	});
})();
