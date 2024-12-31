// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Dir from '../api/dir.js';
import File from '../api/file.js';
import Engine from '../api/engine.js';
import Timing from '../api/timing.js';
import Log from '../api/logger.js';

// Examples: File Control --------------- //

Engine.start();

// prepare diretories 
let basedir=Dir.target('..',false);
let tmpdir=basedir.subdir('tmp',true);

// start async procedure 
(async()=>{
	// wait for tmpdir ready 
	Log.info(tmpdir.getPath()+': '+(tmpdir.exists()?'already':'not'));
	let h_tmpdir=tmpdir.open();
	await Timing.syncKit(100,()=>{return h_tmpdir.isReady()}).promise();
	Log.info(tmpdir.getPath()+': '+(tmpdir.exists()?'ready':'not'));

	// quick accesses 
	let srcpath=basedir.relative('LICENSE');
	let dstpath=tmpdir.relative('LICENSE');
	let st=await File.stat(srcpath);
	Log.info('isDir: '+st.isDir());
	Log.info('isFile: '+st.isFile());
	Log.info('isSymLink: '+st.isSymLink());
	Log.info('DevID: '+st.getDevID());
	Log.info('Inode: '+st.getInode());
	Log.info('mode: '+st.getMode());
	Log.info('GID: '+st.getGID());
	Log.info('UID: '+st.getUID());
	Log.info('size: '+st.getSize());
	Log.info('aTime: '+st.getAccessTime());
	Log.info('mTime: '+st.getModifyTime());
	Log.info('cTime: '+st.getChangeTime());
	Log.info('bTime: '+st.getBirthTime());
	let data=await File.load(srcpath);
	await File.save(dstpath,data);

	let files=await File.glob(basedir.getPath());
	Log.info(files);

	// close tmpdir (still keep in filesystem) 
	h_tmpdir.close();

	Engine.sync((dmy)=>{
		Engine.shutdown();
	});
})();
