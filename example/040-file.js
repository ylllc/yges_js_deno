// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: File Control //

import dir from '../api/dir.js';
import file from '../api/file.js';
import engine from '../api/engine.js';
import timing from '../api/timing.js';
import log from '../api/logger.js';

engine.start();

// prepare diretories 
var basedir=dir.target('..',false);
var tmpdir=basedir.subdir('tmp',true);

// start async procedure 
(async()=>{
	// wait for tmpdir ready 
	log.info(tmpdir.getPath()+': '+(tmpdir.exists()?'already':'not'));
	var h_tmpdir=tmpdir.open();
	await timing.syncKit(100,()=>{return h_tmpdir.isReady()}).promise();
	log.info(tmpdir.getPath()+': '+(tmpdir.exists()?'ready':'not'));

	// quick accesses 
	var srcpath=basedir.relative('LICENSE');
	var dstpath=tmpdir.relative('LICENSE');
	var st=await file.stat(srcpath);
	log.info('isDir: '+st.isDir());
	log.info('isFile: '+st.isFile());
	log.info('isSymLink: '+st.isSymLink());
	log.info('DevID: '+st.getDevID());
	log.info('Inode: '+st.getInode());
	log.info('mode: '+st.getMode());
	log.info('GID: '+st.getGID());
	log.info('UID: '+st.getUID());
	log.info('size: '+st.getSize());
	log.info('aTime: '+st.getAccessTime());
	log.info('mTime: '+st.getModifyTime());
	log.info('cTime: '+st.getChangeTime());
	log.info('bTime: '+st.getBirthTime());
	var data=await file.load(srcpath);
	await file.save(dstpath,data);

	// close tmpdir (still keep in filesystem) 
	h_tmpdir.close();

	engine.sync((dmy)=>{
		engine.shutdown();
	});
})();
