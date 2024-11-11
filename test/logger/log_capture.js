// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Log Capture Test //

import test from '../../api/unittest.js';
import log from '../../api/logger.js';

// capture a log for test 
var subj=null;
log.Format=(capt,lev,msg)=>{
	return capt+':'+lev+':'+msg;
}
log.Way=(msg)=>{
	test.chk_strict(msg,subj,'captured log');
}

// set showable log level 
log.Showable=log.LEVEL.DEBUG;

// set global log caption 
log.Caption='Global';

var scenaria=[
	{
		title:'Log Capturer',
		proc:()=>{
			subj='Global:3:test-msg';
			log.info('test-msg');
		},
	},
]

test.run(scenaria);
